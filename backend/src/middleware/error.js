const { logger } = require('../utils/logger');

class ApiError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  logger.error(err.message, { statusCode, stack: err.stack, path: req.path });
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    details: err.details,
  });
};

module.exports = { ApiError, errorHandler };
