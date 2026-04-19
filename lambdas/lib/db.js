const mongoose = require('mongoose');

let cached = global.__mongoose;

/**
 * Reuse connection across Lambda invocations (container reuse).
 */
async function connect() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set');
  }

  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached) {
    cached = global.__mongoose = { conn: null, promise: null };
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connect };
