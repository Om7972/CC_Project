import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function Drawer({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="absolute inset-0" onClick={onClose} aria-label="Close drawer" />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0, transition: { type: 'spring', stiffness: 280, damping: 28 } }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 h-full w-full max-w-md border-l border-slate-700 bg-slate-900 p-5"
          >
            {children}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
