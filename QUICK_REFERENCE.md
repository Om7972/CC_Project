# CloudMart Quick Reference Card

## 🚀 Quick Start

```bash
# 1. Navigate to project
cd CC_Project

# 2. Run setup script (Linux/Mac)
./setup.sh

# 3. Update environment files
# - backend/.env
# - frontend/.env.local

# 4. Start development

# Option A: Separate terminals
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# Option B: Docker Compose (requires Docker)
docker-compose up
```

## 📍 URLs

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:5173 | Vite dev server |
| Backend API | http://localhost:5000/api | REST endpoints |
| Backend Health | http://localhost:5000/health | Status check |
| MongoDB | localhost:27017 | Local/Docker |

## 🔐 Test Account

```
Email: test@cloudmart.com
Role: buyer
(Set up through Cognito Console or Register page)
```

## 📁 Key Directories

```
backend/
├── src/models/      → Database schemas
├── src/controllers/ → Business logic
├── src/routes/      → REST endpoints
├── src/services/    → AWS integrations
└── src/server.js    → Entry point

frontend/
├── src/pages/       → Full page components
├── src/components/  → Reusable UI components
├── src/hooks/       → Custom React hooks
├── src/store/       → Zustand state
└── src/services/    → API clients
```

## 🛠️ Common Commands

### Backend
```bash
npm run dev          # Start dev server
npm test            # Run tests
npm run lint        # Check code style
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Docker
```bash
docker-compose up              # Start all services
docker-compose down            # Stop all services
docker-compose logs -f         # View logs
docker-compose restart backend # Restart service
docker exec <container> <cmd>  # Run command in container
```

## 📝 Adding a New Feature (Example: Add Review System)

### 1. Backend

```javascript
// models/Review.js - Already created!
// controllers/reviewController.js
const create = async (req, res) => {
  // Validate input
  // Create review
  // Update product rating
  // Send response
};

// routes/reviewRoutes.js
router.post('/', verifyToken, reviewController.create);
router.get('/:productId', reviewController.getByProduct);

// services/reviewService.js (optional)
const calculateRating = (reviews) => {
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
};
```

### 2. Frontend

```javascript
// hooks/useApi.js - Add this hook
export const useReviews = (productId) => {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewAPI.getByProduct(productId),
  });
};

