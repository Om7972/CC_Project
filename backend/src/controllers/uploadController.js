const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { getPresignedUrl } = require('../services/s3Service');
const User = require('../models/User');

const UPLOAD_LIMITS = {
  free: {
    avatar: 2 * 1024 * 1024, // 2MB
    product: 5 * 1024 * 1024, // 5MB
    banner: 5 * 1024 * 1024,
    digital: 0 // Not allowed
  },
  pro: {
    avatar: 5 * 1024 * 1024,
    product: 10 * 1024 * 1024,
    banner: 10 * 1024 * 1024,
    digital: 100 * 1024 * 1024 // 100MB
  },
  enterprise: {
    avatar: 10 * 1024 * 1024,
    product: 20 * 1024 * 1024,
    banner: 20 * 1024 * 1024,
    digital: 500 * 1024 * 1024 // 500MB
  }
};

// POST /api/upload/presigned
const getPresignedUploadUrl = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { type, contentType, fileName, fileSize } = req.body;

  if (!['avatar', 'product', 'banner', 'digital'].includes(type)) {
    return ApiResponse.error(res, 'Invalid upload type', 400);
  }

  // Get user plan
  const user = await User.findById(userId).select('plan');
  const plan = user?.plan || 'free';

  // Check size limits
  const sizeLimit = UPLOAD_LIMITS[plan][type];
  if (sizeLimit === 0) {
    return ApiResponse.error(res, `${type} uploads not allowed for ${plan} plan`, 403);
  }

  if (fileSize && fileSize > sizeLimit) {
    return ApiResponse.error(res, `File size exceeds limit of ${sizeLimit / (1024 * 1024)}MB for ${plan} plan`, 400);
  }

  // Generate S3 key
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${type}s/${userId}/${timestamp}-${sanitizedFileName}`;

  // Get presigned URL
  const uploadUrl = await getPresignedUrl(
    process.env.AWS_S3_BUCKET,
    key,
    contentType,
    300 // 5 minutes expiry
  );

  const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return ApiResponse.success(res, {
    uploadUrl,
    fileUrl,
    key,
    expiresIn: 300
  }, 'Presigned URL generated successfully');
});

module.exports = {
  getPresignedUploadUrl
};
