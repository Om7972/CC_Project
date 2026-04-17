# CloudMart - Multi-Vendor Marketplace

A full-stack SaaS platform for multi-vendor marketplaces built with modern technologies.

## 🚀 Project Overview

CloudMart is a complete e-commerce marketplace solution that enables:
- Independent vendors to manage their storefronts
- Buyers to discover and purchase products
- Admin panel for platform management
- Real-time chat between buyers and vendors
- Payment processing with Stripe
- Secure authentication with AWS Cognito

## 📁 Project Structure

```
CC_Project/
├── backend/              # Node.js + Express backend
│   ├── src/
│   │   ├── models/      # MongoDB schemas
│   │   ├── controllers/ # Business logic
│   │   ├── routes/      # API endpoints
│   │   ├── middleware/  # Auth, validation, error handling
│   │   ├── services/    # AWS integration, payments
│   │   ├── config/      # Configuration files
│   │   └── server.js    # Entry point
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── store/       # Zustand state management
│   │   ├── services/    # API clients
│   │   ├── utils/       # Helper functions
│   │   ├── styles/      # Global styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml   # Multi-container setup
└── README.md
```

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: AWS Cognito
- **File Storage**: AWS S3 (presigned URLs)
- **Email**: AWS SES
- **Queue System**: AWS SQS
- **Payments**: Stripe
- **Real-time**: Socket.io
- **Rate Limiting**: express-rate-limit
- **Validation**: Zod

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **State Management**: Zustand + React Query (TanStack)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios with JWT interceptors
- **Real-time**: Socket.io-client
- **Payments**: Stripe.js
- **Charts**: Chart.js
- **UI Alerts**: react-hot-toast
- **Icons**: Lucide React

## 🔐 Authentication & Authorization

### Role-Based Access Control
- **Buyer**: Browse products, purchase, view orders, chat
- **Vendor**: Manage products, view earnings, respond to chats
- **Admin**: Approve vendors, manage users, platform analytics

### Auth Flow
1. User registers/logs in via AWS Cognito (email or Google OAuth)
2. Cognito returns ID token
3. Frontend exchanges token for internal JWT
4. JWT used for all subsequent API requests
5. Token refresh mechanism with auto-retry

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/login              # Cognito login
POST   /api/auth/google-auth        # Google OAuth
POST   /api/auth/logout
GET    /api/auth/profile
PUT    /api/auth/profile
POST   /api/auth/refresh-token
```

### Products
```
GET    /api/products                # List with pagination
GET    /api/products/featured       # Featured products
GET    /api/products/:id            # Details
POST   /api/products                # Create (vendor)
PUT    /api/products/:id            # Update (vendor)
DELETE /api/products/:id            # Delete (vendor)
POST   /api/products/upload/presigned-url
```

### Orders
```
POST   /api/orders                  # Create order
GET    /api/orders                  # List user orders
GET    /api/orders/:id              # Order details
POST   /api/orders/confirm-payment  # Confirm Stripe payment
PUT    /api/orders/:id/status       # Update status
```

### Vendors
```
POST   /api/vendors/register        # Register as vendor
GET    /api/vendors                 # List all vendors
GET    /api/vendors/:id             # Vendor profile
GET    /api/vendors/profile         # Current vendor profile
PUT    /api/vendors/profile         # Update profile
GET    /api/vendors/:id/products    # Vendor products
GET    /api/vendors/earnings        # Vendor earnings
POST   /api/vendors/:id/approve     # Admin: approve
POST   /api/vendors/:id/reject      # Admin: reject
```

### Chat
```
POST   /api/chat/conversations      # Create/get conversation
GET    /api/chat/conversations      # List conversations
GET    /api/chat/conversations/:id  # Get messages
POST   /api/chat/messages           # Send message
PUT    /api/chat/conversations/:id/mark-read
PUT    /api/chat/conversations/:id/close
```

## 📦 Database Models

### User
- Email, password (Cognito), name, phone, avatar
- Address, role (buyer/vendor/admin)
- Login provider (Cognito/Google)

### Vendor
- User reference, store name, description
- Logo, banner, category, rating
- Bank account, business info, documentation
- Status (pending/approved/rejected)
- Earnings, total sales

### Product
- Vendor reference, name, description
- Price, discount, images, SKU
- Stock, specifications, tags
- Rating, review count, status
- SEO metadata, shipping info

### Order
- Buyer and vendor references
- Items, totals (subtotal, tax, discount)
- Payment method and status
- Shipping address, tracking
- Status transitions and timestamps

### Review
- Product, vendor, buyer references
- Rating, title, comment, images
- Helpful/unhelpful counts
- Vendor response capability

### Chat
- Buyer and vendor IDs
- Message thread with timestamps
- Read status, unread counts
- Conversation status (active/closed)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- AWS Account (S3, Cognito, SES, SQS)
- Stripe Account
- MongoDB Atlas or local MongoDB

### Environment Setup

#### Backend (.env)
```bash
MONGO_URI=mongodb+srv://...
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=cloudmart-products
AWS_SES_FROM_EMAIL=noreply@cloudmart.com
COGNITO_USER_POOL_ID=...
COGNITO_CLIENT_ID=...
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env.local)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_COGNITO_DOMAIN=https://cloudmart.auth.us-east-1.amazoncognito.com
VITE_COGNITO_CLIENT_ID=...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Installation

**With Docker Compose (Recommended)**
```bash
docker-compose up
```

**Manual Setup**
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## 🌍 Deployment

### Backend Deployment
- Deploy with AWS ECS or App Service
- Use RDS for MongoDB replacement (Azure Cosmos DB)
- Configure environment variables in deployment
- Enable CORS for frontend URL

### Frontend Deployment
- Build: `npm run build`
- Deploy to AWS S3 + CloudFront
- Or use Vercel, Netlify for easy deployment
- Update API URL in environment variables

## 📋 Features Overview

### For Buyers
- ✅ Product discovery with search & filters
- ✅ Shopping cart with quantity management
- ✅ Secure checkout with Stripe
- ✅ Order tracking and history
- ✅ Product reviews and ratings
- ✅ Real-time chat with vendors
- ✅ Wishlist (can be added)

### For Vendors
- ✅ Store management dashboard
- ✅ Product upload with S3 integration
- ✅ Inventory management
- ✅ Order management
- ✅ Earnings analytics
- ✅ Customer communication
- ✅ Vendor profile customization

### For Admin
- ✅ Vendor approval/rejection
- ✅ User management
- ✅ Platform analytics
- ✅ Dispute resolution
- ✅ Commission management (can be added)

## 🔧 Development

### Add New Feature
1. Create feature branch: `git checkout -b feature/name`
2. Backend: Create model → controller → route → service
3. Frontend: Create page → components → hooks → store
4. Test with Postman/Insomnia for backend
5. Submit PR

### Code Structure Best Practices
- Separate concerns (models, controllers, services)
- Reusable components with prop drilling or context
- Custom hooks for logic
- Utility functions for helpers
- Error handling at each layer

## 📝 Notes

- All API responses follow consistent JSON structure
- Errors include status code and error message
- Rate limiting applied to auth and upload endpoints
- Passwords handled securely via Cognito
- S3 URLs expire in 1 hour (presigned)
- Chat uses Socket.io for real-time updates

## 📄 License

MIT License - feel free to use this project as a template

## 👤 Author

Created as a full-stack marketplace solution

---

**Happy coding! 🎉**
