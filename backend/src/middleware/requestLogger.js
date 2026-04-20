const { logger } = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('HTTP request', {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
      userId: req.user?.id || req.user?._id || null,
    });
  });
  next();
};

module.exports = { requestLogger };
