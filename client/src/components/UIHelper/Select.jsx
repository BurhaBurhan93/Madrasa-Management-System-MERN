import React from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const Select = ({ 
  label, 
  id, 
  options, 
  value, 
  onChange, 
  error, 
  helperText,
  required = false, 
  className = '',
  placeholder,
  ...props 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full rounded-2xl border px-3 py-2 outline-none transition-all ${
          isDark
            ? 'border-slate-700 bg-slate-900/70 text-slate-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
            : 'border-slate-300 bg-white text-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
        } ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {!error && helperText && <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{helperText}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
