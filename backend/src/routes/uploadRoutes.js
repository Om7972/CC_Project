const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getPresignedUploadUrl } = require('../controllers/uploadController');

const router = express.Router();

router.post('/presigned', verifyToken, getPresignedUploadUrl);

module.exports = router;
