const http = require('http');
require('dotenv').config();

const connectDB = require('./config/db');
const { app, corsOptions } = require('./app');
const { createSocket } = require('./config/socket');
const server = http.createServer(app);

const { io } = createSocket(server, corsOptions);

if (process.env.NODE_ENV !== 'test') {
  connectDB().catch((err) => {
    console.error('Database boot failure', err.message);
    process.exit(1);
  });
}

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = { app, server, io };
