const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const generatePresignedUrl = async (fileKey, contentType) => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

const generateFileKey = (vendorId, type, fileName, productId = null) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  const extension = fileName.includes('.') ? fileName.split('.').pop() : 'jpg';
  if (type === 'products' && productId) {
    return `raw/products/${productId}/${timestamp}-${random}.${extension}`;
  }
  return `${type}/${vendorId}/${timestamp}-${random}.${extension}`;
};

const deleteFromS3 = async (fileKey) => {
  try {
    const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
    });
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};

module.exports = {
  generatePresignedUrl,
  generateFileKey,
  deleteFromS3,
  s3Client,
};
