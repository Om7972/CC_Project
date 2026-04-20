const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { get, set, CacheKeys } = require('../config/redis');

const verifyJWT = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

const attachUser = async (req, res, next) => {
  if (!req.user?.id && !req.user?._id) return next();
  const userId = req.user.id || req.user._id;
  const cacheKey = `${CacheKeys.USER_PROFILE}_${userId}`;
  let user = await get(cacheKey);
  if (!user) {
    user = await User.findById(userId).lean();
    if (user) await set(cacheKey, user, 60 * 5);
  }
  req.currentUser = user || null;
  next();
};

const optionalToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (_) {
    // ignore invalid optional token
  }
  next();
};

const verifyToken = verifyJWT;
const verifyRole = requireRole;

module.exports = { verifyJWT, verifyToken, attachUser, requireRole, verifyRole, optionalToken };
