const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

mongoose.set('strictQuery', true);
if (process.env.NODE_ENV === 'production') mongoose.set('autoIndex', false);

const connectDB = async (attempt = 1) => {
  const maxAttempts = 5;
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cloudmart';

  try {
    await mongoose.connect(mongoUri);
    logger.info('MongoDB connected');
    return mongoose.connection;
  } catch (error) {
    logger.error(`MongoDB connection failed (attempt ${attempt}/${maxAttempts})`, { error: error.message });
    if (attempt >= maxAttempts) throw error;
    const delay = Math.min(1000 * (2 ** (attempt - 1)), 10000);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return connectDB(attempt + 1);
  }
};

mongoose.connection.on('connected', () => logger.info('MongoDB event: connected'));
mongoose.connection.on('error', (err) => logger.error('MongoDB event: error', { error: err.message }));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB event: disconnected'));

module.exports = connectDB;
