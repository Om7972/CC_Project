const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const { connect } = require('../lib/db');
const { getModels } = require('../lib/models');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

const SIZES = [
  { key: 'w800', width: 800 },
  { key: 'w400', width: 400 },
  { key: 'w150', width: 150 },
];

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function parseProductIdFromKey(objectKey) {
  const m = /^raw\/products\/([a-f0-9]{24})\//i.exec(objectKey);
  return m ? m[1] : null;
}

module.exports.handler = async (event) => {
  await connect();
  const { Product } = getModels();
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET is not set');
  }

  const baseUrl = (process.env.CDN_BASE_URL || '').replace(/\/$/, '');
  const publicBase = baseUrl || `https://${bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`;

  for (const record of event.Records || []) {
    try {
      const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
      if (!objectKey.startsWith('raw/')) continue;

      const productId = parseProductIdFromKey(objectKey);
      const getCmd = new GetObjectCommand({ Bucket: bucket, Key: objectKey });
      const obj = await s3.send(getCmd);
      const buf = await streamToBuffer(obj.Body);

      const baseName = objectKey.split('/').pop() || 'image';
      const stem = baseName.replace(/\.[^.]+$/, '');
      const contentType = 'image/webp';

      const urls = {};

      for (const { key, width } of SIZES) {
        const resized = await sharp(buf)
          .rotate()
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();

        const outKey = `processed/products/${productId || 'unknown'}/${stem}-${key}.webp`;
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: outKey,
            Body: resized,
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000, immutable',
          })
        );
        urls[key] = `${publicBase}/${outKey}`;
      }

      if (productId) {
        await Product.findByIdAndUpdate(
          productId,
          {
            $set: {
              processedImageUrls: urls,
              thumbnail: urls.w400 || urls.w800,
            },
          },
          { new: true }
        );
      }
    } catch (err) {
      console.error('imageResizer record failed', err);
    }
  }

  return { ok: true };
};
