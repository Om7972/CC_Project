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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-12">Products</h1>

        {/* Filters */}
        <div className="mb-8 grid md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search products..."
            className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Fashion</option>
            <option>Home & Garden</option>
            <option>Sports</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Most Popular</option>
          </select>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2">
            {[...Array(pagination.pages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setPage(idx + 1)}
                className={`px-4 py-2 rounded-lg transition ${
                  page === idx + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-100'
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
