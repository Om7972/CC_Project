import React from 'react';

export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-10 w-10 border-4' };
  return <span className={`${sizes[size]} inline-block animate-spin rounded-full border-slate-700 border-t-cyan-400`} />;
}
