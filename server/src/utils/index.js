// Utility functions

const generateCode = (prefix, count) => {
  return `${prefix}${String(count + 1).padStart(6, '0')}`;
};

const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

module.exports = {
  generateCode,
  formatDate,
  calculateAge,
  paginate
};
