# CloudMart API Documentation

## Overview
CloudMart is a multi-vendor marketplace backend with comprehensive features including authentication, subscriptions, vendor management, product listings, orders, and real-time chat.

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.cloudmart.com/api
```

## Response Format
All API responses follow this standardized format:

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## AUTH ROUTES `/api/auth`

### POST `/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "buyer",
      "avatar": null
    }
  }
}
```

### POST `/login`
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`

### POST `/logout`
Invalidate current session (requires auth).

**Response:** `200 OK`

### POST `/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** `200 OK`

### POST `/forgot-password`
Request password reset code.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### POST `/reset-password`
Reset password with code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123"
}
```

### POST `/verify-email`
Verify email with confirmation code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

### POST `/resend-verification`
Resend email verification code.

### GET `/me`
Get authenticated user profile (cached 5min).

**Response:** `200 OK`

### POST `/google`
Authenticate with Google OAuth.

**Request Body:**
```json
{
  "idToken": "google_id_token"
}
```

### POST `/2fa/enable`
Enable two-factor authentication.

**Response:**
```json
{
  "success": true,
  "data": {
    "secret": "base32_secret",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### POST `/2fa/verify`
Verify and activate 2FA.

**Request Body:**
```json
{
  "code": "123456"
}
```

### POST `/2fa/disable`
Disable 2FA.

### GET `/sessions`
Get login history for current user.

### DELETE `/sessions/:sessionId`
Revoke specific session.

---

## USER / PROFILE ROUTES `/api/users`

All routes require authentication.

### GET `/profile`
Get full user profile.

### PATCH `/profile`
Update profile information.

**Request Body:**
```json
{
  "displayName": "John Doe",
  "bio": "Software developer",
  "phone": "+1234567890",
  "location": "New York, USA",
  "website": "https://johndoe.com"
}
```

### POST `/avatar`
Get presigned S3 URL for avatar upload.

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/...",
    "avatarUrl": "https://s3.amazonaws.com/...",
    "key": "avatars/user_id/..."
  }
}
```

### PATCH `/avatar/confirm`
Confirm avatar upload and save URL.

**Request Body:**
```json
{
  "avatarUrl": "https://s3.amazonaws.com/..."
}
```

### DELETE `/avatar`
Delete avatar and reset to initials.

### PATCH `/password`
Update password.

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

### PATCH `/preferences`
Update user preferences.

**Request Body:**
```json
{
  "theme": "dark",
  "currency": "USD",
  "language": "en",
  "notifications": {
    "email": true,
    "push": true,
    "sms": false
  }
}
```

### GET `/wishlist`
Get user wishlist with populated products.

### POST `/wishlist/:productId`
Add product to wishlist.

### DELETE `/wishlist/:productId`
Remove product from wishlist.

### GET `/addresses`
List saved addresses.

### POST `/addresses`
Add new address (max 5).

**Request Body:**
```json
{
  "label": "Home",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "US",
  "isDefault": true
}
```

### PATCH `/addresses/:id`
Update address.

### DELETE `/addresses/:id`
Delete address.

### PATCH `/addresses/:id/default`
Set address as default.

### GET `/notifications`
Get paginated notifications.

**Query Params:**
- `page` (default: 1)
- `limit` (default: 20)
- `isRead` (true/false)

### PATCH `/notifications/read-all`
Mark all notifications as read.

### PATCH `/notifications/:id/read`
Mark single notification as read.

### DELETE `/notifications/:id`
Delete notification.

---

## SUBSCRIPTION ROUTES `/api/subscriptions`

### GET `/plans`
Get all subscription plans with features and pricing.

**Response:**
```json
{
  "success": true,
  "data": {
    "free": {
      "name": "Free",
      "price": { "monthly": 0, "annual": 0 },
      "features": { ... }
    },
    "pro": {
      "name": "Pro",
      "price": { "monthly": 29, "annual": 290 },
      "features": { ... }
    },
    "enterprise": { ... }
  }
}
```

### GET `/current`
Get current user subscription details.

### POST `/subscribe`
Create new subscription.

**Request Body:**
```json
{
  "plan": "pro",
  "billingCycle": "monthly"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_xxx",
    "clientSecret": "pi_xxx_secret_xxx"
  }
}
```

### POST `/upgrade`
Upgrade subscription with proration.

**Request Body:**
```json
{
  "newPlan": "enterprise",
  "billingCycle": "annual"
}
```

### POST `/cancel`
Cancel subscription at period end.

### POST `/reactivate`
Reactivate cancelled subscription.

### POST `/pause`
Pause subscription.

### POST `/resume`
Resume paused subscription.

### GET `/invoices`
List all invoices.

### GET `/invoices/:id/download`
Redirect to invoice PDF URL.

### POST `/webhook/stripe`
Handle Stripe webhook events (public endpoint).

**Webhook Events Handled:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `payment_intent.succeeded`

---

## VENDOR ROUTES `/api/vendors`

### POST `/register`
Register as vendor (requires auth).

**Request Body:**
```json
{
  "storeName": "My Store",
  "description": "We sell amazing products",
  "category": "Electronics"
}
```

### GET `/me`
Get own vendor profile with stats (vendor auth).

### PATCH `/me`
Update vendor profile (vendor auth).

**Request Body:**
```json
{
  "storeName": "Updated Store Name",
  "description": "Updated description",
  "socialLinks": {
    "facebook": "https://facebook.com/mystore",
    "twitter": "https://twitter.com/mystore"
  }
}
```

### POST `/me/logo`
Get presigned URL for logo upload (vendor auth).

### POST `/me/banner`
Get presigned URL for banner upload (vendor auth).

### GET `/me/dashboard`
Get vendor dashboard with stats (cached 10min, vendor auth).

**Response:**
```json
{
  "success": true,
  "data": {
    "todayRevenue": 1250.50,
    "totalRevenue": 45000.00,
    "totalOrders": 320,
    "totalProducts": 45,
    "activeProducts": 42,
    "avgRating": 4.7,
    "pendingOrders": 5,
    "recentOrders": [...],
    "topProducts": [...]
  }
}
```

### GET `/me/analytics`
Get analytics data (vendor auth).

**Query Params:**
- `startDate` (ISO date)
- `endDate` (ISO date)
- `groupBy` (day/week/month)

### GET `/me/orders`
Get vendor orders (vendor auth).

**Query Params:**
- `page`, `limit`, `status`

### PATCH `/me/orders/:orderId/status`
Update order status (vendor auth).

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Allowed statuses:** `confirmed`, `processing`, `shipped`

### GET `/me/earnings`
Get earnings and payout info (vendor auth).

### POST `/me/payout`
Request payout (vendor auth).

**Request Body:**
```json
{
  "amount": 1000.00
}
```

### POST `/me/stripe/connect`
Create Stripe Connect onboarding URL (vendor auth).

### GET `/me/stripe/connect/callback`
Handle Stripe Connect callback (vendor auth).

### GET `/:storeSlug`
Get public vendor storefront (cached 5min).

### GET `/`
List/search vendors (public).

**Query Params:**
- `category`, `rating`, `search`, `sort`, `page`, `limit`

---

## ADMIN ROUTES `/api/admin`

All routes require admin role.

### GET `/stats`
Get platform-wide statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 10000,
    "totalVendors": 250,
    "totalProducts": 5000,
    "totalOrders": 15000,
    "totalRevenue": 500000.00,
    "MRR": 12500,
    "activeSubscriptions": 180
  }
}
```

