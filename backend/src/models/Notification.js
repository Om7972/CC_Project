const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: mongoose.Schema.Types.Mixed,
    imageUrl: String,
    isRead: { type: Boolean, default: false },
    readAt: Date,
    link: String,
    expiresAt: Date,
  },
  { timestamps: true }
);

notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);
