const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { verifyIdToken, createOrUpdateLocalUser } = require('../services/cognitoService');

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      cognitoId: user.cognitoId,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const login = async (req, res, next) => {
  try {
    const { idToken, email, password } = req.body;

    let user;

    if (idToken) {
      const decodedToken = await verifyIdToken(idToken);
      user = await createOrUpdateLocalUser(User, decodedToken);
    } else {
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      user = await User.findOne({ email }).select('+password');

      if (!user || !user.password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    const internalToken = generateToken(user);

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

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'buyer',
      loginProvider: 'local',
      isVerified: true,
      isActive: true,
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
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
  register,
  googleAuth,
  logout,
  getProfile,
  updateProfile,
  refreshToken,
};
