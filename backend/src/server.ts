import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { analyticsMiddleware } from './middleware/analytics.middleware';
import logger from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import chatRoutes from './routes/chat.routes';
import gifRoutes from './routes/gif.routes';
import notificationRoutes from './routes/notification.routes';
import friendRoutes from './routes/friend.routes';
import healthRoutes from './routes/health.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

// ============================================
// Security & Performance Middleware
// ============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());

// ============================================
// Logging
// ============================================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }));
}

// ============================================
// Body Parsers
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// Analytics Middleware
// ============================================
app.use(analyticsMiddleware);

// ============================================
// Rate Limiting
// ============================================
app.use(`/api/${API_VERSION}`, rateLimiter);

// ============================================
// Routes
// ============================================
app.use('/health', healthRoutes);
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/chats`, chatRoutes);
app.use(`/api/${API_VERSION}/gifs`, gifRoutes);
app.use(`/api/${API_VERSION}/notifications`, notificationRoutes);
app.use(`/api/${API_VERSION}/friends`, friendRoutes);

// ============================================
// Error Handling
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// Start Server
// ============================================
const server = app.listen(PORT, () => {
  logger.info(`🚀 JIFFY Backend Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 API Base URL: /api/${API_VERSION}`);
  logger.info(`🗄️  Supabase: ${process.env.SUPABASE_URL}`);
  logger.info(`🔔 FCM: ${process.env.FCM_PROJECT_ID ? 'Configured' : 'Not configured'}`);
  logger.info(`🎨 GIPHY: ${process.env.GIPHY_API_KEY ? 'Configured' : 'Not configured'}`);
  logger.info(`🎭 Tenor: ${process.env.TENOR_API_KEY ? 'Configured' : 'Not configured'}`);
  logger.info(`📈 PostHog: ${process.env.POSTHOG_API_KEY ? 'Configured' : 'Not configured'}`);
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

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
