/**
 * Supabase Client Configuration
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('./config');
const logger = require('./logger');

if (!config.supabase.url || !config.supabase.serviceKey) {
  logger.error('Supabase configuration missing!');
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
}

// Create Supabase client with service key (for backend operations)
const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

logger.info('Supabase client initialized successfully');

module.exports = supabase;
