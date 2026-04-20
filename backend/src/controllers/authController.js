const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { get, set, del, CacheKeys } = require('../config/redis');
const { 
  verifyIdToken, 
  createOrUpdateLocalUser,
  signUpUser,
  authenticateUser,
  forgotPassword: cognitoForgotPassword,
  confirmForgotPassword,
  confirmSignUp,
  resendConfirmationCode,
  changePassword: cognitoChangePassword,
  globalSignOut,
  generate2FASecret,
  verify2FAToken,
  generateQRCode
} = require('../services/cognitoService');
const { sendMessage } = require('../services/sqsService');

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      cognitoId: user.cognitoId,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      type: 'refresh'
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return ApiResponse.conflict(res, 'Email already registered');
  }

  try {
    // Create user in Cognito
    await signUpUser(email, password, name);
    
    // Create user in local DB
    const user = await User.create({
      email,
      displayName: name,
      name,
      role: 'buyer',
      loginProvider: 'cognito',
      isEmailVerified: false,
      isActive: true,
    });

    // Send welcome email via SQS
    await sendMessage(process.env.EMAIL_QUEUE_URL, {
      type: 'WELCOME_EMAIL',
      to: email,
      data: { name }
    });

    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    return ApiResponse.created(res, {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.displayName,
        role: user.role,
        avatar: user.avatar,
      }
    }, 'Registration successful. Please verify your email.');
  } catch (error) {
    if (error.name === 'UsernameExistsException') {
      return ApiResponse.conflict(res, 'Email already registered in Cognito');
    }
    throw error;
  }
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return ApiResponse.unauthorized(res, 'Invalid credentials');
  }

  if (user.isBanned) {
    return ApiResponse.forbidden(res, `Account banned: ${user.banReason || 'Contact support'}`);
  }

  try {
    // Authenticate with Cognito
    const authResult = await authenticateUser(email, password);
    
    // Check 2FA
    if (user.twoFactorEnabled) {
      // Return temporary token requiring 2FA
      const tempToken = jwt.sign({ userId: user._id, requires2FA: true }, process.env.JWT_SECRET, { expiresIn: '5m' });
      return ApiResponse.success(res, { tempToken, requires2FA: true }, 'Please provide 2FA code');
    }

    // Log login history
    const loginEntry = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      device: req.headers['user-agent']?.split(' ')[0] || 'Unknown',
      timestamp: new Date()
    };
    user.loginHistory.push(loginEntry);
    user.lastSeen = new Date();
    await user.save();

    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    return ApiResponse.success(res, {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.displayName,
        role: user.role,
        avatar: user.avatar,
        plan: user.plan
      }
    }, 'Login successful');
  } catch (error) {
    if (error.name === 'NotAuthorizedException' || error.name === 'UserNotFoundException') {
      return ApiResponse.unauthorized(res, 'Invalid credentials');
    }
    throw error;
  }
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    // Blacklist token in Redis
    await set(`blacklist:${token}`, true, 60 * 15); // 15 min TTL
  }

  return ApiResponse.success(res, null, 'Logged out successfully');
});

// POST /api/auth/refresh
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return ApiResponse.unauthorized(res, 'Refresh token required');
  }

  try {
    // Check if blacklisted
    const isBlacklisted = await get(`blacklist:${token}`);
    if (isBlacklisted) {
      return ApiResponse.unauthorized(res, 'Token has been revoked');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return ApiResponse.unauthorized(res, 'Invalid token type');
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.isBanned) {
      return ApiResponse.unauthorized(res, 'User not found or banned');
    }

    const newAccessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    return ApiResponse.success(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }, 'Token refreshed successfully');
  } catch (error) {
    return ApiResponse.unauthorized(res, 'Invalid or expired refresh token');
  }
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if email exists
    return ApiResponse.success(res, null, 'If email exists, password reset link has been sent');
  }

  try {
    await cognitoForgotPassword(email);
    
    // Send reset email via SQS
    await sendMessage(process.env.EMAIL_QUEUE_URL, {
      type: 'PASSWORD_RESET',
      to: email,
      data: { name: user.displayName }
    });

    return ApiResponse.success(res, null, 'Password reset code sent to your email');
  } catch (error) {
    throw error;
  }
});

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    await confirmForgotPassword(email, code, newPassword);
    return ApiResponse.success(res, null, 'Password reset successful');
  } catch (error) {
    if (error.name === 'CodeMismatchException') {
      return ApiResponse.error(res, 'Invalid or expired code', 400);
    }
    throw error;
  }
});

