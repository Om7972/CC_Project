const express = require('express');
const { verifyToken, verifyRole } = require('../middleware/auth');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/featured', productController.getFeaturedProducts);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

router.post('/', verifyToken, verifyRole('vendor'), productController.createProduct);
router.put('/:id', verifyToken, verifyRole('vendor'), productController.updateProduct);
router.delete('/:id', verifyToken, verifyRole('vendor'), productController.deleteProduct);

router.post('/upload/presigned-url', verifyToken, productController.getPresignedUrl);

module.exports = router;
