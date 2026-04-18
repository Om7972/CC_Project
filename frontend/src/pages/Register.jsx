import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '../hooks/useForm';
import { FormInput } from '../components/FormComponents';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api-client';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: async (values) => {
      const response = await authAPI.register(values);
      return response.data;
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success('Welcome to CloudMart!');
      navigate('/');
    },
    onError: (error) => {
      const errorData = error.response?.data?.error;
      const message = typeof errorData === 'object' ? errorData?.message : errorData;
      toast.error(message || 'Registration failed. Please try again.');
    },
  });

  const { values, handleChange, handleSubmit, isSubmitting } = useForm(
    { name: '', email: '', password: '' },
    async (values) => {
      await registerMutation.mutateAsync(values);
    }
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-600 via-indigo-700 to-slate-950 text-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-1/4 w-80 h-80 rounded-full bg-violet-500/30 blur-3xl animate-pulse-slow" />
        <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl animate-float" />
        <div className="absolute left-1/3 bottom-0 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl animate-spin-slow" />
      </div>

      <div className="relative w-full max-w-3xl backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-12 overflow-hidden animate-fade-in-up">
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.4),transparent_35%)] opacity-20 pointer-events-none" />
        <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] items-center">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/10 shadow-[0_25px_80px_-40px_rgba(59,130,246,0.6)] backdrop-blur-xl animate-tilt">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-200 font-semibold mb-3">Create your free account</p>
              <h1 className="text-4xl font-bold tracking-tight text-white">Join CloudMart</h1>
              <p className="mt-4 text-slate-200 leading-7">
                Start selling and buying from the smartest marketplace. Your onboarding is fast, secure and fully animated.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {['Fast onboarding', 'Secure checkout', 'Vibrant design', '3D interactions'].map((item, idx) => (
                <div key={idx} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-lg hover:-translate-y-1 hover:bg-white/10 transition-transform duration-300">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-3xl bg-slate-950/90 border border-white/10 p-8 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="mb-8 text-center">
              <span className="inline-flex px-4 py-1 rounded-full text-xs uppercase tracking-[0.35em] text-cyan-200 bg-cyan-500/10 shadow-sm">
                Sign up
              </span>
              <h2 className="mt-4 text-3xl font-semibold text-white">Register</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormInput
                label="Full name"
                name="name"
                type="text"
                value={values.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />

              <FormInput
                label="Email address"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />

              <FormInput
                label="Password"
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-transform duration-200"
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-300">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-cyan-300 hover:text-white transition"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
