// Common validation functions

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(phone);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateRequired = (fields, data) => {
  const errors = {};
  fields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors[field] = `${field} is required`;
    }
  });
  return errors;
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired
};
