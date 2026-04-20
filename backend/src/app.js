const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { errorHandler } = require('./middleware/error');
const { apiLimiter } = require('./middleware/rateLimiter');
const { requestLogger } = require('./middleware/requestLogger');

const frontendOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((v) => v.trim()).filter(Boolean);
const allowedOrigins = new Set([...frontendOrigins, 'http://localhost:5174']);
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) callback(null, true);
    else callback(new Error(`CORS policy does not allow access from origin ${origin}`));
  },
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(requestLogger);
app.use('/api/', apiLimiter);

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/chat', chatRoutes);
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

module.exports = { app, corsOptions };
