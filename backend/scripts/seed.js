/**
 * Database seeding script
 * Populate database with test data for development
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with test data...');

    // Create test users
    console.log('Creating test users...');
    const testUsers = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'alice@test.com',
        display_name: 'Alice Johnson',
        bio: 'Love GIFs! 🎬',
        is_online: true,
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'bob@test.com',
        display_name: 'Bob Smith',
        bio: 'GIF enthusiast',
        is_online: false,
      },
    ];

    for (const user of testUsers) {
      const { error } = await supabase
        .from('profiles')
        .upsert(user);
      
      if (error && error.code !== '23505') { // Ignore duplicates
        console.error('Error creating user:', error);
      }
    }

    console.log('✅ Seeding complete!');
    console.log('📊 Test users created:');
    console.log('  - alice@test.com (Alice Johnson)');
    console.log('  - bob@test.com (Bob Smith)');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();