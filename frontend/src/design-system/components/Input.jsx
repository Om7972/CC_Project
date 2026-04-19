import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export function Input({ error, valid, className = '', ...props }) {
  return (
    <motion.div animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.3 }}>
      <div className="relative">
        <input
          className={`w-full rounded-2xl border bg-slate-900/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition-colors ${error ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-400'} ${className}`}
          {...props}
        />
        {valid && !error && <CheckCircle2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-400" />}
      </div>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </motion.div>
  );
}
