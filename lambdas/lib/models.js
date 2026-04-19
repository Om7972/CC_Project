const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    name: String,
    description: String,
    category: String,
    price: Number,
    originalPrice: Number,
    discount: { type: Number, default: 0 },
    images: [{ url: String, altText: String }],
    thumbnail: String,
    processedImageUrls: {
      w800: String,
      w400: String,
      w150: String,
    },
    sku: String,
    stock: { type: Number, default: 0 },
    unit: String,
    tags: [String],
    rating: Number,
    reviewCount: Number,
    status: String,
    isFeatured: Boolean,
  },
  { timestamps: true, strict: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    image: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    items: [orderItemSchema],
    totalAmount: Number,
    subtotal: Number,
    shippingCost: Number,
    tax: Number,
    discount: Number,
    paymentMethod: String,
    paymentStatus: String,
    status: String,
    shippingAddress: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true, strict: false }
);

const vendorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    storeName: String,
    status: String,
  },
  { timestamps: true, strict: false }
);

const userSchema = new mongoose.Schema(
  {
    email: String,
    name: String,
  },
  { timestamps: true, strict: false }
);

const analyticsDailySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    orderCount: { type: Number, default: 0 },
    unitsSold: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true, strict: false }
);

const notificationLogSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    orderId: String,
    channel: { type: String, enum: ['email', 'push', 'sms'] },
    status: { type: String, enum: ['queued', 'sent', 'failed'] },
    payload: mongoose.Schema.Types.Mixed,
    errorMessage: String,
  },
  { timestamps: true, strict: false }
);

function getModels() {
  return {
    Product: mongoose.models.Product || mongoose.model('Product', productSchema),
    Order: mongoose.models.Order || mongoose.model('Order', orderSchema),
    Vendor: mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema),
    User: mongoose.models.User || mongoose.model('User', userSchema),
    AnalyticsDaily:
      mongoose.models.AnalyticsDaily || mongoose.model('AnalyticsDaily', analyticsDailySchema),
    NotificationLog:
      mongoose.models.NotificationLog || mongoose.model('NotificationLog', notificationLogSchema),
  };
}

module.exports = { getModels };
