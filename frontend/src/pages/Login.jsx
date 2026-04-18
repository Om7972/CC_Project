import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '../hooks/useForm';
import { FormInput } from '../components/FormComponents';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api-client';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (values) => {
      const response = await authAPI.login({
        email: values.email,
        password: values.password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success('Logged in successfully!');
      navigate('/');
    },
    onError: (error) => {
      const errorData = error.response?.data?.error;
      const message = typeof errorData === 'object' ? errorData?.message : errorData;
      toast.error(message || 'Login failed. Please try again.');
    },
  });

  const { values, handleChange, handleSubmit, isSubmitting } = useForm(
    { email: '', password: '' },
    async (values) => {
      await loginMutation.mutateAsync(values);
    }
  );

  const handleGoogleLogin = () => {
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;

    const loginUrl = `${cognitoDomain}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&identity_provider=Google`;
    window.location.href = loginUrl;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),transparent_22%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl animate-float" />
        <div className="absolute right-20 top-12 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/50 animate-fade-in-up">
        <div className="mb-8 space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Welcome back</p>
          <h2 className="text-3xl font-bold text-white">Sign in to CloudMart</h2>
          <p className="text-slate-400">Your dashboard is waiting. Smooth checkout and effortless browsing included.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="Email"
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
            placeholder="••••••••"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-3xl px-5 py-3 button-glow text-base hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
          <span className="flex-1 h-px bg-slate-800" />
          <span>Or continue with</span>
          <span className="flex-1 h-px bg-slate-800" />
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-slate-100 hover:border-cyan-400 hover:text-cyan-300 transition"
        >
          <img
            src="https://www.gstatic.com/firebaseapp/v8.2.0/images/firebaseui-logo.png"
            alt="Google"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        <p className="mt-6 text-center text-slate-400">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-cyan-300 hover:text-white transition"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};
