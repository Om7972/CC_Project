# CloudMart API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

## Response Format

### Success Response
```json
{
  "data": {},
  "message": "Success"
}
```

### Error Response
```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

---

## Auth Endpoints

### POST /auth/login
Login with Cognito ID token

**Request:**
```json
{
  "idToken": "cognito_id_token"
}
```

**Response (200):**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "buyer",
    "avatar": "url"
  }
}
```

### POST /auth/google-auth
Google OAuth authentication

**Request:**
```json
{
  "idToken": "google_id_token"
}
```

**Response (200):** Same as login

### POST /auth/logout
Logout current user (Protected)

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### GET /auth/profile
Get current user profile (Protected)

**Response (200):**
```json
{
  "_id": "user_id",
  "cognitoId": "cognito_id",
  "email": "user@example.com",
  "name": "User Name",
  "phone": "+1234567890",
  "avatar": "url",
  "role": "buyer",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "isVerified": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### PUT /auth/profile
Update current user profile (Protected)

**Request:**
```json
{
  "name": "New Name",
  "phone": "+1234567890",
  "address": {
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "country": "USA"
  }
}
```

**Response (200):** Updated user object

### POST /auth/refresh-token
Refresh JWT token (Protected)

**Response (200):**
```json
{
  "token": "new_jwt_token"
}
```

---

## Product Endpoints

### GET /products
List all products with pagination

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `category` (optional)
- `search` (optional) - full text search

**Response (200):**
```json
{
  "products": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "originalPrice": 149.99,
      "discount": 33,
      "images": [
        {
          "url": "image_url",
          "altText": "Product image"
        }
      ],
      "thumbnail": "thumbnail_url",
      "stock": 50,
      "rating": 4.5,
      "reviewCount": 120,
      "status": "active",
      "vendorId": {
        "_id": "vendor_id",
        "storeName": "Store Name",
        "rating": 4.8
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 500,
    "page": 1,
    "pages": 25
  }
}
```

### GET /products/featured
Get featured products

**Query Parameters:**
- `limit` (optional, default: 12)

**Response (200):** Array of products

### GET /products/:id
Get product details

**Response (200):** Single product object

### POST /products
Create new product (Protected - Vendor only)

**Request:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "category": "Electronics",
  "price": 99.99,
  "originalPrice": 149.99,
  "discount": 33,
  "images": [
    {
      "url": "s3_image_url",
      "altText": "Product image"
    }
  ],
  "thumbnail": "s3_thumbnail_url",
  "stock": 100,
  "sku": "SKU-123",
  "specifications": {
    "color": "Black",
    "size": "Large"
  },
  "tags": ["electronics", "gadget"]
}
```

**Response (201):** Created product object

### PUT /products/:id
Update product (Protected - Vendor only)

**Request:** Same as create (partial update allowed)

**Response (200):** Updated product object

### DELETE /products/:id
Delete product (Protected - Vendor only)

**Response (200):**
```json
{
  "message": "Product deleted successfully"
}
```

### POST /products/upload/presigned-url
Get S3 presigned URL for image upload (Protected - Vendor only)

**Request:**
```json
{
  "fileName": "product-image.jpg",
  "contentType": "image/jpeg"
}
```

**Response (200):**
```json
{
  "presignedUrl": "s3_presigned_url",
  "fileKey": "products/vendor_id/timestamp-random.jpg"
}
```

---

## Order Endpoints

### POST /orders
Create new order (Protected - Buyer only)

**Request:**
```json
{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2
    }
  ],
  "paymentMethod": "stripe",
  "shippingAddress": {
    "recipientName": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "billingAddress": {
    "recipientName": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  }
}
```

**Response (201):**
```json
{
  "order": {
    "_id": "order_id",
    "orderId": "ORD-1234567890-1234",
    "buyerId": "buyer_id",
    "vendorId": "vendor_id",
    "items": [...],
    "totalAmount": 199.98,
    "subtotal": 181.80,
    "tax": 18.18,
    "paymentStatus": "pending",
    "status": "placed",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "clientSecret": "stripe_client_secret"
}
```

### GET /orders
Get user's orders (Protected)

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `status` (optional) - filter by status

**Response (200):** List of orders with pagination

### GET /orders/:id
Get specific order details (Protected)

**Response (200):** Single order object

### POST /orders/confirm-payment
Confirm Stripe payment (Protected)

**Request:**
```json
{
  "paymentIntentId": "pi_xxxxx"
}
```

**Response (200):**
```json
{
  "message": "Payment confirmed",
  "order": {...}
}
```

### PUT /orders/:id/status
Update order status (Protected - Vendor/Admin only)

**Request:**
```json
{
  "status": "shipped"
}
```

**Valid statuses:** placed, confirmed, processing, shipped, delivered, cancelled

**Response (200):** Updated order object

---

## Vendor Endpoints

