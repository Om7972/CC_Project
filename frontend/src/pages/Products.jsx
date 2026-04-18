import React from 'react';
import { useProducts } from '../hooks/useApi';
import { ProductCard } from '../components/ProductCard';
import { LoadingSkeleton } from '../components/Loading';
import { useFilterStore } from '../store/filterStore';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

export const ProductsPage = () => {
  const [page, setPage] = React.useState(1);
  const { filters } = useFilterStore();
  const { addItem } = useCartStore();

  const { data, isLoading } = useProducts({
    page,
    limit: 20,
    category: filters.category,
    search: filters.search,
  });

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success('Added to cart!');
  };

  const products = data?.products || [];
  const pagination = data?.pagination || {};

  return (
    <div className="min-h-screen bg-slate-950 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white">Products</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Browse our catalog of top items with dynamic filters and animated product cards.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-[1.5fr_0.9fr_0.9fr]">
          <input
            type="text"
            placeholder="Search products..."
            className="rounded-3xl border border-slate-700 bg-slate-900/90 px-5 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
          <select className="rounded-3xl border border-slate-700 bg-slate-900/90 px-5 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Fashion</option>
            <option>Home & Garden</option>
            <option>Sports</option>
          </select>
          <select className="rounded-3xl border border-slate-700 bg-slate-900/90 px-5 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
            <option>Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Most Popular</option>
          </select>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {products.map((product) => (
              <div key={product._id} className="animate-fade-in-up">
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex flex-wrap justify-center gap-3">
            {[...Array(pagination.pages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setPage(idx + 1)}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  page === idx + 1
                    ? 'bg-cyan-400 text-slate-950 shadow-xl shadow-cyan-500/20'
                    : 'border border-slate-700 text-slate-300 hover:bg-slate-900/80'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
