import React from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const Badge = ({ children, variant = 'default', color, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const variantClasses = {
    default: isDark ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-800',
    primary: isDark ? 'bg-cyan-500/20 text-cyan-200' : 'bg-cyan-100 text-cyan-800',
    success: isDark ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-100 text-emerald-800',
    warning: isDark ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-100 text-amber-800',
    danger: isDark ? 'bg-rose-500/20 text-rose-200' : 'bg-rose-100 text-rose-800',
    info: isDark ? 'bg-sky-500/20 text-sky-200' : 'bg-sky-100 text-sky-800',
    secondary: isDark ? 'bg-violet-500/20 text-violet-200' : 'bg-violet-100 text-violet-800'
  };

  const colorClasses = {
    gray: variantClasses.default,
    blue: variantClasses.primary,
    green: variantClasses.success,
    yellow: variantClasses.warning,
    red: variantClasses.danger,
    purple: variantClasses.secondary,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color] || variantClasses[variant] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
