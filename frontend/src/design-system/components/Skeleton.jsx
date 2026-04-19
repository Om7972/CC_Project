import React from 'react';

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-700/60 ${className}`} />;
}

export function SkeletonLoader({ variant = 'ProductCard' }) {
  if (variant === 'ProfileHeader') return <Skeleton className="h-24 w-full" />;
  if (variant === 'OrderRow') return <Skeleton className="h-14 w-full" />;
  if (variant === 'ChatMessage') return <Skeleton className="h-10 w-2/3" />;
  if (variant === 'DashboardMetric') return <Skeleton className="h-20 w-full" />;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-64 w-full" />
      ))}
    </div>
  );
}
