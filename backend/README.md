# CloudMart Backend

Node.js + Express.js backend for the CloudMart multi-vendor marketplace with comprehensive API endpoints.

## Features

- **Authentication & Authorization**
  - JWT authentication with AWS Cognito
  - Google OAuth integration
  - Two-factor authentication (2FA) with TOTP
  - Role-based access control (buyer, vendor, admin)
  - Session management and token refresh
  - Password reset and email verification

- **User Management**
  - Complete profile management
  - Avatar uploads with S3 presigned URLs
  - Address management (max 5 addresses)
  - Wishlist functionality
  - User preferences (theme, currency, language, notifications)
  - Notification system with read/unread status

- **Subscription System**
  - Three-tier plans: Free, Pro, Enterprise
  - Stripe integration for payments
  - Monthly and annual billing cycles
  - Subscription upgrades with proration
  - Pause, resume, and cancel subscriptions
  - Invoice management and download
  - Webhook handling for Stripe events

- **Vendor Management**
  - Vendor registration with admin approval
  - Vendor dashboard with real-time stats
  - Analytics with date range and grouping
  - Order management for vendors
  - Earnings tracking and payout requests
  - Stripe Connect integration for payouts
  - Logo and banner uploads
  - Public storefront pages

- **Product Management**
  - Full CRUD operations
  - Image uploads (up to 8 images per product)
  - Digital product file uploads
  - Product reviews and ratings
  - Search and filtering
  - Featured products
  - Inventory management

- **Order Management**
  - Order creation with Stripe PaymentIntent
  - Order confirmation and payment verification
  - Order tracking with status history
  - Cancellation and refund support
  - Coupon validation
  - Multi-vendor order support

- **Admin Panel**
  - Platform-wide statistics
  - User management (ban, unban, role changes)
  - Vendor approval/rejection/suspension
  - Order monitoring
  - Product management
  - Analytics dashboard

- **Infrastructure**
  - MongoDB with Mongoose ODM
  - Redis caching for performance
  - AWS S3 for file storage
  - AWS SES for transactional emails
  - AWS SQS for async job processing
  - Real-time chat with Socket.io
  - Rate limiting and security
  - Comprehensive error handling
  - Request logging with Winston
  - Docker support

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **Database:** MongoDB with Mongoose
- **Cache:** Redis with ioredis
- **Authentication:** JWT + AWS Cognito
- **Payments:** Stripe
- **Storage:** AWS S3
- **Email:** AWS SES
- **Queue:** AWS SQS
- **Real-time:** Socket.io
- **Validation:** Zod
- **Testing:** Jest + Supertest

## Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6+
- Redis 7+
- AWS Account (for S3, SES, SQS, Cognito)
- Stripe Account

### Installation

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your credentials:
   - MongoDB connection string
   - Redis URL
   - AWS credentials and region
   - Cognito User Pool details
   - Stripe API keys
   - S3 bucket name
   - SQS queue URLs
   - JWT secret

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Server will start at `http://localhost:5000`

5. **Run tests:**
   ```bash
   npm test
   ```

## API Documentation

Comprehensive API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick Reference

**Base URL:** `http://localhost:5000/api`

**Main Endpoints:**
- `/api/auth` - Authentication (register, login, 2FA, password reset)
- `/api/users` - User profile and preferences
- `/api/subscriptions` - Subscription management
- `/api/products` - Product catalog
- `/api/orders` - Order processing
- `/api/vendors` - Vendor operations
- `/api/admin` - Admin panel
- `/api/chat` - Real-time messaging
- `/api/upload` - File uploads

**Response Format:**
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "pagination": { ... }
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (DB, Redis, AWS, Stripe)
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── subscriptionController.js
│   │   ├── vendorController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── adminController.js
│   │   ├── chatController.js
│   │   └── uploadController.js
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # JWT verification, role checks
│   │   ├── validation.js # Zod schema validation
│   │   ├── error.js     # Error handling
│   │   └── rateLimiter.js
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Vendor.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Subscription.js
│   │   ├── Address.js
│   │   ├── Wishlist.js
│   │   ├── Notification.js
│   │   ├── Chat.js
│   │   └── Message.js
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   │   ├── cognitoService.js
│   │   ├── s3Service.js
│   │   ├── sqsService.js
│   │   ├── stripe.js
│   │   └── emailService.js
│   ├── validators/      # Zod validation schemas
│   ├── utils/           # Utility functions
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── paginate.js
│   │   └── logger.js
│   ├── __tests__/       # Test files
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── .env.example         # Environment variables template
├── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Docker Deployment

### Development with Docker Compose

```bash
docker-compose up
```

This starts:
- Backend API on port 5000
- MongoDB on port 27017
- Redis on port 6379

### Production Build

```bash
docker build -t cloudmart-backend .
docker run -p 5000:5000 --env-file .env cloudmart-backend
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests with Jest
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

## Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/cloudmart
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=cloudmart-products

# Cognito
COGNITO_USER_POOL_ID=us-east-1_xxxxx
COGNITO_CLIENT_ID=xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## Security Features

- JWT token authentication with refresh tokens
- Token blacklisting in Redis
- Rate limiting (100 req/15min general, 5 req/15min auth)
- Password hashing with bcrypt
- Input validation with Zod
- CORS configuration
- Helmet security headers
- Request logging
- Error sanitization in production

## Caching Strategy

Redis caching is implemented for:
- User profiles (5 min TTL)
- Product details (5 min TTL)
- Vendor storefronts (5 min TTL)
- Vendor dashboards (10 min TTL)
- Recommendations (30 min TTL)

Cache invalidation on updates.

## Testing

Tests are located in `src/__tests__/`:

```bash
# Run all tests
npm test

# Run specific test file
npm test auth.test.js

# Run with coverage
npm test -- --coverage
```

Test coverage includes:
- Authentication flows
- Subscription management
- Product CRUD operations
- Order processing
- Webhook handling

## API Rate Limits

- **General API:** 100 requests per 15 minutes per IP
- **Auth endpoints:** 5 requests per 15 minutes per IP
- **Upload endpoints:** 10 requests per hour per user

## Monitoring & Logging

- Winston logger for structured logging
- Request/response logging
- Error tracking
- Performance monitoring
- AWS CloudWatch integration (production)

## Contributing

1. Create feature branch
2. Write tests for new features
3. Ensure all tests pass
4. Follow existing code style
5. Submit pull request

## Troubleshooting

**MongoDB connection issues:**
```bash
# Check MongoDB is running
mongosh

# Verify connection string in .env
```

**Redis connection issues:**
```bash
# Check Redis is running
redis-cli ping

# Should return PONG
```

**AWS credentials:**
```bash
# Verify AWS credentials
aws sts get-caller-identity
```

**Stripe webhooks (local development):**
```bash
# Use Stripe CLI
stripe listen --forward-to localhost:5000/api/subscriptions/webhook/stripe
```

## Support

- **Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Issues:** GitHub Issues
- **Email:** support@cloudmart.com

## License

MIT License - see LICENSE file for details
