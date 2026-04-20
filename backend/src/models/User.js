const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    cognitoId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    displayName: { type: String, required: true },
    name: { type: String },
    avatar: { type: String },
    bio: { type: String, maxlength: 280 },
    phone: { type: String },
    website: { type: String },
    location: { type: String },
    role: {
      type: String,
      enum: ['buyer', 'vendor', 'admin'],
      default: 'buyer',
    },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    planExpiresAt: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    isEmailVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    banReason: String,
    preferences: {
      theme: { type: String, default: 'system' },
      currency: { type: String, default: 'USD' },
      language: { type: String, default: 'en' },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
    },
    loginHistory: [
      { ip: String, userAgent: String, device: String, timestamp: { type: Date, default: Date.now } },
    ],
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    lastSeen: Date,
    loginProvider: {
      type: String,
      enum: ['cognito', 'google', 'local'],
      default: 'cognito',
    },
  },
  { timestamps: true }
);

userSchema.index({ plan: 1 });

userSchema.virtual('isProActive').get(function isProActive() {
  if (this.plan === 'free') return false;
  if (!this.planExpiresAt) return false;
  return this.planExpiresAt > new Date();
});

userSchema.virtual('initials').get(function initials() {
  const source = this.displayName || this.name || '';
  return source
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0].toUpperCase())
    .join('');
});

userSchema.methods.generateInitialsColor = function generateInitialsColor(seed) {
  const palette = ['#0ea5e9', '#22c55e', '#8b5cf6', '#f97316', '#14b8a6', '#e11d48', '#6366f1', '#f59e0b'];
  const value = String(seed || this._id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return palette[value % palette.length];
};

userSchema.virtual('avatarColor').get(function avatarColor() {
  return this.generateInitialsColor(this._id);
});

userSchema.methods.toPublicProfile = function toPublicProfile() {
  return {
    _id: this._id,
    displayName: this.displayName || this.name,
    avatar: this.avatar,
    bio: this.bio,
    website: this.website,
    location: this.location,
    role: this.role,
    plan: this.plan,
    initials: this.initials,
    avatarColor: this.avatarColor,
  };
};

userSchema.pre('save', function trimLoginHistory(next) {
  if (Array.isArray(this.loginHistory) && this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
