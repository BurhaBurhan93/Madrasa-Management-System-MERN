import React from 'react';

const Select = ({ 
  label, 
  id, 
  options, 
  value, 
  onChange, 
  error, 
  required = false, 
  className = '',
  placeholder,
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors ${
          error 
            ? 'border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;