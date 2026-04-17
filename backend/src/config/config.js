require('dotenv').config();

module.exports = {
  // MongoDB
  mongoUri: process.env.MONGO_URI,

  // AWS
  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET,
    sesFromEmail: process.env.AWS_SES_FROM_EMAIL,
    sqsQueueUrl: process.env.AWS_SQS_QUEUE_URL,
  },

  // Cognito
  cognito: {
    region: process.env.AWS_REGION,
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_CLIENT_ID,
    hostedUi: process.env.COGNITO_HOSTED_UI_URL,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },

  // Server
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
};
