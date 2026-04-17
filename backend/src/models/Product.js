const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    images: [
      {
        url: String,
        altText: String,
      },
    ],
    thumbnail: String,
    sku: {
      type: String,
      unique: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      default: 'piece',
    },
    specifications: {
      type: Map,
      of: String,
    },
    tags: [String],
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
    status: {
      type: String,
      enum: ['draft', 'active', 'inactive', 'archived'],
      default: 'active',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
    shipping: {
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
      shippingCost: Number,
      freeShipping: Boolean,
    },
    warranty: {
      period: Number,
      unit: String,
    },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ vendorId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });

module.exports = mongoose.model('Product', productSchema);