### POST /vendors/register
Register as vendor (Protected)

**Request:**
```json
{
  "storeName": "Store Name",
  "category": "Electronics",
  "description": "Store description",
  "bankAccount": {
    "accountHolder": "Store Owner",
    "accountNumber": "1234567890",
    "routingNumber": "123456789",
    "bankName": "Bank Name"
  },
  "businessInfo": {
    "businessName": "Business Name",
    "taxId": "12-3456789",
    "businessAddress": "123 Business St"
  }
}
```

**Response (201):** Vendor object with pending status

### GET /vendors/profile
Get current vendor profile (Protected - Vendor only)

**Response (200):** Vendor object

### PUT /vendors/profile
Update vendor profile (Protected - Vendor only)

**Request:** Any vendor fields to update

**Response (200):** Updated vendor object

### GET /vendors
List all approved vendors

**Query Parameters:**
- `page` (optional)
- `limit` (optional)
- `status` (optional, default: "approved")

**Response (200):** List of vendors with pagination

### GET /vendors/:id
Get vendor profile details

**Response (200):** Vendor object

### GET /vendors/:vendorId/products
Get vendor's products

**Query Parameters:**
- `page` (optional)
- `limit` (optional)

**Response (200):** List of products with pagination

### GET /vendors/earnings
Get vendor earnings (Protected - Vendor only)

**Response (200):**
```json
{
  "totalEarnings": 10000,
  "totalOrders": 50
}
```

### POST /vendors/:vendorId/approve
Approve vendor application (Protected - Admin only)

**Request:**
```json
{
  "reason": "Application approved"
}
```

**Response (200):**
```json
{
  "message": "Vendor approved",
  "vendor": {...}
}
```

### POST /vendors/:vendorId/reject
Reject vendor application (Protected - Admin only)

**Request:**
```json
{
  "reason": "Incomplete documentation"
}
```

**Response (200):**
```json
{
  "message": "Vendor rejected",
  "vendor": {...}
}
```

---

## Chat Endpoints

### POST /chat/conversations
Create or get conversation

**Request:**
```json
{
  "vendorId": "vendor_user_id",
  "productId": "product_id" // optional
}
```

**Response (200):** Conversation object

### GET /chat/conversations
Get user's conversations (Protected)

**Query Parameters:**
- `page` (optional)
- `limit` (optional)

**Response (200):**
```json
{
  "conversations": [
    {
      "_id": "chat_id",
      "conversationId": "chat-buyer-vendor",
      "buyerId": {...},
      "vendorId": {...},
      "lastMessage": "Message text",
      "lastMessageTime": "2024-01-01T00:00:00Z",
      "status": "active"
    }
  ],
  "pagination": {...}
}
```

### GET /chat/conversations/:conversationId
Get conversation messages (Protected)

**Query Parameters:**
- `page` (optional)
- `limit` (optional)

**Response (200):**
```json
{
  "messages": [
    {
      "_id": "message_id",
      "senderId": "user_id",
      "senderType": "buyer",
      "message": "Message text",
      "isRead": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### POST /chat/messages
Send message (Protected)

**Request:**
```json
{
  "conversationId": "chat-id",
  "message": "Message text",
  "attachments": [
    {
      "url": "file_url",
      "type": "image"
    }
  ]
}
```

**Response (201):** Updated conversation object

### PUT /chat/conversations/:conversationId/mark-read
Mark messages as read (Protected)

**Response (200):** Updated conversation object

### PUT /chat/conversations/:conversationId/close
Close conversation (Protected)

**Response (200):** Updated conversation object

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Server Error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| /auth/login | 5 requests per 15 minutes |
| /api/* | 100 requests per 15 minutes |
| /products/upload/* | 20 uploads per hour |

---

## WebSocket Events (Socket.io)

### Server Events
- `join-conversation` - Join conversation room
- `new-message` - Send new message
- `user-typing` - Notify typing
- `user-stop-typing` - Stop typing

### Client Events
- `message` - Receive new message
- `typing` - User is typing
- `stop-typing` - User stopped typing

---

## Examples

### Login & Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "cognito_token"
  }'
```

### Create Product with Presigned URL
```bash
# 1. Get presigned URL
curl -X POST http://localhost:5000/api/products/upload/presigned-url \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "product.jpg",
    "contentType": "image/jpeg"
  }'

# 2. Upload to S3 using presigned URL
curl -X PUT "<PRESIGNED_URL>" \
  -H "Content-Type: image/jpeg" \
  --data-binary @product.jpg

# 3. Create product with image URL
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Name",
    "price": 99.99,
    "thumbnail": "https://s3.amazonaws.com/.../product.jpg",
    ...
  }'
```

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "product_id",
        "quantity": 2
      }
    ],
    "paymentMethod": "stripe",
    "shippingAddress": {...}
  }'
```
