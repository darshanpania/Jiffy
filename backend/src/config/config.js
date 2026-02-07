require('dotenv').config();

/**
 * Application Configuration
 * Centralized configuration from environment variables
 */

const config = {
  // Server configuration
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    anonKey: process.env.SUPABASE_ANON_KEY,
  },
  
  // Firebase configuration (FCM)
  fcm: {
    projectId: process.env.FCM_PROJECT_ID,
    clientEmail: process.env.FCM_CLIENT_EMAIL,
    privateKey: process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    databaseURL: process.env.FCM_DATABASE_URL,
  },
  
  // GIPHY configuration
  giphy: {
    apiKey: process.env.GIPHY_API_KEY || '',
  },
  
  // Tenor configuration
  tenor: {
    apiKey: process.env.TENOR_API_KEY || '',
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
};

// Validate required configuration
const requiredConfig = {
  'SUPABASE_URL': config.supabase.url,
  'SUPABASE_SERVICE_KEY': config.supabase.serviceKey,
};

const missingConfig = Object.entries(requiredConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  console.error('Missing required configuration:', missingConfig.join(', '));
  console.error('Please check your .env file');
  process.exit(1);
}

// Warn about optional configuration
if (!config.giphy.apiKey && !config.tenor.apiKey) {
  console.warn('⚠️  Warning: Neither GIPHY nor Tenor API key configured');
  console.warn('   GIF functionality will be disabled');
}

if (!config.fcm.projectId) {
  console.warn('⚠️  Warning: FCM not configured');
  console.warn('   Push notifications will be disabled');
}

module.exports = config;
