import React from 'react';
import { formatCurrency } from '../utils/helpers';

export const ProductCard = ({ product, onAddToCart }) => {
  const discountPercentage = product.discount || 0;
  const displayPrice = product.price;

  return (
    <div className="group perspective rounded-3xl card-hover overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl shadow-slate-950/40 transition-transform duration-500 hover:-translate-y-2 hover:shadow-2xl">
      <div className="relative overflow-hidden h-56 bg-slate-800">
        <img
          src={product.thumbnail || product.images?.[0]?.url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:rotate-1"
        />
        {discountPercentage > 0 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-fuchsia-500 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg shadow-fuchsia-500/20">
            -{discountPercentage}%
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{product.vendorId?.storeName || 'Vendor'}</p>
          <span className="text-xs text-slate-500">{product.stock > 0 ? 'In stock' : 'Out of stock'}</span>
        </div>

        <h3 className="text-lg font-semibold text-white leading-tight line-clamp-2">{product.name}</h3>

        <div className="flex items-center gap-3 text-sm text-slate-300">
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < Math.round(product.rating) ? '★' : '☆'}</span>
            ))}
          </div>
          <span>({product.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-white">{formatCurrency(displayPrice)}</p>
            {product.originalPrice && (
              <p className="text-sm text-slate-500 line-through">{formatCurrency(product.originalPrice)}</p>
            )}
          </div>
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="rounded-2xl px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-950 font-semibold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
