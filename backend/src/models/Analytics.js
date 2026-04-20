const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    date: { type: String, required: true },
    revenue: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    newBuyers: { type: Number, default: 0 },
    productViews: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    topProducts: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, revenue: Number, units: Number }],
  },
  { timestamps: true }
);

analyticsSchema.index({ vendor: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
