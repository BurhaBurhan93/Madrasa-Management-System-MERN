import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} animate-spin rounded-full border-4 border-blue-500 border-t-transparent ${className}`}></div>
    </div>
  );
};

const LoadingOverlay = ({ isLoading, children }) => {
  if (!isLoading) {
    return children;
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <LoadingSpinner size="lg" />
      </div>
      {children}
    </div>
  );
};

export { LoadingSpinner, LoadingOverlay };