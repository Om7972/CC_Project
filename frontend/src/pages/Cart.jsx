import React from 'react';
import { useCartStore } from '../store/cartStore';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

export const CartPage = () => {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleRemoveItem = (productId) => {
    removeItem(productId);
    toast.success('Item removed from cart');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 text-slate-100">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-800 bg-slate-900/80 p-12 text-center shadow-2xl shadow-slate-950/40">
          <h1 className="text-4xl font-bold mb-4">Shopping Cart</h1>
          <p className="text-slate-400 mb-8">Your cart is empty — add something exciting from our store.</p>
          <Link
            to="/products"
            className="inline-flex rounded-full bg-cyan-400 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-4xl font-bold">Shopping Cart</h1>
          <p className="mt-3 text-slate-400">Review your items and complete checkout with a smooth, animated experience.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="group rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/30 transition hover:-translate-y-1"
              >
                <div className="grid gap-4 md:grid-cols-[100px_1fr_auto] items-center">
                  <img
                    src={item.thumbnail || item.images?.[0]?.url}
                    alt={item.name}
                    className="h-24 w-24 rounded-3xl object-cover border border-slate-800"
                  />

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{item.name}</h3>
                    <p className="text-slate-400 mb-4">{formatCurrency(item.price)} each</p>
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-300">
                      <button
                        onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        className="rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-800"
                      >
                        −
                      </button>
                      <span className="font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-800"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-white mb-3">{formatCurrency(item.price * item.quantity)}</p>
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="text-sm font-semibold text-rose-400 hover:text-rose-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40 sticky top-8 h-fit">
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
            <div className="space-y-4 text-slate-300 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span className="font-semibold text-white">{formatCurrency(tax)}</span>
              </div>
              <div className="border-t border-slate-800 pt-4 flex justify-between text-lg font-bold text-white">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block rounded-full bg-cyan-400 px-6 py-3 text-center text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform"
            >
              Proceed to Checkout
            </Link>

            <button
              onClick={() => {
                clearCart();
                toast.success('Cart cleared');
              }}
              className="mt-4 w-full rounded-full border border-slate-800 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-950/80 transition"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};