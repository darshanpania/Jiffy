/**
 * Integration Tests - API Endpoints
 * Tests with real Supabase connections
 */

const request = require('supertest');
const { createClient } = require('@supabase/supabase-js');
const app = require('../../src/server');

describe('Integration Tests - API Endpoints', () => {
  let supabaseClient;
  let testUser;
  let authToken;
  
  beforeAll(async () => {
    // Initialize Supabase client for test cleanup
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    // Create test user
    const { data: { user }, error } = await supabaseClient.auth.admin.createUser({
      email: `test-${Date.now()}@jiffy.test`,
      password: 'TestPassword123!',
      email_confirm: true,
    });
    
    if (error) {
      console.error('Failed to create test user:', error);
      throw error;
    }
    
    testUser = user;
    
    // Get auth token
    const { data: { session } } = await supabaseClient.auth.signInWithPassword({
      email: testUser.email,
      password: 'TestPassword123!',
    });
    
    authToken = session.access_token;
  });
  
  afterAll(async () => {
    // Cleanup test user
    if (testUser) {
      await supabaseClient.auth.admin.deleteUser(testUser.id);
    }
  });
  
  describe('Health & Status', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
    });
  });
  
  describe('Authentication Flow', () => {
    it('should verify JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/verify')
        .send({ token: authToken });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('valid', true);
      expect(res.body.user).toHaveProperty('id', testUser.id);
    });
    
    it('should get current user', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.user).toHaveProperty('id', testUser.id);
    });
    
    it('should register FCM token', async () => {
      const res = await request(app)
        .post('/api/auth/register-fcm')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fcmToken: 'test-fcm-token-' + Date.now(),
          deviceType: 'android',
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('registered');
    });
  });
  
  describe('User Management', () => {
    it('should update user profile', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          displayName: 'Integration Test User',
          bio: 'Testing JIFFY backend',
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.profile).toHaveProperty('display_name', 'Integration Test User');
    });
    
    it('should get user profile', async () => {
      const res = await request(app)
        .get(`/api/users/profile/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.profile).toHaveProperty('id', testUser.id);
    });
    
    it('should search users', async () => {
      const res = await request(app)
        .get('/api/users/search?q=Integration')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(Array.isArray(res.body.users)).toBe(true);
    });
  });
  
  describe('Chat Creation & Messaging', () => {
    let directChatId;
    let groupChatId;
    let messageId;
    
    it('should create direct chat', async () => {
      const res = await request(app)
        .post('/api/chats/direct')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          participantId: testUser.id, // Self-chat for testing
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.chat).toHaveProperty('id');
      expect(res.body.chat.type).toBe('DIRECT');
      
      directChatId = res.body.chat.id;
    });
    
    it('should create group chat', async () => {
      const res = await request(app)
        .post('/api/chats/group')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Integration Test Group',
          participantIds: [testUser.id],
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.chat).toHaveProperty('id');
      expect(res.body.chat.type).toBe('GROUP');
      expect(res.body.chat.name).toBe('Integration Test Group');
      
      groupChatId = res.body.chat.id;
    });
    
    it('should send message in chat', async () => {
      const res = await request(app)
        .post(`/api/chats/${directChatId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Integration test message',
          type: 'TEXT',
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toHaveProperty('id');
      expect(res.body.message.content).toBe('Integration test message');
      
      messageId = res.body.message.id;
    });
    
    it('should get chat messages', async () => {
      const res = await request(app)
        .get(`/api/chats/${directChatId}/messages`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.messages).toBeDefined();
      expect(res.body.messages.length).toBeGreaterThan(0);
    });
    
    it('should edit message', async () => {
      const res = await request(app)
        .put(`/api/chats/${directChatId}/messages/${messageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Edited integration test message',
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message.content).toBe('Edited integration test message');
      expect(res.body.message.edited).toBe(true);
    });
    
    it('should delete message', async () => {
      const res = await request(app)
        .delete(`/api/chats/${directChatId}/messages/${messageId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
    });
  });
  
  describe('GIF Integration', () => {
    it('should search GIFs', async () => {
      const res = await request(app)
        .get('/api/gifs/search?q=happy')
        .set('Authorization', `Bearer ${authToken}`);
      
      // May return 200 with results or 503 if APIs not configured
      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty('gifs');
        expect(res.body).toHaveProperty('source');
      } else {
        expect(res.statusCode).toBe(503);
      }
    });
    
    it('should get trending GIFs', async () => {
      const res = await request(app)
        .get('/api/gifs/trending')
        .set('Authorization', `Bearer ${authToken}`);
      
      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty('gifs');
      } else {
        expect(res.statusCode).toBe(503);
      }
    });
    
    it('should save and delete favorite', async () => {
      const saveRes = await request(app)
        .post('/api/gifs/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          gifId: 'integration-test-gif',
          gifUrl: 'https://media.giphy.com/test.gif',
          title: 'Test GIF',
          source: 'giphy',
        });
      
      expect(saveRes.statusCode).toBe(201);
      
      const favoriteId = saveRes.body.favorite.id;
      
      const deleteRes = await request(app)
        .delete(`/api/gifs/favorites/${favoriteId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(deleteRes.statusCode).toBe(200);
    });
  });
});
