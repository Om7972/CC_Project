import React from 'react';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

const WISHLIST_KEY = 'cloudmart_wishlist_v1';

function readWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const a = raw ? JSON.parse(raw) : [];
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

function writeWishlist(ids) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
}

export const ProductCard = ({ product, onAddToCart, onView, variant = 'default' }) => {
  const discountPercentage = product.discount || 0;
  const displayPrice = product.price;
  const isCompact = variant === 'compact';
  const [wishlisted, setWishlisted] = React.useState(() =>
    readWishlist().includes(String(product._id))
  );

  const toggleWishlist = (e) => {
    e.stopPropagation();
    const id = String(product._id);
    const next = readWishlist().filter((x) => x !== id);
    if (!wishlisted) next.push(id);
    writeWishlist(next);
    setWishlisted(!wishlisted);
  };

  const popular = (product.reviewCount || 0) > 40;
  const img =
    product.processedImageUrls?.w400 ||
    product.thumbnail ||
    product.images?.[0]?.url;

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl shadow-slate-950/40 card-hover ${
        isCompact ? '' : 'perspective'
      }`}
    >
      <div
        className={`relative overflow-hidden bg-slate-800 ${isCompact ? 'h-44' : 'h-56'}`}
      >
        <img
          src={img}
          alt={product.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06] group-hover:rotate-1"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />

        {discountPercentage > 0 && (
          <div className="absolute top-3 right-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-orange-400 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-fuchsia-500/20">
            -{discountPercentage}%
          </div>
        )}

        {product.isFeatured && (
          <div className="absolute top-3 left-3 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-950">
            Featured
          </div>
        )}

        {popular && (
          <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-slate-950/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-200 backdrop-blur">
            Best seller
          </div>
        )}

        <div className="absolute right-3 top-14 flex flex-col gap-2 opacity-0 transition duration-300 group-hover:opacity-100">
          <button
            type="button"
            onClick={toggleWishlist}
            className={`rounded-full p-2 shadow-lg backdrop-blur transition ${
              wishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-slate-950/70 text-slate-200 hover:bg-slate-800'
            }`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
          </button>
          {onView && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="rounded-full bg-slate-950/70 p-2 text-slate-200 shadow-lg backdrop-blur hover:bg-slate-800"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className={`space-y-4 ${isCompact ? 'p-4' : 'p-5'}`}>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs uppercase tracking-[0.2em] text-slate-400">
            {product.vendorId?.storeName || 'Vendor'}
          </p>
          <span className="shrink-0 text-xs text-slate-500">
            {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
          </span>
        </div>

        <h3
          className={`font-semibold leading-tight text-white line-clamp-2 ${
            isCompact ? 'text-base' : 'text-lg'
          }`}
        >
          {product.name}
        </h3>

        <div className="flex items-center gap-3 text-sm text-slate-300">
          <div className="flex items-center gap-0.5 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < Math.round(product.rating || 0) ? '★' : '☆'}</span>
            ))}
          </div>
          <span className="text-slate-500">({product.reviewCount ?? 0})</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={`font-bold text-white ${isCompact ? 'text-xl' : 'text-2xl'}`}>
              {formatCurrency(displayPrice)}
            </p>
            {product.originalPrice && (
              <p className="text-sm text-slate-500 line-through">
                {formatCurrency(product.originalPrice)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
            {!isCompact && 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
