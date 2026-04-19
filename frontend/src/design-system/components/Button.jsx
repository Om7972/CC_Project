import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { buttonMotion } from '../animations';

const variantClass = {
  primary: 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20',
  secondary: 'bg-violet-500 text-white shadow-lg shadow-violet-500/20',
  ghost: 'border border-slate-700 bg-slate-900/80 text-slate-100',
  danger: 'bg-rose-500 text-white',
  success: 'bg-emerald-500 text-slate-950',
};

const sizeClass = { sm: 'px-3 py-2 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  success,
  className = '',
  disabled,
  ...props
}) {
  return (
    <motion.button
      type="button"
      disabled={disabled || loading}
      whileHover={disabled ? undefined : buttonMotion.whileHover}
      whileTap={disabled ? undefined : buttonMotion.whileTap}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.span>
        ) : success ? (
          <motion.span
            key="success"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 16 } }}
            exit={{ opacity: 0 }}
          >
            <Check className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
