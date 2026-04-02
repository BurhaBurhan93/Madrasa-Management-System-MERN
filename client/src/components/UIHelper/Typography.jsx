import React from 'react';
import { theme } from '../theme';

/**
 * Typography Components
 * Consistent text styling across the application
 */

// Heading component
export const Heading = ({ 
  children, 
  level = 1, 
  className = '',
  color = 'gray-900',
  weight = 'bold'
}) => {
  const Tag = `h${level}`;
  
  const sizes = {
    1: 'text-4xl md:text-5xl',
    2: 'text-3xl md:text-4xl',
    3: 'text-2xl md:text-3xl',
    4: 'text-xl md:text-2xl',
    5: 'text-lg md:text-xl',
    6: 'text-base md:text-lg',
  };

  const weights = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  };

  return (
    <Tag className={`${sizes[level]} ${weights[weight]} text-${color} leading-tight ${className}`}>
      {children}
    </Tag>
  );
};

// Text component
export const Text = ({ 
  children, 
  size = 'base', 
  color = 'gray-600',
  weight = 'normal',
  className = '',
  as: Component = 'p'
}) => {
  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const weights = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  return (
    <Component className={`${sizes[size]} ${weights[weight]} text-${color} ${className}`}>
      {children}
    </Component>
  );
};

// Label component
export const Label = ({ 
  children, 
  className = '',
  required = false,
  htmlFor
}) => {
  return (
    <label 
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

// Badge component
export const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-sky-100 text-sky-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

// Divider component
export const Divider = ({ 
  className = '',
  orientation = 'horizontal'
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={`w-px h-full bg-gray-200 mx-4 ${className}`} />
    );
  }

  return (
    <div className={`w-full h-px bg-gray-200 my-4 ${className}`} />
  );
};

// Spacer component
export const Spacer = ({ size = 4 }) => {
  const sizes = {
    1: 'h-1',
    2: 'h-2',
    3: 'h-3',
    4: 'h-4',
    5: 'h-5',
    6: 'h-6',
    8: 'h-8',
    10: 'h-10',
    12: 'h-12',
    16: 'h-16',
  };

  return <div className={sizes[size] || sizes[4]} />;
};

export default {
  Heading,
  Text,
  Label,
  Badge,
  Divider,
  Spacer,
};
