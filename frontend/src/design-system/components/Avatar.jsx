import React from 'react';
import { Badge } from './Badge';

const colors = ['#0ea5e9', '#8b5cf6', '#22c55e', '#f97316', '#e11d48', '#14b8a6', '#f59e0b', '#6366f1'];
const sizeMap = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' };

const hash = (v = '') => Array.from(v).reduce((acc, c) => acc + c.charCodeAt(0), 0);
const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'U';

export function Avatar({ src, name, size = 'md', status, badge }) {
  const color = colors[hash(name) % colors.length];
  const statusClass = status === 'online' ? 'bg-emerald-400' : status === 'away' ? 'bg-amber-400' : 'bg-slate-400';

  return (
    <div className="relative inline-flex">
      {src ? (
        <img src={src} alt={name} className={`${sizeMap[size]} rounded-full object-cover`} />
      ) : (
        <div className={`${sizeMap[size]} rounded-full flex items-center justify-center font-semibold text-white`} style={{ backgroundColor: color }}>
          {initials(name)}
        </div>
      )}
      {status && <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-slate-950 ${statusClass} ${status === 'online' ? 'animate-pulse' : ''}`} />}
      {badge && <Badge className="absolute -bottom-2 -right-6">{badge}</Badge>}
    </div>
  );
}
