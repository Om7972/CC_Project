# Project Development Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Vite)                  │
│           ┌──────────────────────────────────────────┐          │
│           │ Pages: Landing, Products, Cart, Login    │          │
│           │ Components: Header, ProductCard, Forms   │          │
│           │ Store: Auth, Cart, Filter (Zustand)      │          │
│           │ Hooks: useApi, useForm, useDebounce      │          │
│           └──────────────────────────────────────────┘          │
└──────────────┬──────────────────────────────────────────────────┘
               │ REST API + WebSocket
┌──────────────▼──────────────────────────────────────────────────┐
│                   Backend (Node.js + Express)                   │
│    ┌────────────────┐   ┌────────────────┐   ┌────────────────┐│
│    │ Models         │   │ Controllers    │   │ Routes         ││
│    ├────────────────┤   ├────────────────┤   ├────────────────┤│
│    │ User           │   │ authController │   │ /api/auth      ││
│    │ Product        │   │ productCtrl    │   │ /api/products  ││
│    │ Order          │   │ orderCtrl      │   │ /api/orders    ││
│    │ Vendor         │   │ vendorCtrl     │   │ /api/vendors   ││
│    │ Chat           │   │ chatCtrl       │   │ /api/chat      ││
│    └────────────────┘   └────────────────┘   └────────────────┘│
│                                                                   │
│    ┌────────────────┐   ┌────────────────┐   ┌────────────────┐│
│    │ Middleware     │   │ Services       │   │ Config         ││
│    ├────────────────┤   ├────────────────┤   ├────────────────┤│
│    │ Auth Guard     │   │ s3Service      │   │ database.js    ││
│    │ Error Handler  │   │ emailService   │   │ config.js      ││
│    │ Rate Limiter   │   │ paymentService │   │ socket.io      ││
│    │ Validation     │   │ cognitoService │   │                ││
│    └────────────────┘   └────────────────┘   └────────────────┘│
└──────────────┬──────────────────────────────────────────────────┘
               │
       ┌───────┴──────┬────────────┬──────────────┐
       │              │            │              │
  ┌────▼─────┐  ┌────▼────┐  ┌────▼────┐  ┌────▼────┐
  │ MongoDB   │  │AWS      │  │AWS STS  │  │Stripe   │
  │           │  │S3,SES   │  │ (Auth)  │  │Payment  │
  └───────────┘  └────┬────┘  └────┬────┘  └────┬────┘
                      │             │             │
                  ┌───┴─────────────┴─────────────┴───┐
                  │   AWS SQS (Order Queue)           │
                  │   Lambda (Email Processing)        │
                  └──────────────────────────────────┘
```

## File Organization

### Backend Structure
```
backend/
├── src/
│   ├── models/          # Database schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Vendor.js
│   │   ├── Review.js
│   │   └── Chat.js
│   │
│   ├── controllers/      # Business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── vendorController.js
│   │   └── chatController.js
│   │
│   ├── routes/          # API endpoints
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── vendorRoutes.js
│   │   └── chatRoutes.js
│   │
│   ├── middleware/       # Middleware functions
│   │   ├── auth.js       # JWT verification
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validation.js
│   │
│   ├── services/        # Business logic & integrations
│   │   ├── s3Service.js
│   │   ├── emailService.js
│   │   ├── sqsService.js
│   │   ├── paymentService.js
│   │   └── cognitoService.js
│   │
│   ├── config/
│   │   ├── database.js
│   │   └── config.js
│   │
│   └── server.js        # Application entry point
│
├── Dockerfile
├── docker-compose.yml
├── package.json
├── .env.example
└── README.md
```

### Frontend Structure
```
frontend/
├── src/
│   ├── pages/           # Full page components
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Products.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   └── ... (more pages)
│   │
│   ├── components/       # Reusable components
│   │   ├── Header.jsx
│   │   ├── ProductCard.jsx
│   │   ├── FormComponents.jsx
│   │   ├── Loading.jsx
│   │   └── ... (more components)
│   │
│   ├── hooks/           # Custom hooks
│   │   ├── useForm.js
│   │   └── useApi.js
│   │
│   ├── store/           # Zustand stores
│   │   ├── authStore.js
│   │   ├── cartStore.js
│   │   └── filterStore.js
│   │
│   ├── services/        # API & other services
│   │   ├── api.js       # Axios instance
│   │   ├── api-client.js # API methods
│   │   ├── s3-upload.js
│   │   └── socket.js
│   │
│   ├── utils/           # Utility functions
│   │   └── helpers.js
│   │
│   ├── styles/          # Global styles
│   │   └── index.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── Dockerfile
├── .env.example
└── README.md
```

## Development Workflow

### Adding a New Feature

1. **Define Requirements**
   - User stories
   - API endpoints needed
   - Database changes
   - UI mockups

2. **Backend Development**
   ```
   Model → Controller → Route → Service → Test
   ```

3. **Frontend Development**
   ```
   Hook (useApi) → Page/Component → Store → Test
   ```

4. **Integration Testing**
   - Test full flow
   - Error scenarios
   - Loading states

### Example: Add Product Ratings

**Backend:**
1. Update Product model to include `rating` and `reviewCount`
2. Create Review model with `productId`, `rating`, `comment`
3. Create reviewController with create/update/list methods
4. Create reviewRoutes: POST, GET, PUT, DELETE
5. Update productController to calculate average rating

**Frontend:**
1. Create `useReviews` hook using useApi
2. Create ReviewForm component with star rating
3. Create ReviewList component
4. Update ProductDetail page to show reviews
5. Add review section to ProductCard

## Testing Strategy

### Backend Testing
```
npm test

