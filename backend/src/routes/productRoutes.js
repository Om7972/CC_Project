const express = require('express');
const { verifyToken, verifyRole, optionalToken } = require('../middleware/auth');
const productController = require('../controllers/productController');
const recommendationController = require('../controllers/recommendationController');

const router = express.Router();

router.get('/featured', productController.getFeaturedProducts);
router.get('/meta/categories', productController.getCategories);
router.get('/recommendations', optionalToken, recommendationController.getRecommendations);
router.post('/recommendations', optionalToken, recommendationController.getRecommendations);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

router.post('/', verifyToken, verifyRole('vendor'), productController.createProduct);
router.put('/:id', verifyToken, verifyRole('vendor'), productController.updateProduct);
router.delete('/:id', verifyToken, verifyRole('vendor'), productController.deleteProduct);

router.post('/upload/presigned-url', verifyToken, productController.getPresignedUrl);

module.exports = router;
