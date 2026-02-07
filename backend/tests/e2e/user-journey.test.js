/**
 * E2E Tests - Complete User Journeys
 * Tests critical flows from signup to GIF sending
 */

const request = require('supertest');
const { createClient } = require('@supabase/supabase-js');
const app = require('../../src/server');

describe('E2E Tests - Complete User Journeys', () => {
  let supabaseClient;
  let user1, user2;
  let token1, token2;
  let chatId;
  
  beforeAll(async () => {
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  });
  
  afterAll(async () => {
    // Cleanup test users
    if (user1) await supabaseClient.auth.admin.deleteUser(user1.id);
    if (user2) await supabaseClient.auth.admin.deleteUser(user2.id);
  });
  
  describe('Journey 1: Signup → Profile → Search → Chat', () => {
    it('Step 1: User 1 signs up', async () => {
      const email = `user1-${Date.now()}@jiffy.test`;
      
      const { data: { user, session } } = await supabaseClient.auth.signUp({
        email,
        password: 'Password123!',
      });
      
      user1 = user;
      token1 = session.access_token;
      
      expect(user1).toBeDefined();
      expect(token1).toBeDefined();
    });
    
    it('Step 2: User 1 creates profile', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          displayName: 'Alice Johnson',
          bio: 'E2E Test User 1',
          photoUrl: 'https://via.placeholder.com/150',
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.profile.display_name).toBe('Alice Johnson');
    });
    
    it('Step 3: User 2 signs up', async () => {
      const email = `user2-${Date.now()}@jiffy.test`;
      
      const { data: { user, session } } = await supabaseClient.auth.signUp({
        email,
        password: 'Password123!',
      });
      
      user2 = user;
      token2 = session.access_token;
      
      expect(user2).toBeDefined();
      expect(token2).toBeDefined();
    });
    
    it('Step 4: User 2 creates profile', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          displayName: 'Bob Smith',
          bio: 'E2E Test User 2',
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.profile.display_name).toBe('Bob Smith');
    });
    
    it('Step 5: User 1 searches for User 2', async () => {
      const res = await request(app)
        .get('/api/users/search?q=Bob')
        .set('Authorization', `Bearer ${token1}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.users).toBeDefined();
      
      const found = res.body.users.find(u => u.id === user2.id);
      expect(found).toBeDefined();
      expect(found.display_name).toBe('Bob Smith');
    });
    
    it('Step 6: User 1 creates direct chat with User 2', async () => {
      const res = await request(app)
        .post('/api/chats/direct')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          participantId: user2.id,
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.chat).toHaveProperty('id');
      expect(res.body.chat.type).toBe('DIRECT');
      
      chatId = res.body.chat.id;
    });
    
    it('Step 7: User 1 sends message to User 2', async () => {
      const res = await request(app)
        .post(`/api/chats/${chatId}/messages`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          content: 'Hey Bob! This is an E2E test message.',
          type: 'TEXT',
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.message.content).toBe('Hey Bob! This is an E2E test message.');
    });
    
    it('Step 8: User 2 receives and reads messages', async () => {
      const res = await request(app)
        .get(`/api/chats/${chatId}/messages`)
        .set('Authorization', `Bearer ${token2}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.messages.length).toBeGreaterThan(0);
      
      const message = res.body.messages[0];
      expect(message.content).toBe('Hey Bob! This is an E2E test message.');
    });
    
    it('Step 9: User 2 marks messages as read', async () => {
      const res = await request(app)
        .post(`/api/chats/${chatId}/read`)
        .set('Authorization', `Bearer ${token2}`);
      
      expect(res.statusCode).toBe(200);
    });
  });
  
  describe('Journey 2: GIF Search → Send → Favorite', () => {
    it('Step 1: User 1 searches for GIFs', async () => {
      const res = await request(app)
        .get('/api/gifs/search?q=happy&limit=10')
        .set('Authorization', `Bearer ${token1}`);
      
      // Skip if GIF APIs not configured
      if (res.statusCode === 503) {
        console.log('⚠️  GIF APIs not configured - skipping GIF tests');
        return;
      }
      
      expect(res.statusCode).toBe(200);
      expect(res.body.gifs).toBeDefined();
      expect(res.body.gifs.length).toBeGreaterThan(0);
    });
    
    it('Step 2: User 1 sends GIF to User 2', async () => {
      const res = await request(app)
        .post(`/api/chats/${chatId}/messages`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          content: 'https://media.giphy.com/media/test/giphy.gif',
          type: 'GIF',
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.message.type).toBe('GIF');
    });
    
    it('Step 3: User 1 saves GIF to favorites', async () => {
      const res = await request(app)
        .post('/api/gifs/favorites')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          gifId: 'e2e-test-gif',
          gifUrl: 'https://media.giphy.com/media/test/giphy.gif',
          title: 'E2E Test GIF',
          source: 'giphy',
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.favorite).toHaveProperty('id');
    });
    
    it('Step 4: User 1 retrieves favorites', async () => {
      const res = await request(app)
        .get('/api/gifs/favorites')
        .set('Authorization', `Bearer ${token1}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.favorites).toBeDefined();
      expect(res.body.favorites.length).toBeGreaterThan(0);
    });
  });
  
  describe('Journey 3: Group Chat → Members → Messages', () => {
    let groupId;
    
    it('Step 1: User 1 creates group chat', async () => {
      const res = await request(app)
        .post('/api/chats/group')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          name: 'E2E Test Group',
          description: 'Testing group functionality',
          participantIds: [user2.id],
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.chat.name).toBe('E2E Test Group');
      
      groupId = res.body.chat.id;
    });
    
    it('Step 2: Get group members', async () => {
      const res = await request(app)
        .get(`/api/chats/${groupId}/members`)
        .set('Authorization', `Bearer ${token1}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.members.length).toBe(2); // User 1 + User 2
    });
    
    it('Step 3: User 1 sends group message', async () => {
      const res = await request(app)
        .post(`/api/chats/${groupId}/messages`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          content: 'Welcome to the E2E test group!',
          type: 'TEXT',
        });
      
      expect(res.statusCode).toBe(201);
    });
    
    it('Step 4: User 2 sees group message', async () => {
      const res = await request(app)
        .get(`/api/chats/${groupId}/messages`)
        .set('Authorization', `Bearer ${token2}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.messages.length).toBeGreaterThan(0);
    });
    
    it('Step 5: User 2 leaves group', async () => {
      const res = await request(app)
        .post(`/api/chats/${groupId}/leave`)
        .set('Authorization', `Bearer ${token2}`);
      
      expect(res.statusCode).toBe(200);
    });
  });
  
  describe('Journey 4: Error Handling & Validation', () => {
    it('Should reject invalid JWT', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(res.statusCode).toBe(401);
    });
    
    it('Should validate message content', async () => {
      const res = await request(app)
        .post(`/api/chats/${chatId}/messages`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          content: '', // Empty content
          type: 'TEXT',
        });
      
      expect(res.statusCode).toBe(400);
    });
    
    it('Should enforce rate limiting', async () => {
      // Make 11 rapid GIF search requests
      const requests = [];
      for (let i = 0; i < 11; i++) {
        requests.push(
          request(app)
            .get(`/api/gifs/search?q=test${i}`)
            .set('Authorization', `Bearer ${token1}`)
        );
      }
      
      const responses = await Promise.all(requests);
      
      // At least one should be rate limited (429)
      const rateLimited = responses.some(r => r.statusCode === 429);
      expect(rateLimited).toBe(true);
    }, 60000); // Longer timeout for rate limit test
  });
});
