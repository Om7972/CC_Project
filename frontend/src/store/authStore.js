import { create } from 'zustand';
import { useLocalStorage } from '../hooks/useForm';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  plan: localStorage.getItem('plan') || 'Free',
  role: localStorage.getItem('role') || 'buyer',
  isAuthenticated: !!localStorage.getItem('token'),

  login: (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('plan', userData?.plan || 'Free');
    localStorage.setItem('role', userData?.role || 'buyer');
    set({
      user: userData,
      token,
      plan: userData?.plan || 'Free',
      role: userData?.role || 'buyer',
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('plan');
    localStorage.removeItem('role');
    set({
      user: null,
      token: null,
      plan: 'Free',
      role: 'buyer',
      isAuthenticated: false,
    });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  updateToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      set({
        token,
        user: JSON.parse(user),
        plan: localStorage.getItem('plan') || JSON.parse(user)?.plan || 'Free',
        role: localStorage.getItem('role') || JSON.parse(user)?.role || 'buyer',
        isAuthenticated: true,
      });
    }
  },
}));
