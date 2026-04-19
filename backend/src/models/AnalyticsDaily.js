const mongoose = require('mongoose');

const analyticsDailySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    orderCount: { type: Number, default: 0 },
    unitsSold: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true }
);

analyticsDailySchema.index({ date: 1, vendorId: 1 }, { unique: true });

module.exports = mongoose.model('AnalyticsDaily', analyticsDailySchema);
