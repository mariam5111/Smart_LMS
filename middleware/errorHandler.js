const AppError = require('../utils/appError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new AppError(message, 400);
  }

  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'Field';
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    error = new AppError(message, 409);
  }

  if (err.isJoi) {
    const message = err.details.map((detail) => detail.message).join('. ');
    error = new AppError(message, 400);
  } else if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data: ${messages.join('. ')}`;
    error = new AppError(message, 400);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;