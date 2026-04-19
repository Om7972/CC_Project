import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import { Header } from './components/Header';
import { fadeUp } from './design-system/animations';
import { SkeletonLoader } from './design-system/components';
import { ErrorBoundary } from './pages/ErrorBoundary';

const LandingPage = React.lazy(() => import('./pages/Landing').then((m) => ({ default: m.LandingPage })));
const LoginPage = React.lazy(() => import('./pages/Login').then((m) => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/Register').then((m) => ({ default: m.RegisterPage })));
const ProductsPage = React.lazy(() => import('./pages/Products').then((m) => ({ default: m.ProductsPage })));
const CartPage = React.lazy(() => import('./pages/Cart').then((m) => ({ default: m.CartPage })));
const CheckoutPage = React.lazy(() => import('./pages/Checkout').then((m) => ({ default: m.CheckoutPage })));
const ProfileSettingsPage = React.lazy(() => import('./pages/ProfileSettings').then((m) => ({ default: m.ProfileSettingsPage })));
const SubscriptionPage = React.lazy(() => import('./pages/SubscriptionPage').then((m) => ({ default: m.SubscriptionPage })));
const NotificationCenterPage = React.lazy(() => import('./pages/NotificationCenter').then((m) => ({ default: m.NotificationCenterPage })));
const ChatPage = React.lazy(() => import('./pages/ChatPage').then((m) => ({ default: m.ChatPage })));
const MaintenancePage = React.lazy(() => import('./pages/MaintenancePage').then((m) => ({ default: m.MaintenancePage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFoundPage })));

const queryClient = new QueryClient();

function App() {
  const { loadFromStorage, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, []);

  const ProtectedRoute = ({ children }) => (isAuthenticated ? children : <Navigate to="/login" replace />);

  const AnimatedRoutes = () => {
    const location = useLocation();
    return (
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} {...fadeUp}>
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />
            <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationCenterPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Suspense fallback={<div className="p-8"><SkeletonLoader variant="ProductCard" /></div>}>
                <AnimatedRoutes />
              </Suspense>
            </main>
          </div>
        </Router>
      </ErrorBoundary>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
