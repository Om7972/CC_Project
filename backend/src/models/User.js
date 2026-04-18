const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    cognitoId: {
      type: String,
      required: function() {
        return this.loginProvider === 'cognito' || this.loginProvider === 'google';
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
      required: function() {
        return this.loginProvider === 'local';
      },
      select: false,
    },
    role: {
      type: String,
      enum: ['buyer', 'vendor', 'admin'],
      default: 'buyer',
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    loginProvider: {
      type: String,
      enum: ['cognito', 'google', 'local'],
      default: 'cognito',
    },
  },
  { timestamps: true }
);

userSchema.index({ cognitoId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', userSchema);