Test files:
- tests/auth.test.js
- tests/products.test.js
- tests/orders.test.js
```

### Frontend Testing
```
npm test

Test files:
- src/__tests__/hooks.test.jsx
- src/__tests__/components.test.jsx
- src/__tests__/stores.test.js
```

## Performance Optimization

### Backend
- Database indexing (already in models)
- Query pagination
- Caching with Redis (future enhancement)
- Rate limiting
- Compression middleware

### Frontend
- Code splitting with React.lazy()
- Image optimization
- Virtual scrolling for lists
- Memoization with React.memo
- Lazy loading components

## Security Considerations

1. **Authentication**
   - Cognito handles password security
   - JWT tokens for API auth
   - Refresh token mechanism

2. **Authorization**
   - Role-based access control
   - Resource ownership checks
   - Admin-only endpoints protected

3. **Data Protection**
   - HTTPS enforced in production
   - Sensitive data in env vars
   - No secrets in git

4. **Input Validation**
   - Zod schemas on frontend and backend
   - Sanitize user inputs
   - SQL injection prevention (MongoDB)

5. **File Upload Security**
   - Presigned URLs (time-limited)
   - File type validation
   - Size limits

## Monitoring & Logging

### Setup Recommendations
- Use Winston or Morgan for logging
- CloudWatch for AWS monitoring
- Sentry for error tracking
- New Relic for performance monitoring

### Basic Logging (Backend)
```javascript
console.log('Info message');
console.error('Error occurred:', error);
// Upgrade to Winston for production
```

## Code Style & Conventions

### Naming Conventions
- **Files**: camelCase for JS, PascalCase for React
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Functions**: camelCase
- **Classes**: PascalCase

### Commenting
- Document complex logic
- Explain "why", not "what"
- Keep comments updated

### Error Handling
```javascript
try {
  // Operation
} catch (error) {
  console.error('Descriptive error:', error);
  // Handle error appropriately
  throw new CustomError('User message', statusCode);
}
```

## Useful VSCode Extensions

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Thunder Client (API testing)
- MongoDB for VS Code
- AWS Toolkit

## Debugging Tips

### Backend
```javascript
// Add debug logs
console.log('Debug:', variable);

// Use debugger
debugger;

// Run with inspector
node --inspect src/server.js
```

### Frontend
```javascript
// React DevTools
// Check component state in DevTools

// Zustand DevTools
import { useDevtools } from 'zustand-devtools';

// Network tab for API calls
// Storage tab for localStorage
```

## Common Pitfalls to Avoid

1. ❌ Storing sensitive data in localStorage
   ✅ Use httpOnly cookies or Cognito tokens

2. ❌ Unhandled promise rejections
   ✅ Always add .catch() or try/catch

3. ❌ Race conditions in async calls
   ✅ Use AbortController or cleanup in useEffect

4. ❌ Hardcoded API URLs
   ✅ Use environment variables

5. ❌ Missing error boundaries
   ✅ Wrap components with error handling

## Resources & Documentation

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Best Practices](https://react.dev/learn)
- [MongoDB Schema Design](https://docs.mongodb.com/manual/core/databases-and-collections/)
- [AWS SDK Best Practices](https://docs.aws.amazon.com/AWSJavaScriptSDK/)
- [Stripe API Reference](https://stripe.com/docs/api)
