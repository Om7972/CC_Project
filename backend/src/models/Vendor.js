const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    storeName: {
      type: String,
      required: true,
      unique: true,
    },
    storeDescription: String,
    storeLogo: String,
    storeBanner: String,
    category: {
      type: String,
      enum: ['Electronics', 'Fashion', 'Books', 'Digital', 'Home', 'Sports', 'Other'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended'],
      default: 'pending',
    },
    rating: {
      average: { type: Number, min: 0, max: 5, default: 0 },
      count: { type: Number, default: 0 },
    },
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    stripeAccountId: String,
    commissionRate: { type: Number, default: 10, min: 0, max: 100 },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'] },
    socialLinks: {
      instagram: String,
      twitter: String,
      website: String,
    },
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
  },
  { timestamps: true }
);

vendorSchema.index({ status: 1 });
vendorSchema.index({ category: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);
