# CloudMart Backend - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- MongoDB running (local or cloud)
- Redis running (local or cloud)
- AWS account (for S3, SES, SQS, Cognito)
- Stripe account

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Minimum required for local development
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/cloudmart
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# AWS (get from AWS Console)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=cloudmart-products

# Cognito (create User Pool in AWS Console)
COGNITO_USER_POOL_ID=us-east-1_xxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxx

# Stripe (get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Step 3: Start Services

**Option A: Using Docker (Recommended)**
```bash
docker-compose up -d
```

**Option B: Manual**
```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Redis
redis-server

# Terminal 3: Start Backend
npm run dev
```

### Step 4: Test the API
```bash
# Health check
curl http://localhost:5000/health

# Should return: {"status":"OK","timestamp":"..."}
```

## 📝 Test with Sample Requests

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "name": "Test User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

Save the `accessToken` from the response.

### 3. Get Profile
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Get Subscription Plans
```bash
curl http://localhost:5000/api/subscriptions/plans
```

## 🔧 Common Issues & Solutions

### Issue: MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running
```bash
# Check if MongoDB is running
mongosh

# If not, start it
mongod
```

### Issue: Redis Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution:** Make sure Redis is running
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# If not, start it
redis-server
```

### Issue: AWS Credentials Error
```
Error: Missing credentials in config
```
**Solution:** 
1. Check `.env` file has AWS credentials
2. Verify credentials are correct in AWS Console
3. Ensure IAM user has required permissions

### Issue: Stripe Webhook Signature Failed
```
Error: Webhook signature verification failed
```
**Solution:** Use Stripe CLI for local testing
```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/subscriptions/webhook/stripe

# Copy the webhook signing secret to .env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## 📚 Next Steps

1. **Read the Documentation**
   - [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference
   - [README.md](./README.md) - Detailed setup and features
   - [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - What's implemented

2. **Set Up AWS Services**
   - Create Cognito User Pool
   - Create S3 bucket
   - Create SQS queues
   - Configure SES

3. **Configure Stripe**
   - Create products and prices
   - Set up webhook endpoint
   - Test payment flow

4. **Test All Endpoints**
   - Use Postman collection (create one)
   - Test authentication flow
   - Test subscription flow
   - Test vendor registration
   - Test file uploads

5. **Deploy to Production**
   - Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
   - Set up monitoring
   - Configure backups

## 🎯 Quick Test Checklist

- [ ] Server starts without errors
- [ ] Health endpoint returns OK
- [ ] Can register a new user
- [ ] Can login and get token
- [ ] Can access protected endpoint with token
- [ ] Can get subscription plans
- [ ] MongoDB connection working
- [ ] Redis connection working

## 📞 Need Help?

- **Documentation:** Check the docs folder
- **Issues:** Create a GitHub issue
- **Email:** support@cloudmart.com

## 🎉 You're Ready!

Your CloudMart backend is now running. Start building your frontend or test the API endpoints!

**API Base URL:** `http://localhost:5000/api`

**Available Endpoints:**
- `/api/auth` - Authentication
- `/api/users` - User management
- `/api/subscriptions` - Subscriptions
- `/api/products` - Products
- `/api/orders` - Orders
- `/api/vendors` - Vendors
- `/api/admin` - Admin panel
- `/api/chat` - Chat
- `/api/upload` - File uploads

Happy coding! 🚀
