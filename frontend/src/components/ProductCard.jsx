import React from 'react';
import { formatCurrency } from '../utils/helpers';

export const ProductCard = ({ product, onAddToCart }) => {
  const discountPercentage = product.discount || 0;
  const displayPrice = product.price;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer group">
      {/* Product Image */}
      <div className="relative overflow-hidden h-48 bg-gray-200">
        <img
          src={product.thumbnail || product.images?.[0]?.url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition"
        />
        {discountPercentage > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
            -{discountPercentage}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Vendor */}
        <p className="text-xs text-gray-500 mb-1">
          {product.vendorId?.storeName || 'Vendor'}
        </p>

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.round(product.rating) ? '★' : '☆'}>
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(displayPrice)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Stock Status */}
        <div className="mb-4">
          {product.stock > 0 ? (
            <span className="text-xs text-green-600 font-semibold">In Stock</span>
          ) : (
            <span className="text-xs text-red-600 font-semibold">Out of Stock</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium text-sm"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};
