import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from '../utils/logger';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Supabase client with service role key
 * Used for backend operations that bypass RLS
 */
export const supabaseAdmin: SupabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Supabase client with anon key
 * Used for operations that should respect RLS
 */
export const supabaseClient: SupabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

/**
 * Get Supabase client for specific user (respects RLS)
 */
export const getSupabaseClientForUser = (accessToken: string): SupabaseClient => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
};

logger.info('✅ Supabase clients initialized');