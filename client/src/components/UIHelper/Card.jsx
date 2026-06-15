import React from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { localizeAdminText } from '../../lib/adminLocalization';

const Card = ({ children, className = '', title, subtitle }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const adminLang = localStorage.getItem('adminLang') || 'en';

  const surfaceClasses = isDark
    ? 'border-slate-700 bg-slate-900/60 text-slate-100 shadow-[0_20px_45px_-22px_rgba(0,0,0,0.55)] backdrop-blur-xl'
    : 'border-white/60 bg-white/40 text-slate-900 shadow-[0_12px_35px_-24px_rgba(15,23,42,0.12)] backdrop-blur-xl';

  return (
    <div className={`overflow-hidden rounded-2xl border ${surfaceClasses} ${className}`}>
      {(title || subtitle) && (
        <div className={`border-b p-6 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          {title && <h3 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{localizeAdminText(title, adminLang)}</h3>}
          {subtitle && <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{localizeAdminText(subtitle, adminLang)}</p>}
        </div>
      )}
      <div className={title || subtitle ? 'p-6' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return <div className={`border-b p-6 ${isDark ? 'border-slate-700' : 'border-slate-200'} ${className}`}>{children}</div>;
};

const CardContent = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

const CardFooter = ({ children, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return <div className={`border-t p-6 ${isDark ? 'border-slate-700' : 'border-slate-200'} ${className}`}>{children}</div>;
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
