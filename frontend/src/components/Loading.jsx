import React from 'react';

export const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-lg overflow-hidden">
          <div className="h-48 bg-gray-300 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-300 rounded animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse" />
            <div className="h-8 bg-gray-300 rounded animate-pulse mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin`} />
    </div>
  );
};
