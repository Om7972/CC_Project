# CloudMart Setup Guide

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Docker & Docker Compose ([Download](https://www.docker.com/products/docker-desktop))
- AWS Account with configured credentials
- Stripe Account for payments
- MongoDB (local or Atlas)

## AWS Setup

### 1. Create S3 Bucket for Product Images
```bash
aws s3 mb s3://cloudmart-products --region us-east-1
```

### 2. Create Cognito User Pool
1. Go to AWS Cognito
2. Create new user pool
3. Configure email/password authentication
4. Add Google OAuth provider
5. Create app client
6. Copy: User Pool ID, Client ID

### 3. Configure SES for Emails
1. Go to AWS SES
2. Verify sender email address
3. Request production access (if needed)

### 4. Create SQS Queue
1. Create queue: `cloudmart-order-queue`
2. Copy queue URL

### 5. Create IAM User for Application
1. Create IAM user with S3, SES, SQS, Cognito permissions
2. Generate access key and secret
3. Store credentials securely

## Local Development Setup

### Step 1: Clone & Setup Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your AWS credentials:
```env
MONGO_URI=mongodb://admin:password@localhost:27017/cloudmart?authSource=admin
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=cloudmart-products
AWS_SES_FROM_EMAIL=noreply@cloudmart.com
AWS_SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/ACCOUNT_ID/cloudmart-order-queue
COGNITO_USER_POOL_ID=us-east-1_xxxxx
COGNITO_CLIENT_ID=xxxxx
JWT_SECRET=your_super_secret_key_dev_only
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Install and start:
```bash
npm install
npm run dev
```

### Step 2: Setup Frontend

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_COGNITO_DOMAIN=https://cloudmart.auth.us-east-1.amazoncognito.com
VITE_COGNITO_CLIENT_ID=your_cognito_client_id
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

Install and start:
```bash
npm install
npm run dev
```

## Docker Compose Setup (Recommended)

### Quick Start
```bash
# 1. Copy environment file
cp backend/.env.example backend/.env

# 2. Create .env.docker at root for compose variables
echo "AWS_ACCESS_KEY_ID=your_key" > .env.docker
echo "AWS_SECRET_ACCESS_KEY=your_secret" >> .env.docker
echo "COGNITO_USER_POOL_ID=your_pool_id" >> .env.docker
echo "COGNITO_CLIENT_ID=your_client_id" >> .env.docker
echo "AWS_SQS_QUEUE_URL=your_queue_url" >> .env.docker
echo "STRIPE_SECRET_KEY=your_stripe_key" >> .env.docker
echo "STRIPE_PUBLISHABLE_KEY=your_stripe_pub_key" >> .env.docker

# 3. Start all services
docker-compose up
```

### Access Points
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MongoDB: localhost:27017
- MongoDB UI: http://localhost:8081 (optional, add mongo-express to compose)

## Testing the Application

### 1. Test Backend Health
```bash
curl http://localhost:5000/health
# Response: {"status":"OK","timestamp":"..."}
```

### 2. Create Test User
```bash
# Use Cognito console to create test user
# Or through the Register endpoint
```

### 3. Test API Endpoints
Use Postman or Insomnia with this collection:

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "idToken": "your_cognito_id_token"
}
```

### 4. Test Frontend
1. Navigate to http://localhost:5173
2. Click "Register" → complete signup
3. Login with your account
4. Add product to cart
5. Navigate to checkout

## Common Issues & Solutions

### MongoDB Connection Failed
```bash
# Check MongoDB is running
docker exec cloudmart-mongodb mongosh --eval "db.adminCommand('ping')"

# Reset MongoDB
docker-compose down -v
docker-compose up
```

### AWS Credentials Invalid
```bash
# Verify AWS CLI credentials
aws sts get-caller-identity

# Update .env with correct credentials
```

### Cognito Token Issues
1. Verify Client ID matches in .env
2. Check Cognito domain is correct
3. Ensure redirect URI is configured in Cognito

### CORS Errors
Check frontend URL in backend .env:
```env
FRONTEND_URL=http://localhost:5173
```

## Database Seeding (Optional)

Create a seed script in `backend/src/scripts/seed.js`:

```javascript
const mongoose = require('mongoose');
const User = require('../models/User');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing data
    await User.deleteMany({});

    // Create test users
    await User.create({
      cognitoId: 'test-user-1',
      email: 'buyer@test.com',
      name: 'Test Buyer',
      role: 'buyer',
      isVerified: true,
    });

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
```

Run with: `node src/scripts/seed.js`

## Deployment Checklist

### Backend
- [ ] Set NODE_ENV to production
- [ ] Verify all environment variables
- [ ] Enable HTTPS/SSL
- [ ] Configure rate limiting
- [ ] Setup monitoring and logging
- [ ] Configure database backups

### Frontend
- [ ] Build for production: `npm run build`
- [ ] Update API URL to production
- [ ] Configure Cognito for production domain
- [ ] Update Stripe keys for production
- [ ] Enable gzip compression
- [ ] Setup CDN

## Useful Commands

```bash
# Backend
npm run dev          # Development server
npm test            # Run tests
npm run lint        # Lint code

# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview build

# Docker
docker-compose logs -f          # View logs
docker-compose restart backend  # Restart service
docker-compose down -v          # Reset everything
```

## Security Best Practices

1. **Environment Variables**
   - Never commit .env files
   - Use strong JWT_SECRET
   - Rotate AWS credentials regularly

2. **Authentication**
   - Use Cognito's hosted UI where possible
   - Implement refresh token rotation
   - Validate tokens properly

3. **CORS**
   - Whitelist specific origins
   - Don't use wildcard in production

4. **Database**
   - Use MongoDB Atlas for production
   - Enable IP whitelisting
   - Regular backups

5. **S3 Uploads**
   - Use presigned URLs only
   - Set expiration time (1 hour)
   - Validate file types

## Next Steps

1. ✅ Complete setup
2. Customize branding
3. Add more features (wishlist, reviews, filters)
4. Setup email templates
5. Configure payment webhooks
6. Setup analytics
7. Deploy to production

## Support Resources

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [AWS SDK Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/)
- [Stripe Docs](https://stripe.com/docs)
