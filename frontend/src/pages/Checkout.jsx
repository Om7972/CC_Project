import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '../hooks/useForm';
import { FormInput } from '../components/FormComponents';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { orderAPI } from '../services/api-client';
import toast from 'react-hot-toast';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, clearCart } = useCartStore();

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const checkoutMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await orderAPI.create({
        items: items.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: orderData,
        totalAmount: total,
      });
      return response.data;
    },
    onSuccess: (data) => {
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.order._id}`);
    },
    onError: (error) => {
      const errorData = error.response?.data?.error;
      const message = typeof errorData === 'object' ? errorData?.message : errorData;
      toast.error(message || 'Failed to place order. Please try again.');
    },
  });

  const { values, handleChange, handleSubmit, isSubmitting } = useForm(
    {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    },
    async (values) => {
      if (!user) {
        toast.error('Please log in to place an order');
        navigate('/login');
        return;
      }
      await checkoutMutation.mutateAsync(values);
    }
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 text-slate-100">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-800 bg-slate-900/80 p-12 text-center shadow-2xl shadow-slate-950/40">
          <h1 className="text-4xl font-bold mb-4">Checkout</h1>
          <p className="text-slate-400 mb-8">Your cart is empty. Add some items before checking out.</p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex rounded-full bg-cyan-400 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-4xl font-bold">Checkout</h1>
          <p className="mt-3 text-slate-400">Complete your order with secure payment processing.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            {/* Order Items */}
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-4 items-center">
                    <img
                      src={item.thumbnail || item.images?.[0]?.url}
                      alt={item.name}
                      className="h-16 w-16 rounded-3xl object-cover border border-slate-800"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      <p className="text-slate-400">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
              <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  label="Street Address"
                  name="street"
                  value={values.street}
                  onChange={handleChange}
                  placeholder="123 Main St"
                  required
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormInput
                    label="City"
                    name="city"
                    value={values.city}
                    onChange={handleChange}
                    placeholder="New York"
                    required
                  />
                  <FormInput
                    label="State"
                    name="state"
                    value={values.state}
                    onChange={handleChange}
                    placeholder="NY"
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormInput
                    label="ZIP Code"
                    name="zipCode"
                    value={values.zipCode}
                    onChange={handleChange}
                    placeholder="10001"
                    required
                  />
                  <FormInput
                    label="Country"
                    name="country"
                    value={values.country}
                    onChange={handleChange}
                    placeholder="USA"
                    required
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Order Total & Payment */}
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40 sticky top-8">
              <h2 className="text-2xl font-bold mb-6">Payment Summary</h2>
              <div className="space-y-4 text-slate-300 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span className="font-semibold text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-800 pt-4 flex justify-between text-lg font-bold text-white">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : `Complete Order - $${total.toFixed(2)}`}
              </button>

              <p className="text-xs text-slate-500 mt-4 text-center">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};