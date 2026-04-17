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
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Shopping Cart</h1>
            <p className="text-gray-600 mb-8">Your cart is empty</p>
            <Link
              to="/products"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-4 p-6 border-b hover:bg-gray-50 transition"
                >
                  {/* Product Image */}
                  <img
                    src={item.thumbnail || item.images?.[0]?.url}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                  />

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {formatCurrency(item.price)} each
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="text-lg font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Item Total & Remove */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="text-red-600 hover:text-red-700 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-20">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-semibold">{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold">{formatCurrency(total)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full block text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition mb-4"
            >
              Proceed to Checkout
            </Link>

            <button
              onClick={() => {
                clearCart();
                toast.success('Cart cleared');
              }}
              className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
