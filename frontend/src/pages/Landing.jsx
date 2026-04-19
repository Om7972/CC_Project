import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useApi';
import ProductCard from '../components/ProductCard';
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
    <div className="min-h-screen overflow-hidden">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-950 py-24">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute left-[-10%] top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl animate-float" />
          <div className="absolute right-[-5%] top-1/3 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl animate-pulse-slow" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                Marketplace of tomorrow
              </p>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-tight animate-fade-in-up">
                Welcome to CloudMart
              </h1>
              <p className="text-lg text-slate-300 max-w-xl leading-relaxed animate-fade-in-up">
                Discover and buy from thousands of trusted vendors, experience smoother checkout, and enjoy a modern market built for every buyer.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform"
                >
                  Shop Now
                </Link>
                <Link
                  to="/register"
                  className="rounded-full border border-white/20 bg-white/5 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  Create Account
                </Link>
              </div>
            </div>

            <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl animate-tilt">
              <div className="h-full rounded-[1.75rem] overflow-hidden border border-slate-800/60 shadow-inner shadow-slate-950/40">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-aeb19be489c7?w=900&q=80"
                  alt="Shopping"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Why Shop at CloudMart</h2>

          <div className="grid gap-6 lg:grid-cols-3">
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
              <div key={idx} className="rounded-[2rem] border border-slate-800/70 bg-slate-950/80 p-8 text-center shadow-xl shadow-slate-950/20 hover:-translate-y-2 transition-transform duration-500">
                <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-cyan-500/15 flex items-center justify-center text-3xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-cyan-300 uppercase tracking-[0.4em] text-sm mb-3">Featured products</p>
              <h2 className="text-4xl font-bold text-white">Shop the best selections</h2>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform"
            >
              Browse catalog
            </Link>
          </div>

          <div className="mt-10">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {data?.products?.map((product) => (
                  <div key={product._id} className="animate-fade-in-up">
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
            <h2 className="text-3xl font-bold text-white mb-4">Want to Sell on CloudMart?</h2>
            <p className="text-slate-300 mb-6">
              Join thousands of successful vendors. Start your store today and unlock powerful storefront tools.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 hover:scale-[1.02] transition-transform"
            >
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
