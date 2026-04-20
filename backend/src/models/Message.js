const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, default: '' },
    attachments: [{ url: String, type: String, name: String }],
    readBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, readAt: { type: Date, default: Date.now } }],
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
