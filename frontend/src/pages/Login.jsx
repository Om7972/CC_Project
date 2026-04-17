import React, { useState } from 'react';
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
  const [useGoogle, setUseGoogle] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (values) => {
      // In a real app, you'd verify the token with your backend
      // For now, we'll return a mock response
      const response = await authAPI.login(values.idToken);
      return response.data;
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success('Logged in successfully!');
      navigate('/');
    },
    onError: () => {
      toast.error('Login failed. Please try again.');
    },
  });

  const { values, handleChange, handleSubmit, isSubmitting } = useForm(
    { email: '', password: '', idToken: '' },
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-6">
            Sign In to CloudMart
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full mt-6 px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
            >
              <img
                src="https://www.gstatic.com/firebaseapp/v8.2.0/images/firebaseui-logo.png"
                alt="Google"
                className="w-5 h-5 mr-2"
              />
              <span>Sign in with Google</span>
            </button>
          </div>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
