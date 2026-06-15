import React from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { localizeAdminText } from '../../lib/adminLocalization';

const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  helperText,
  icon,
  value,
  onChange,
  error,
  required = false,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const adminLang = localStorage.getItem('adminLang') || 'en';

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
          {localizeAdminText(label, adminLang)} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          placeholder={localizeAdminText(placeholder, adminLang)}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full ${icon ? 'pl-10' : 'px-3'} pr-3 py-2 border rounded-2xl shadow-sm outline-none transition-all ${
            isDark
              ? 'border-slate-700 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
              : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
          } ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
          {...props}
        />
      </div>
      {!error && helperText && <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{localizeAdminText(helperText, adminLang)}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
