const { Queue } = require('bullmq');

const imageResizeQueue = new Queue('image-resizer', {
  connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
});

module.exports = { imageResizeQueue };
