const { Queue } = require('bullmq');

const orderQueue = new Queue('order-processor', {
  connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
});

module.exports = { orderQueue };
