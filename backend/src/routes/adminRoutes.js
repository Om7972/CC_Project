const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getStats,
  getUsers,
  banUser,
  unbanUser,
  changeUserRole,
  getVendors,
  approveVendor,
  rejectVendor,
  suspendVendor,
  getOrders,
  getProducts,
  toggleFeatureProduct,
  getAnalytics
} = require('../controllers/adminController');

const router = express.Router();

// All routes require admin role
router.use(verifyToken);
router.use(requireRole('admin'));

// Platform stats
router.get('/stats', getStats);
router.get('/analytics', getAnalytics);

// User management
router.get('/users', getUsers);
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/unban', unbanUser);
router.patch('/users/:id/role', changeUserRole);

// Vendor management
router.get('/vendors', getVendors);
router.patch('/vendors/:id/approve', approveVendor);
router.patch('/vendors/:id/reject', rejectVendor);
router.patch('/vendors/:id/suspend', suspendVendor);

// Order management
router.get('/orders', getOrders);

// Product management
router.get('/products', getProducts);
router.patch('/products/:id/feature', toggleFeatureProduct);

module.exports = router;
