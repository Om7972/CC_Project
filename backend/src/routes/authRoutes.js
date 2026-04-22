const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRequest } = require('../middleware/validation');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  googleAuthSchema,
  enable2FASchema,
  verify2FASchema,
  disable2FASchema
} = require('../validators/authValidators');
const {
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
} = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), resetPassword);
router.post('/verify-email', authLimiter, validateRequest(verifyEmailSchema), verifyEmail);
router.post('/resend-verification', authLimiter, validateRequest(resendVerificationSchema), resendVerification);
router.post('/google', authLimiter, validateRequest(googleAuthSchema), googleAuth);

// Protected routes
router.post('/logout', verifyToken, logout);
router.post('/refresh', refreshToken);
router.get('/me', verifyToken, getMe);

// 2FA routes
router.post('/2fa/enable', verifyToken, validateRequest(enable2FASchema), enable2FA);
router.post('/2fa/verify', verifyToken, validateRequest(verify2FASchema), verify2FA);
router.post('/2fa/disable', verifyToken, validateRequest(disable2FASchema), disable2FA);

// Session management
router.get('/sessions', verifyToken, getSessions);
router.delete('/sessions/:sessionId', verifyToken, deleteSession);

module.exports = router;
