import React from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const Avatar = ({ src, alt, size = 'md', className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  const initials = alt
    ? alt
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '?';

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full font-medium text-white ${isDark ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-gradient-to-br from-blue-500 to-cyan-600'} ${className}`}
    >
      {initials}
    </div>
  );
};

export default Avatar;
