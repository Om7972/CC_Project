const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: {
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
      ref: 'Vendor',
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    subtotal: Number,
    shippingCost: Number,
    tax: Number,
    discount: Number,
    paymentMethod: {
      type: String,
      enum: ['stripe', 'wallet'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    stripePaymentIntentId: String,
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
    shippingAddress: {
      recipientName: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      phone: String,
    },
    billingAddress: {
      recipientName: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      phone: String,
    },
    trackingNumber: String,
    shippingProvider: String,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    notes: String,
    cancellationReason: String,
    cancelledAt: Date,
    refundAmount: Number,
    refundReason: String,
    refundedAt: Date,
  },
  { timestamps: true }
);

orderSchema.index({ buyerId: 1 });
orderSchema.index({ vendorId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderId: 1 });

module.exports = mongoose.model('Order', orderSchema);
