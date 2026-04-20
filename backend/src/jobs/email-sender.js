const { Queue } = require('bullmq');

const emailQueue = new Queue('email-sender', {
  connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
});

module.exports = { emailQueue };
