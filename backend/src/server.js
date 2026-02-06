/**
 * JIFFY Backend Server
 * Node.js/Express API for Railway deployment
 * Integrates with Supabase, FCM, GIPHY, and Tenor
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const config = require('./config/config');
const logger = require('./config/logger');
const supabase = require('./config/supabase');
const fcm = require('./config/firebase');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const chatRoutes = require('./routes/chat.routes');
const gifRoutes = require('./routes/gif.routes');
const notificationRoutes = require('./routes/notification.routes');

// Import middleware
const errorHandler = require('./middleware/error.middleware');
const authMiddleware = require('./middleware/auth.middleware');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.env !== 'test') {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ============================================
// ROUTES
// ============================================

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/chats', authMiddleware, chatRoutes);
app.use('/api/gifs', authMiddleware, gifRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'JIFFY Backend API',
    version: '1.0.0',
    description: 'GIF Messenger Backend - Powered by Supabase',
    documentation: '/api/docs',
    health: '/health'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.url} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

const PORT = config.port || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 JIFFY Backend started successfully`);
  logger.info(`📡 Environment: ${config.env}`);
  logger.info(`🌐 Port: ${PORT}`);
  logger.info(`🔐 Supabase: ${config.supabase.url ? 'Connected' : 'Not configured'}`);
  logger.info(`🔔 FCM: ${config.fcm.projectId ? 'Configured' : 'Not configured'}`);
  logger.info(`🎨 GIPHY API: ${config.giphy.apiKey ? 'Configured' : 'Not configured'}`);
  logger.info(`🎭 Tenor API: ${config.tenor.apiKey ? 'Configured' : 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
