const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  updateProfileSchema,
  updatePreferencesSchema,
  updatePasswordSchema,
  addAddressSchema
} = require('../validators/userValidators');
const {
  getProfile,
  updateProfile,
  getAvatarUploadUrl,
  confirmAvatar,
  deleteAvatar,
  updatePassword,
  updatePreferences,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification
} = require('../controllers/userController');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Profile routes
router.get('/profile', getProfile);
router.patch('/profile', validate(updateProfileSchema), updateProfile);

// Avatar routes
router.post('/avatar', getAvatarUploadUrl);
router.patch('/avatar/confirm', confirmAvatar);
router.delete('/avatar', deleteAvatar);

// Password & preferences
router.patch('/password', validate(updatePasswordSchema), updatePassword);
router.patch('/preferences', validate(updatePreferencesSchema), updatePreferences);

// Wishlist routes
router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', addToWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);

// Address routes
router.get('/addresses', getAddresses);
router.post('/addresses', validate(addAddressSchema), addAddress);
router.patch('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.patch('/addresses/:id/default', setDefaultAddress);

// Notification routes
router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.patch('/notifications/:id/read', markNotificationRead);
router.delete('/notifications/:id', deleteNotification);

module.exports = router;
