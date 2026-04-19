const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    orderId: String,
    channel: {
      type: String,
      enum: ['email', 'push', 'sms'],
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'sent', 'failed'],
      default: 'queued',
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
    },
    errorMessage: String,
  },
  { timestamps: true }
);

notificationLogSchema.index({ vendorId: 1, createdAt: -1 });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
