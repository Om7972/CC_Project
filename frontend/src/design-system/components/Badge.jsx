import React from 'react';

const map = {
  Free: 'bg-slate-700 text-slate-100',
  Pro: 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40',
  Enterprise: 'bg-amber-500/20 text-amber-300 border border-amber-400/40',
  buyer: 'bg-blue-500/20 text-blue-300',
  vendor: 'bg-emerald-500/20 text-emerald-300',
  admin: 'bg-rose-500/20 text-rose-300',
  active: 'bg-emerald-500/20 text-emerald-300',
  pending: 'bg-amber-500/20 text-amber-300 animate-pulse',
  banned: 'bg-rose-500/20 text-rose-300',
  shipped: 'bg-sky-500/20 text-sky-300',
  delivered: 'bg-emerald-500/20 text-emerald-300',
  cancelled: 'bg-rose-500/20 text-rose-300',
};

export function Badge({ children, animate, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${map[children] || 'bg-slate-700 text-slate-100'} ${animate ? 'animate-pulse' : ''} ${className}`}>
      {children}
    </span>
  );
}
