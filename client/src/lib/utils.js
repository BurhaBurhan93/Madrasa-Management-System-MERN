// Utility functions for the Madrasa EMIS

// Date formatting utilities
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Number formatting utilities
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatGrade = (score) => {
  if (score >= 90) return { letter: 'A+', gpa: 4.0, color: 'text-green-600' };
  if (score >= 85) return { letter: 'A', gpa: 4.0, color: 'text-green-600' };
  if (score >= 80) return { letter: 'A-', gpa: 3.7, color: 'text-green-600' };
  if (score >= 75) return { letter: 'B+', gpa: 3.3, color: 'text-yellow-600' };
  if (score >= 70) return { letter: 'B', gpa: 3.0, color: 'text-yellow-600' };
  if (score >= 65) return { letter: 'B-', gpa: 2.7, color: 'text-yellow-600' };
  if (score >= 60) return { letter: 'C+', gpa: 2.3, color: 'text-orange-600' };
  if (score >= 55) return { letter: 'C', gpa: 2.0, color: 'text-orange-600' };
  if (score >= 50) return { letter: 'C-', gpa: 1.7, color: 'text-orange-600' };
  return { letter: 'F', gpa: 0.0, color: 'text-red-600' };
};

// Validation utilities
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone.replace(/[\s\-\(\)]/g, ''));
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return re.test(password);
};

// Data processing utilities
const calculatePercentage = (part, total) => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Export all utilities
export {
  formatDate,
  formatDateTime,
  formatNumber,
  formatGrade,
  validateEmail,
  validatePhone,
  validatePassword,
  calculatePercentage,
  debounce
};