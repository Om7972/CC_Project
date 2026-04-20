const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true },
    maxUses: Number,
    usedCount: { type: Number, default: 0 },
    minOrderAmount: Number,
    applicableCategories: [String],
    applicableVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    startsAt: Date,
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
