# CloudMart Backend

Node.js + Express.js backend for the CloudMart multi-vendor marketplace.

## Features

- MongoDB with Mongoose ODM
- JWT authentication with AWS Cognito
- Role-based access control (buyer, vendor, admin)
- AWS S3 for product image uploads (presigned URLs)
- AWS SES for transactional emails
- AWS SQS for order event queue
- Stripe payment integration
- Real-time chat with Socket.io
- Rate limiting and error handling
- Docker support

## Setup

1. Copy `.env.example` to `.env` and fill in your AWS credentials
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## API Endpoints

### Auth
- `POST /api/auth/login` - Login with Cognito
- `POST /api/auth/google-auth` - Google OAuth
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (vendor only)
- `PUT /api/products/:id` - Update product (vendor only)
- `DELETE /api/products/:id` - Delete product (vendor only)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/confirm-payment` - Confirm payment

### Vendors
- `POST /api/vendors/register` - Register as vendor
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/:id` - Get vendor details

### Chat
- `GET /api/chat/conversations` - Get conversations
- `POST /api/chat/messages` - Send message
- `GET /api/chat/conversations/:id` - Get conversation messages

## Docker

Run the entire stack with Docker Compose:

```bash
docker-compose up
```

Backend will be available at `http://localhost:5000`
MongoDB will be at `localhost:27017`
