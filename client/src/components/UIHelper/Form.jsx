import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

const Form = ({ children, onSubmit, className = '' }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {children}
    </form>
  );
};

const FormGroup = ({ children, className = '' }) => (
  <div className={`space-y-2 ${className}`}>{children}</div>
);

const FormLabel = ({ children, htmlFor, required = false, className = '' }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-slate-700 ${className}`}
  >
    {children}
    {required && <span className="ml-1 text-red-500">*</span>}
  </label>
);

const FormError = ({ children, className = '' }) => (
  <div className={`flex items-center text-sm text-red-600 ${className}`}>
    <FiAlertCircle className="mr-1" size={14} />
    {children}
  </div>
);

const FormHelp = ({ children, className = '' }) => (
  <p className={`text-sm text-slate-500 ${className}`}>{children}</p>
);

const FormSection = ({ title, description, children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    <div>
      <h3 className="text-lg font-medium text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormActions = ({ children, className = '' }) => (
  <div className={`flex items-center justify-end gap-3 pt-6 border-t border-slate-200 ${className}`}>
    {children}
  </div>
);

Form.Group = FormGroup;
Form.Label = FormLabel;
Form.Error = FormError;
Form.Help = FormHelp;
Form.Section = FormSection;
Form.Actions = FormActions;

export default Form;