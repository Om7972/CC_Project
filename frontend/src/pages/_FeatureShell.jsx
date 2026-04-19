import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '../design-system/animations';

export function FeatureShell({ title, subtitle, children }) {
  return (
    <motion.section {...fadeUp} className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="mt-2 text-slate-400">{subtitle}</p>
        </header>
        {children}
      </div>
    </motion.section>
  );
}
