const express = require('express');
const { verifyToken, verifyRole } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authLimiter, authController.login);
router.post('/google-auth', authLimiter, authController.googleAuth);
router.post('/logout', verifyToken, authController.logout);
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.post('/refresh-token', verifyToken, authController.refreshToken);

module.exports = router;
