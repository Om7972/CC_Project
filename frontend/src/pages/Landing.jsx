import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useApi';
import { ProductCard } from '../components/ProductCard';
import { LoadingSkeleton } from '../components/Loading';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

export const LandingPage = () => {
  const { data, isLoading } = useProducts({ limit: 12 });
  const { addItem } = useCartStore();

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success('Added to cart!');
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                Welcome to CloudMart
              </h1>
              <p className="text-xl mb-6 opacity-90">
                Shop from thousands of vendors, all on one platform. Discover quality products at great prices.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/products"
                  className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
                >
                  Shop Now
                </Link>
                <Link
                  to="/vendors"
                  className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition"
                >
                  Become a Vendor
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1460925895917-aeb19be489c7?w=500&h=400&fit=crop"
                alt="Shopping"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Why Shop at CloudMart</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🛍️',
                title: 'Wide Selection',
                description: 'Browse thousands of products from trusted vendors',
              },
              {
                icon: '🚚',
                title: 'Fast Shipping',
                description: 'Quick and reliable delivery to your doorstep',
              },
              {
                icon: '🛡️',
                title: 'Buyer Protection',
                description: 'Your purchases are protected with our guarantee',
              },
            ].map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12">Featured Products</h2>

          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data?.products?.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Sell on CloudMart?</h2>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of successful vendors. Start your store today!
          </p>
          <Link
            to="/vendor/register"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            Become a Vendor
          </Link>
        </div>
      </section>
    </div>
  );
};
