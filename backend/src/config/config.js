/**
 * Application Configuration
 * Centralized configuration management
 */

require('dotenv').config();

module.exports = {
  // Server configuration
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  
  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    anonKey: process.env.SUPABASE_ANON_KEY,
  },
  
  // Firebase Cloud Messaging (FCM)
  fcm: {
    projectId: process.env.FCM_PROJECT_ID,
    privateKeyId: process.env.FCM_PRIVATE_KEY_ID,
    privateKey: process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FCM_CLIENT_EMAIL,
    clientId: process.env.FCM_CLIENT_ID,
  },
  
  // GIPHY API
  giphy: {
    apiKey: process.env.GIPHY_API_KEY,
    baseUrl: 'https://api.giphy.com/v1',
    ratingLimit: 'pg-13',
    defaultLimit: 25,
  },
  
  // Tenor API
  tenor: {
    apiKey: process.env.TENOR_API_KEY,
    baseUrl: 'https://tenor.googleapis.com/v2',
    defaultLimit: 20,
  },
  
  // PostHog (optional backend tracking)
  posthog: {
    apiKey: process.env.POSTHOG_API_KEY,
    host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  
  // Cache
  cache: {
    ttl: 600, // 10 minutes in seconds
    checkPeriod: 120, // Check for expired keys every 2 minutes
  },
};
