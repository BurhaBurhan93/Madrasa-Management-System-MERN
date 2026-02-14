import React from 'react';

const Avatar = ({ src, alt, size = 'md', className = '' }) => {
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
      className={`${sizeClasses[size]} rounded-full bg-blue-500 flex items-center justify-center text-white font-medium ${className}`}
    >
      {initials}
    </div>
  );
};

export default Avatar;