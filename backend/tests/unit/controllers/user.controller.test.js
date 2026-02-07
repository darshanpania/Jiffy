const request = require('supertest');
const app = require('../../../src/server');
const supabase = require('../../../src/config/supabase');

// Mock Supabase
jest.mock('../../../src/config/supabase');

describe('UserController', () => {
  const mockUser = {
    id: 'test-user-uuid',
    email: 'test@example.com',
    display_name: 'Test User',
    photo_url: 'https://example.com/photo.jpg',
    bio: 'Test bio',
    phone_number: '+1234567890',
    is_online: true,
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const validToken = 'Bearer test-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/profile/:userId', () => {
    it('should return user profile successfully', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUser,
          error: null,
        }),
      });

      const res = await request(app)
        .get('/api/users/profile/test-user-uuid')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockUser);
    });

    it('should return 404 for non-existent user', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      const res = await request(app)
        .get('/api/users/profile/non-existent-uuid')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Not Found');
    });

    it('should return 400 for invalid UUID format', async () => {
      const res = await request(app)
        .get('/api/users/profile/invalid-id')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Bad Request');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update profile successfully', async () => {
      const updatedUser = { ...mockUser, display_name: 'Updated Name' };
      
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: updatedUser,
          error: null,
        }),
      });

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', validToken)
        .send({ displayName: 'Updated Name' });

      expect(res.statusCode).toBe(200);
      expect(res.body.profile.display_name).toBe('Updated Name');
    });

    it('should reject display name too short', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', validToken)
        .send({ displayName: 'AB' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Bad Request');
    });

    it('should reject display name too long', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', validToken)
        .send({ displayName: 'A'.repeat(31) });

      expect(res.statusCode).toBe(400);
    });

    it('should reject bio too long', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', validToken)
        .send({ bio: 'x'.repeat(151) });

      expect(res.statusCode).toBe(400);
    });

    it('should reject invalid photo URL', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', validToken)
        .send({ photoUrl: 'not-a-url' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject invalid phone number', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', validToken)
        .send({ phoneNumber: 'invalid' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/users/search', () => {
    it('should search users successfully', async () => {
      const searchResults = [mockUser];
      
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: searchResults,
          error: null,
          count: 1,
        }),
      });

      const res = await request(app)
        .get('/api/users/search?q=test')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toBeDefined();
      expect(res.body.query).toBe('test');
    });

    it('should reject query too short', async () => {
      const res = await request(app)
        .get('/api/users/search?q=a')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(400);
    });

    it('should reject missing query', async () => {
      const res = await request(app)
        .get('/api/users/search')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(400);
    });

    it('should enforce limit maximum', async () => {
      const res = await request(app)
        .get('/api/users/search?q=test&limit=200')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/users/presence', () => {
    it('should update presence successfully', async () => {
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      const res = await request(app)
        .post('/api/users/presence')
        .set('Authorization', validToken)
        .send({ isOnline: true });

      expect(res.statusCode).toBe(200);
      expect(res.body.isOnline).toBe(true);
    });

    it('should reject invalid isOnline type', async () => {
      const res = await request(app)
        .post('/api/users/presence')
        .set('Authorization', validToken)
        .send({ isOnline: 'yes' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/users/friends', () => {
    it('should return friends list successfully', async () => {
      const friendships = [
        {
          id: 'friendship-uuid',
          created_at: new Date().toISOString(),
          friend: mockUser,
        },
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: friendships,
          error: null,
          count: 1,
        }),
      });

      const res = await request(app)
        .get('/api/users/friends')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.friends).toBeDefined();
      expect(Array.isArray(res.body.friends)).toBe(true);
    });
  });

  describe('POST /api/users/fcm-token', () => {
    it('should update FCM token successfully', async () => {
      supabase.from.mockReturnValue({
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            fcm_token: 'test-token',
            device_type: 'android',
            updated_at: new Date().toISOString(),
          },
          error: null,
        }),
      });

      const res = await request(app)
        .post('/api/users/fcm-token')
        .set('Authorization', validToken)
        .send({
          fcmToken: 'test-fcm-token-string',
          deviceType: 'android',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.deviceType).toBe('android');
    });

    it('should reject missing FCM token', async () => {
      const res = await request(app)
        .post('/api/users/fcm-token')
        .set('Authorization', validToken)
        .send({ deviceType: 'android' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject invalid device type', async () => {
      const res = await request(app)
        .post('/api/users/fcm-token')
        .set('Authorization', validToken)
        .send({
          fcmToken: 'test-token',
          deviceType: 'invalid',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/users/me', () => {
    it('should return current user profile', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUser,
          error: null,
        }),
      });

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email');
    });
  });
});
