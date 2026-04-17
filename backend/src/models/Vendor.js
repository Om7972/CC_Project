const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    userId: {
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
    description: {
      type: String,
    },
    logo: {
      type: String,
    },
    banner: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    bankAccount: {
      accountHolder: String,
      accountNumber: String,
      routingNumber: String,
      bankName: String,
    },
    businessInfo: {
      businessName: String,
      taxId: String,
      businessAddress: String,
      businessRegistration: String,
    },
    policies: {
      returnPolicy: String,
      shippingPolicy: String,
      refundPolicy: String,
    },
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
    },
    verificationDocuments: [
      {
        type: String,
        url: String,
      },
    ],
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvalDate: Date,
    rejectionReason: String,
    suspensionReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);
