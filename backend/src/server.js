const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);

const frontendOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...frontendOrigins, 'http://localhost:5174']);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy does not allow access from origin ${origin}`));
    }
  },
  credentials: true,
};

// Socket.io configuration
const io = socketIo(server, {
  cors: corsOptions,
});

// Connect to MongoDB (skip in Jest to avoid open handles / timeouts)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Middleware
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/chat', chatRoutes);

// Socket.io event handling for real-time chat
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // Join user to a room based on conversation ID
  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  // Listen for new messages
  socket.on('new-message', (data) => {
    const { conversationId, message } = data;
    // Emit to all users in the conversation room
    io.to(conversationId).emit('message', message);
  });

  // User typing
  socket.on('user-typing', (conversationId) => {
    socket.broadcast.to(conversationId).emit('typing', {
      userId: socket.id,
    });
  });

  // User stopped typing
  socket.on('user-stop-typing', (conversationId) => {
    socket.broadcast.to(conversationId).emit('stop-typing', {
      userId: socket.id,
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = { app, server, io };
