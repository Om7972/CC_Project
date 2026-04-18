import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const cartCount = getItemCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl shadow-xl shadow-slate-950/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 transition hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-cyan-500/20 flex items-center justify-center ring-1 ring-white/10">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <span className="text-xl font-semibold text-white hidden sm:inline">CloudMart</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 mx-4 hidden md:flex">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-slate-200 hover:text-cyan-300 transition hover:-translate-y-0.5">
              Products
            </Link>
            
            {isAuthenticated && user?.role === 'vendor' && (
              <Link to="/vendor" className="text-gray-700 hover:text-blue-600 transition">
                Dashboard
              </Link>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className="text-gray-700 hover:text-blue-600 transition">
                Admin
              </Link>
            )}

            <Link to="/cart" className="relative text-slate-200 hover:text-cyan-300 transition hover:-translate-y-0.5">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-slate-200 hover:text-cyan-300 transition hover:-translate-y-0.5">
                  {user?.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-2xl border border-slate-700 text-slate-200 hover:bg-slate-900/80 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="rounded-full border border-cyan-500 px-4 py-2 text-cyan-300 hover:bg-cyan-500/10 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-cyan-400 px-4 py-2 text-slate-950 font-semibold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/products" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Products
            </Link>
            <Link to="/cart" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Cart ({cartCount})
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2 text-blue-600 hover:bg-gray-100 rounded">
                  Login
                </Link>
                <Link to="/register" className="block px-4 py-2 bg-blue-600 text-white rounded">
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
