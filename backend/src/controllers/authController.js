const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { verifyIdToken, createOrUpdateLocalUser } = require('../services/cognitoService');

const login = async (req, res, next) => {
  try {
    const { idToken, accessToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token required' });
    }

    // Verify token from Cognito
    const decodedToken = await verifyIdToken(idToken);
    
    // Create or update user in local database
    const user = await createOrUpdateLocalUser(User, decodedToken);

    // Generate JWT for internal use
    const internalToken = jwt.sign(
      {
        userId: user._id,
        cognitoId: user.cognitoId,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: internalToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token required' });
    }

    const decodedToken = await verifyIdToken(idToken);
    const user = await createOrUpdateLocalUser(User, decodedToken);

    const internalToken = jwt.sign(
      {
        userId: user._id,
        cognitoId: user.cognitoId,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: internalToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone, avatar, address },
      { new: true, runValidators: true }
    );

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const refreshToken = (req, res) => {
  try {
    const user = req.user;
    
    const newToken = jwt.sign(
      {
        userId: user.userId,
        cognitoId: user.cognitoId,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

module.exports = {
  login,
  googleAuth,
  logout,
  getProfile,
  updateProfile,
  refreshToken,
};
