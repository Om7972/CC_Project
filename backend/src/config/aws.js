const { S3Client } = require('@aws-sdk/client-s3');
const { SESClient } = require('@aws-sdk/client-ses');
const { SQSClient } = require('@aws-sdk/client-sqs');

const region = process.env.AWS_REGION || 'us-east-1';
const credentials = process.env.AWS_ACCESS_KEY_ID
  ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  : undefined;

const s3 = new S3Client({ region, credentials });
const ses = new SESClient({ region, credentials });
const sqs = new SQSClient({ region, credentials });

module.exports = { s3, ses, sqs };
