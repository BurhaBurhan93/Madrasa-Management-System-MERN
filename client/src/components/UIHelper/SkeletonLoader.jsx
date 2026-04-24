import React, { useState, useEffect } from 'react';

// Skeleton Loader Component
export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-xl p-6 shadow-sm animate-pulse ${className}`}>
    <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
    <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
    <div className="p-4 border-b border-slate-200">
      <div className="h-6 bg-slate-200 rounded w-1/4 mb-2"></div>
      <div className="h-3 bg-slate-200 rounded w-1/3"></div>
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex gap-4">
          <div className="h-4 bg-slate-200 rounded flex-1"></div>
          <div className="h-4 bg-slate-200 rounded flex-1"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonStats = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
        <div className="h-3 bg-slate-200 rounded w-1/2 mb-3"></div>
        <div className="h-8 bg-slate-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-slate-200 rounded w-1/3"></div>
      </div>
    ))}
  </div>
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-3 animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-4 bg-slate-200 rounded" style={{ width: `${100 - (i * 15)}%` }}></div>
    ))}
  </div>
);

export const SkeletonButton = ({ className = '' }) => (
  <div className={`h-10 bg-slate-200 rounded-lg animate-pulse w-24 ${className}`}></div>
);

export const SkeletonAvatar = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };
  
  return (
    <div className={`${sizeClasses[size]} bg-slate-200 rounded-full animate-pulse ${className}`}></div>
  );
};

// Page Skeleton Loader with 10-second timeout
export const PageSkeleton = ({ variant = 'default', timeout = 10000 }) => {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, timeout);
    return () => clearTimeout(timer);
  }, [timeout]);

  if (timedOut) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 mb-6 text-slate-200">
          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-700 mb-2">Loading took too long</h3>
        <p className="text-slate-400 font-medium mb-6">Please refresh the page or try again later</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-cyan-600 text-white rounded-2xl font-bold hover:bg-cyan-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }
  if (variant === 'dashboard') {
    return (
      <div className="space-y-6">
        <SkeletonStats count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-64" />
        </div>
        <SkeletonTable rows={5} />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
          <SkeletonButton />
        </div>
        <SkeletonTable rows={8} />
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-4">
          <SkeletonButton className="w-28" />
          <SkeletonButton className="w-28" />
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="space-y-6">
      <SkeletonStats count={3} />
      <SkeletonCard className="h-48" />
      <SkeletonCard className="h-48" />
    </div>
  );
};

export default PageSkeleton;
