import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fadeUp } from '../animations';

export function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-black/60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="absolute inset-0" onClick={onClose} aria-label="Close modal" />
          <motion.div {...fadeUp} className="relative mx-auto mt-24 max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6">
            {title && <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
