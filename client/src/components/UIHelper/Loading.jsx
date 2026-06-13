import React from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} animate-spin rounded-full border-4 ${isDark ? 'border-cyan-400 border-t-transparent' : 'border-cyan-600 border-t-transparent'} ${className}`}></div>
    </div>
  );
};

const LoadingOverlay = ({ isLoading, children }) => {
  if (!isLoading) {
    return children;
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-sm dark:bg-slate-950/70">
        <LoadingSpinner size="lg" />
      </div>
      {children}
    </div>
  );
};

export { LoadingSpinner, LoadingOverlay };
export default LoadingSpinner;
