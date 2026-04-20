const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: String, enum: ['pro', 'enterprise'], required: true },
    billingCycle: { type: String, enum: ['monthly', 'annual'], required: true },
    stripeSubscriptionId: { type: String, unique: true, sparse: true },
    stripeCustomerId: String,
    stripePriceId: String,
    status: { type: String, enum: ['active', 'past_due', 'cancelled', 'trialing', 'paused'], default: 'active' },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: { type: Boolean, default: false },
    trialStart: Date,
    trialEnd: Date,
    isTrial: { type: Boolean, default: false },
    features: {
      maxProducts: Number,
      analyticsAccess: Boolean,
      apiAccess: Boolean,
      customDomain: Boolean,
      prioritySupport: Boolean,
      whiteLabel: Boolean,
    },
    invoices: [{ stripeInvoiceId: String, amount: Number, paidAt: Date, pdfUrl: String }],
    cancellationReason: String,
    pausedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
