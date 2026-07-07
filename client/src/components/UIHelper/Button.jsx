import React from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { localizeAdminText } from '../../lib/adminLocalization';
import { readStoredLanguage } from '../../lib/languageStorage';

/**
 * Button Component
 * Unified button styling for both Staff and Student panels
 * Uses consistent blue gradient theme across the application
 */

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false, 
  loading = false,
  className = '',
  type = 'button',
  icon: Icon,
  color,
  iconPosition = 'left',
  fullWidth = false,
  ...props 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const adminLang = readStoredLanguage('adminLang', 'en');

  // Base button classes
  const baseClasses = `
    inline-flex items-center justify-center 
    font-medium transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:pointer-events-none
    rounded-lg
    ${fullWidth ? 'w-full' : ''}
  `;

  // Variant styles - Unified for both Staff and Student panels
  const variants = {
    // Primary: Blue gradient (main action buttons)
    primary: `
      bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700
      text-white
      shadow-md shadow-cyan-500/25
      hover:shadow-lg hover:shadow-cyan-500/35
      hover:translate-y-[-1px]
      active:translate-y-0
      focus:ring-cyan-500
    `,
    
    // Secondary: Light gray (secondary actions)
    secondary: isDark
      ? `
        bg-slate-800
        text-slate-100
        border border-slate-700
        hover:bg-slate-700
        hover:border-slate-600
        focus:ring-slate-500
      `
      : `
        bg-slate-100
        text-slate-700
        border border-slate-200
        hover:bg-slate-200
        hover:border-slate-300
        focus:ring-slate-400
      `,
    
    // Outline: Bordered style
    outline: isDark
      ? `
        bg-transparent
        text-cyan-200
        border-2 border-cyan-500
        hover:bg-cyan-950/40
        focus:ring-cyan-500
      `
      : `
        bg-transparent
        text-cyan-700
        border-2 border-cyan-600
        hover:bg-cyan-50
        focus:ring-cyan-500
      `,
    
    // Ghost: Minimal style
    ghost: isDark
      ? `
        bg-transparent
        text-slate-300
        hover:bg-slate-800
        hover:text-white
        focus:ring-slate-500
      `
      : `
        bg-transparent
        text-slate-600
        hover:bg-slate-100
        hover:text-slate-900
        focus:ring-slate-400
      `,
    
    // Danger: Red for destructive actions
    danger: `
      bg-red-600
      text-white
      shadow-md shadow-red-500/30
      hover:bg-red-700
      hover:shadow-lg hover:shadow-red-500/40
      focus:ring-red-500
    `,
    
    // Success: Green for positive actions
    success: `
      bg-green-600
      text-white
      shadow-md shadow-green-500/30
      hover:bg-green-700
      hover:shadow-lg hover:shadow-green-500/40
      focus:ring-green-500
    `,
    
    // Warning: Amber for caution actions
    warning: `
      bg-amber-500
      text-white
      shadow-md shadow-amber-500/30
      hover:bg-amber-600
      hover:shadow-lg hover:shadow-amber-500/40
      focus:ring-amber-500
    `,
    
    // White: For dark backgrounds
    white: isDark
      ? `
        bg-slate-100
        text-slate-900
        shadow-md
        hover:bg-white
        focus:ring-slate-500
      `
      : `
        bg-white
        text-slate-800
        shadow-md
        hover:bg-slate-50
        focus:ring-slate-400
      `,
  };

  const colorVariants = {
    red: variants.danger,
    green: variants.success,
    yellow: variants.warning,
    blue: variants.primary,
  };

  // Size configurations
  const sizes = {
    xs: 'h-7 px-3 text-xs',
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-11 px-6 py-2.5 text-base',
    xl: 'h-12 px-8 py-3 text-base',
  };

  // Icon size mapping
  const iconSizes = {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22,
  };

  // Build final class string
  const classes = `
    ${baseClasses}
    ${colorVariants[color] || variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button 
      type={type}
      className={classes} 
      onClick={onClick} 
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {!loading && Icon && iconPosition === 'left' && (
        React.isValidElement(Icon)
          ? React.cloneElement(Icon, {
              size: Icon.props.size || iconSizes[size] || 18,
              className: `mr-2 ${Icon.props.className || ''}`.trim(),
            })
          : <Icon size={iconSizes[size] || 18} className="mr-2" />
      )}
      
      {typeof children === 'string' ? localizeAdminText(children, adminLang) : children}
      
      {!loading && Icon && iconPosition === 'right' && (
        React.isValidElement(Icon)
          ? React.cloneElement(Icon, {
              size: Icon.props.size || iconSizes[size] || 18,
              className: `ml-2 ${Icon.props.className || ''}`.trim(),
            })
          : <Icon size={iconSizes[size] || 18} className="ml-2" />
      )}
    </button>
  );
};

// Icon Button variant
export const IconButton = ({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const sizes = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
    xl: 'p-3',
  };

  const iconSizes = {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      className={`${sizes[size] || sizes.md} rounded-full ${className}`}
      {...props}
    >
      <Icon size={iconSizes[size] || 20} />
    </Button>
  );
};

// Button Group component
export const ButtonGroup = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex rounded-lg shadow-sm ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;
        
        return (
          <div
            className={`
              ${isFirst ? 'rounded-l-lg' : ''}
              ${isLast ? 'rounded-r-lg' : ''}
              ${!isFirst ? '-ml-px' : ''}
            `}
          >
            {React.cloneElement(child, {
              className: `
                ${child.props.className || ''}
                ${!isFirst ? 'rounded-l-none' : ''}
                ${!isLast ? 'rounded-r-none' : ''}
              `,
            })}
          </div>
        );
      })}
    </div>
  );
};

export default Button;
