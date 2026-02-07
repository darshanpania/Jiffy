/**
 * Jest Global Setup
 * Runs once before all test suites
 */

require('dotenv').config({ path: '.env.test' });

module.exports = async () => {
  console.log('\n🧪 Starting JIFFY Backend Test Suite...\n');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // Reduce log noise in tests
  
  // Validate test environment
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.warn('⚠️  Warning: Supabase not configured for tests');
    console.warn('   Integration tests will be skipped');
  }
  
  console.log('✅ Global setup complete\n');
};