### GET `/users`
List users with filters.

**Query Params:**
- `role`, `plan`, `status`, `search`, `page`, `limit`

### PATCH `/users/:id/ban`
Ban user.

**Request Body:**
```json
{
  "reason": "Violation of terms"
}
```

### PATCH `/users/:id/unban`
Unban user.

### PATCH `/users/:id/role`
Change user role.

**Request Body:**
```json
{
  "role": "vendor"
}
```

### GET `/vendors`
List vendors with filters.

**Query Params:**
- `status`, `page`, `limit`

### PATCH `/vendors/:id/approve`
Approve vendor registration.

### PATCH `/vendors/:id/reject`
Reject vendor registration.

**Request Body:**
```json
{
  "reason": "Incomplete information"
}
```

### PATCH `/vendors/:id/suspend`
Suspend vendor.

### GET `/orders`
List all platform orders.

**Query Params:**
- `status`, `vendor`, `startDate`, `endDate`, `page`, `limit`

### GET `/products`
List all products.

**Query Params:**
- `status`, `category`, `page`, `limit`

### PATCH `/products/:id/feature`
Toggle product featured status.

**Request Body:**
```json
{
  "isFeatured": true,
  "featuredUntil": "2024-12-31T23:59:59Z"
}
```

### GET `/analytics`
Get platform analytics.

**Query Params:**
- `startDate`, `endDate`

**Response:**
```json
{
  "success": true,
  "data": {
    "revenueChart": [...],
    "userGrowth": [...],
    "topVendors": [...],
    "topProducts": [...],
    "subscriptionBreakdown": [...]
  }
}
```

---

## UPLOAD ROUTES `/api/upload`

### POST `/presigned`
Get presigned S3 URL for file upload (requires auth).

**Request Body:**
```json
{
  "type": "avatar",
  "contentType": "image/jpeg",
  "fileName": "profile.jpg",
  "fileSize": 1048576
}
```

**Types:** `avatar`, `product`, `banner`, `digital`

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/...",
    "fileUrl": "https://s3.amazonaws.com/...",
    "key": "avatars/user_id/...",
    "expiresIn": 300
  }
}
```

**Upload Limits by Plan:**
- Free: avatar (2MB), product (5MB), banner (5MB), digital (not allowed)
- Pro: avatar (5MB), product (10MB), banner (10MB), digital (100MB)
- Enterprise: avatar (10MB), product (20MB), banner (20MB), digital (500MB)

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Rate Limiting

- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

---

## Caching Strategy

**Redis caching is implemented for:**
- User profiles: 5 minutes TTL
- Product details: 5 minutes TTL
- Vendor storefronts: 5 minutes TTL
- Vendor dashboards: 10 minutes TTL
- Token blacklist: 15 minutes TTL

---

## WebSocket Events (Socket.io)

**Connection:**
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'Bearer <access_token>' }
});
```

**Events:**
- `order_status_updated` - Order status changed
- `new_message` - New chat message
- `notification` - New notification

---

## Testing

Run tests:
```bash
npm test
```

Test files located in `src/__tests__/`:
- `auth.test.js`
- `subscription.test.js`
- `product.test.js`
- `order.test.js`

---

## Environment Variables

See `.env.example` for required environment variables.

---

## Support

For API support, contact: support@cloudmart.com
