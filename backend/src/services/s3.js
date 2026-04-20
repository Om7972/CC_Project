const { GetObjectCommand, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3 } = require('../config/aws');

const bucket = process.env.AWS_S3_BUCKET;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/zip']);

const generatePresignedUploadUrl = async (key, contentType, maxSizeBytes) => {
  if (!allowedTypes.has(contentType)) throw new Error('Unsupported content type');
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType, ContentLength: maxSizeBytes });
  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 900 });
  return { uploadUrl, fileUrl: `https://${bucket}.s3.amazonaws.com/${key}` };
};

const generatePresignedDownloadUrl = async (key, expiresIn = 300) =>
  getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn });

const deleteObject = async (key) => s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
const copyObject = async (sourceKey, destKey) =>
  s3.send(new CopyObjectCommand({ Bucket: bucket, CopySource: `${bucket}/${sourceKey}`, Key: destKey }));

module.exports = { generatePresignedUploadUrl, generatePresignedDownloadUrl, deleteObject, copyObject, allowedTypes };
