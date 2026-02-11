import { useState, useEffect } from 'react';

// Custom hook for managing form state
const useForm = (initialValues, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field];
      const value = values[field];

      if (rule.required && !value) {
        newErrors[field] = rule.requiredMessage || `${field} is required`;
      }

      if (rule.pattern && value && !rule.pattern.test(value)) {
        newErrors[field] = rule.patternMessage || `${field} format is invalid`;
      }

      if (rule.minLength && value && value.length < rule.minLength) {
        newErrors[field] = `Minimum length is ${rule.minLength}`;
      }

      if (rule.maxLength && value && value.length > rule.maxLength) {
        newErrors[field] = `Maximum length is ${rule.maxLength}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (onSubmit) => {
    setIsSubmitting(true);
    if (validate()) {
      await onSubmit(values);
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
  };
};

export default useForm;