// POST /api/auth/verify-email
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  try {
    await confirmSignUp(email, code);
    
    // Update user in DB
    await User.findOneAndUpdate({ email }, { isEmailVerified: true });

    return ApiResponse.success(res, null, 'Email verified successfully');
  } catch (error) {
    if (error.name === 'CodeMismatchException') {
      return ApiResponse.error(res, 'Invalid or expired code', 400);
    }
    throw error;
  }
});

// POST /api/auth/resend-verification
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    await resendConfirmationCode(email);
    return ApiResponse.success(res, null, 'Verification code sent');
  } catch (error) {
    throw error;
  }
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const cacheKey = `${CacheKeys.USER_PROFILE}_${userId}`;

  // Check cache
  let user = await get(cacheKey);
  
  if (!user) {
    user = await User.findById(userId).lean();
    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }
    // Cache for 5 minutes
    await set(cacheKey, user, 60 * 5);
  }

  return ApiResponse.success(res, user, 'Profile retrieved successfully');
});

// POST /api/auth/google
const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  const decodedToken = await verifyIdToken(idToken);
  const user = await createOrUpdateLocalUser(User, decodedToken);

  // Log login history
  const loginEntry = {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    device: 'Google OAuth',
    timestamp: new Date()
  };
  user.loginHistory.push(loginEntry);
  user.lastSeen = new Date();
  await user.save();

  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  return ApiResponse.success(res, {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.displayName,
      role: user.role,
      avatar: user.avatar,
      plan: user.plan
    }
  }, 'Google authentication successful');
});

// POST /api/auth/2fa/enable
const enable2FA = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const user = await User.findById(userId);

  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }

  if (user.twoFactorEnabled) {
    return ApiResponse.error(res, '2FA already enabled', 400);
  }

  const secret = generate2FASecret(user.email);
  const qrCodeUrl = await generateQRCode(secret.otpauth_url);

  // Store secret temporarily (not enabled yet)
  user.twoFactorSecret = secret.base32;
  await user.save();

  return ApiResponse.success(res, {
    secret: secret.base32,
    qrCode: qrCodeUrl
  }, 'Scan QR code with authenticator app');
});

// POST /api/auth/2fa/verify
const verify2FA = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { code } = req.body;

  const user = await User.findById(userId);
  if (!user || !user.twoFactorSecret) {
    return ApiResponse.error(res, '2FA not initialized', 400);
  }

  const isValid = verify2FAToken(user.twoFactorSecret, code);
  
  if (!isValid) {
    return ApiResponse.error(res, 'Invalid 2FA code', 400);
  }

  user.twoFactorEnabled = true;
  await user.save();

  // Invalidate cache
  await del(`${CacheKeys.USER_PROFILE}_${userId}`);

  return ApiResponse.success(res, null, '2FA enabled successfully');
});

// POST /api/auth/2fa/disable
const disable2FA = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { code } = req.body;

  const user = await User.findById(userId);
  if (!user || !user.twoFactorEnabled) {
    return ApiResponse.error(res, '2FA not enabled', 400);
  }

  const isValid = verify2FAToken(user.twoFactorSecret, code);
  
  if (!isValid) {
    return ApiResponse.error(res, 'Invalid 2FA code', 400);
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save();

  // Invalidate cache
  await del(`${CacheKeys.USER_PROFILE}_${userId}`);

  return ApiResponse.success(res, null, '2FA disabled successfully');
});

// GET /api/auth/sessions
const getSessions = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const user = await User.findById(userId).select('loginHistory');

  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }

  return ApiResponse.success(res, user.loginHistory, 'Sessions retrieved successfully');
});

// DELETE /api/auth/sessions/:sessionId
const deleteSession = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { sessionId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }

  user.loginHistory = user.loginHistory.filter(session => session._id.toString() !== sessionId);
  await user.save();

  return ApiResponse.success(res, null, 'Session revoked successfully');
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  getMe,
  googleAuth,
  enable2FA,
  verify2FA,
  disable2FA,
  getSessions,
  deleteSession
};
