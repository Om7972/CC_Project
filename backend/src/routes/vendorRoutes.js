const express = require('express');
const { verifyToken, verifyRole } = require('../middleware/auth');
const vendorController = require('../controllers/vendorController');

const router = express.Router();

router.post('/register', verifyToken, vendorController.registerVendor);
router.get('/profile', verifyToken, vendorController.getMyVendorProfile);
router.put('/profile', verifyToken, vendorController.updateVendorProfile);
router.get('/earnings', verifyToken, verifyRole('vendor'), vendorController.getVendorEarnings);

router.get('/', vendorController.getAllVendors);
router.get('/:id', vendorController.getVendorProfile);
router.get('/:vendorId/products', vendorController.getVendorProducts);

router.post('/:vendorId/approve', verifyToken, verifyRole('admin'), vendorController.approveVendor);
router.post('/:vendorId/reject', verifyToken, verifyRole('admin'), vendorController.rejectVendor);

module.exports = router;
