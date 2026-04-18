const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      unique: true,
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    messages: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        senderType: {
          type: String,
          enum: ['buyer', 'vendor'],
        },
        message: String,
        attachments: [
          {
            url: String,
            type: String,
          },
        ],
        isRead: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastMessage: String,
    lastMessageTime: Date,
    lastMessageSenderId: mongoose.Schema.Types.ObjectId,
    buyerUnreadCount: {
      type: Number,
      default: 0,
    },
    vendorUnreadCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
    closedBy: mongoose.Schema.Types.ObjectId,
    closedAt: Date,
  },
  { timestamps: true }
);

chatSchema.index({ buyerId: 1, vendorId: 1 });
chatSchema.index({ lastMessageTime: -1 });

module.exports = mongoose.model('Chat', chatSchema);