// components/ReviewForm.jsx
const ReviewForm = ({ productId, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  // ... form logic
};

// pages/ProductDetail.jsx
const ProductDetail = () => {
  const { data: reviews } = useReviews(productId);
  return (
    <>
      <ReviewForm />
      {reviews?.map(r => <ReviewItem key={r._id} review={r} />)}
    </>
  );
};
```

## 🗄️ Database Quick Reference

### Create New Collection
```javascript
// 1. Create model in src/models/
const schema = new mongoose.Schema({ /* fields */ });
module.exports = mongoose.model('Name', schema);

// 2. Import in controllers
const Model = require('../models/Model');

// 3. Use in controller
const doc = await Model.create(data);
```

### Query Examples
```javascript
// Find one
const user = await User.findById(id);
const user = await User.findOne({ email });

// Find many
const users = await User.find({ role: 'vendor' });

// Update
await User.findByIdAndUpdate(id, { name: 'New' }, { new: true });

// Delete
await User.findByIdAndDelete(id);

// Count
const total = await User.countDocuments({ role: 'vendor' });

// Pagination
const users = await User.find()
  .skip((page - 1) * limit)
  .limit(limit);
```

## 🌐 API Call Pattern (Frontend)

```javascript
// services/api-client.js
export const userAPI = {
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// pages/Profile.jsx
import { userAPI } from '../services/api-client';
import { useQuery, useMutation } from '@tanstack/react-query';

const Profile = () => {
  // Query (read)
  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: userAPI.getProfile,
  });

  // Mutation (write)
  const updateMutation = useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: () => {
      toast.success('Profile updated!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const handleUpdate = (newData) => {
    updateMutation.mutate(newData);
  };

  return (
    <div>
      <p>Hello {user?.name}</p>
      <button onClick={() => handleUpdate({ name: 'New Name' })}>
        Update
      </button>
    </div>
  );
};
```

## 🎨 Component Structure (Frontend)

```javascript
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';

export const ComponentName = ({ prop1, prop2 }) => {
  // 1. State
  const [local, setLocal] = useState('');

  // 2. Store
  const { user } = useAuthStore();

  // 3. Hooks
  const { data, isLoading } = useQuery({...});

  // 4. Handlers
  const handleClick = () => {
    // Logic
  };

  // 5. Render
  if (isLoading) return <Spinner />;

  return (
    <div className="bg-white p-4 rounded">
      {/* JSX */}
    </div>
  );
};
```

## 🔑 State Management (Zustand)

```javascript
// Create store
import { create } from 'zustand';

export const useExampleStore = create((set) => ({
  // State
  count: 0,

  // Actions
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));

// Use in component
const MyComponent = () => {
  const { count, increment } = useExampleStore();

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
};
```

## 🔗 Route Structure (Frontend)

```javascript
// App.jsx
<Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login />} />
  <Route path="/products" element={<Products />} />
  <Route path="/cart" element={<Cart />} />
  {/* Protected routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/checkout" element={<Checkout />} />
  </Route>
</Routes>

// Protected route component
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};
```

## 🚨 Error Handling

### Backend
```javascript
try {
  // Operation
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({
    error: {
      message: error.message,
      statusCode: 500,
    },
  });
}
```

### Frontend
```javascript
try {
  await api.post('/endpoint', data);
  toast.success('Success!');
} catch (error) {
  const message = error.response?.data?.error || 'An error occurred';
  toast.error(message);
  console.error(error);
}
```

## 🔄 Common Workflows

### User Registration → Login → Browse Products

```
1. User clicks Register
2. Form submits to Cognito
3. Cognito returns ID token
4. Frontend calls /auth/login with token
5. Backend creates user in DB
6. Backend returns JWT
7. Frontend stores JWT in localStorage
8. Subsequent requests include JWT in Authorization header
```

### Add Product to Cart → Checkout → Payment

```
1. User clicks "Add to Cart"
2. Frontend adds to cartStore (Zustand)
3. Cart saved to localStorage
4. User navigates to checkout
5. Form collects shipping address
6. Frontend calls POST /orders
7. Backend creates order, returns Stripe clientSecret
8. Frontend uses Stripe.js to confirm payment
9. Frontend calls POST /orders/confirm-payment
10. Payment confirmed, order status updated
```

### Vendor Registers → Gets Approved → Sells Products

```
1. User registers via Cognito
2. User goes to /vendor/register
3. Submits vendor application
4. Admin reviews in admin panel
5. Admin approves vendor
6. User role changed to "vendor"
7. User can now create products
8. Products visible to buyers
```

## 📊 Environment Variables Checklist

### Backend `.env`
```
☐ MONGO_URI
☐ AWS_REGION
☐ AWS_ACCESS_KEY_ID
☐ AWS_SECRET_ACCESS_KEY
☐ AWS_S3_BUCKET
☐ AWS_SES_FROM_EMAIL
☐ AWS_SQS_QUEUE_URL
☐ COGNITO_USER_POOL_ID
☐ COGNITO_CLIENT_ID
☐ JWT_SECRET
☐ STRIPE_SECRET_KEY
☐ STRIPE_PUBLISHABLE_KEY
☐ PORT
☐ NODE_ENV
☐ FRONTEND_URL
```

### Frontend `.env.local`
```
☐ VITE_API_URL
☐ VITE_COGNITO_DOMAIN
☐ VITE_COGNITO_CLIENT_ID
☐ VITE_STRIPE_PUBLISHABLE_KEY
```

## 🐛 Debugging Tips

```javascript
// Console logging
console.log('Variable:', variable);
console.error('Error:', error);
console.table(arrayOfObjects);

// React DevTools
// 1. Install React Developer Tools extension
// 2. Open DevTools → Components tab
// 3. Inspect component props/state

// Network debugging
// 1. DevTools → Network tab
// 2. See API requests/responses
// 3. Check headers, payload, status

// Storage debugging
// 1. DevTools → Application → LocalStorage
// 2. Check token, cart, user data
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Project overview |
| SETUP.md | Installation guide |
| DEVELOPMENT.md | Architecture & patterns |
| API.md | API reference |
| PROJECT_SUMMARY.md | Complete file structure |

## 🆘 Need Help?

1. Check **SETUP.md** for common issues
2. Check **API.md** for endpoint details
3. Check **DEVELOPMENT.md** for patterns
4. Review code comments in source files
5. Check Docker logs: `docker-compose logs -f`

## ⚡ Performance Tips

### Frontend
- Use React.lazy() for code splitting
- Memoize expensive components with React.memo
- Use useCallback for handlers
- Implement pagination for lists
- Lazy load images

### Backend
- Add database indexes (already done!)
- Use pagination for queries
- Cache frequently accessed data
- Optimize S3 file sizes
- Monitor API response times

---

**Remember**: This is a template. Customize it for your business needs!

Last Updated: 2024
