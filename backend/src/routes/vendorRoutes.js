const express = require('express');
const { verifyToken, requireRole, optionalToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const {
  registerVendorSchema,
  updateVendorSchema,
  updateOrderStatusSchema,
  requestPayoutSchema
} = require('../validators/vendorValidators');
const {
  registerVendor,
  getMyVendor,
  updateMyVendor,
  getLogoUploadUrl,
  getBannerUploadUrl,
  getDashboard,
  getAnalytics,
  getVendorOrders,
  updateOrderStatus,
  getEarnings,
  requestPayout,
  createStripeConnect,
  stripeConnectCallback,
  getVendorStorefront,
  listVendors
} = require('../controllers/vendorController');

const router = express.Router();

// Public routes
router.get('/', listVendors);
router.get('/:storeSlug', getVendorStorefront);

// Protected vendor routes
router.post('/register', verifyToken, validateRequest(registerVendorSchema), registerVendor);
router.get('/me', verifyToken, requireRole('vendor', 'admin'), getMyVendor);
router.patch('/me', verifyToken, requireRole('vendor', 'admin'), validateRequest(updateVendorSchema), updateMyVendor);
router.post('/me/logo', verifyToken, requireRole('vendor', 'admin'), getLogoUploadUrl);
router.post('/me/banner', verifyToken, requireRole('vendor', 'admin'), getBannerUploadUrl);
router.get('/me/dashboard', verifyToken, requireRole('vendor', 'admin'), getDashboard);
router.get('/me/analytics', verifyToken, requireRole('vendor', 'admin'), getAnalytics);
router.get('/me/orders', verifyToken, requireRole('vendor', 'admin'), getVendorOrders);
router.patch('/me/orders/:orderId/status', verifyToken, requireRole('vendor', 'admin'), validateRequest(updateOrderStatusSchema), updateOrderStatus);
router.get('/me/earnings', verifyToken, requireRole('vendor', 'admin'), getEarnings);
router.post('/me/payout', verifyToken, requireRole('vendor', 'admin'), validateRequest(requestPayoutSchema), requestPayout);
router.post('/me/stripe/connect', verifyToken, requireRole('vendor', 'admin'), createStripeConnect);
router.get('/me/stripe/connect/callback', verifyToken, requireRole('vendor', 'admin'), stripeConnectCallback);

module.exports = router;
