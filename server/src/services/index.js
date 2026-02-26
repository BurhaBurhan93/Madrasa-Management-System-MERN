// Common service functions

const handleError = (res, error, statusCode = 500) => {
  console.error('Error:', error);
  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error'
  });
};

const handleSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const getPaginationData = (total, page, limit) => {
  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit)
  };
};

module.exports = {
  handleError,
  handleSuccess,
  getPaginationData
};
