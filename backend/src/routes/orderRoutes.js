const express = require('express');
const { verifyToken, verifyRole } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.post('/', verifyToken, verifyRole('buyer'), orderController.createOrder);
router.get('/', verifyToken, orderController.getOrders);
router.get('/:id', verifyToken, orderController.getOrderById);
router.post('/confirm-payment', verifyToken, orderController.confirmPayment);
router.put('/:id/status', verifyToken, orderController.updateOrderStatus);

module.exports = router;
