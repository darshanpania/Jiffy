/**
 * Authentication Tests
 */

const request = require('supertest');
const app = require('../src/server');

describe('Authentication Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });
  });
  
  describe('POST /api/auth/verify', () => {
    it('should reject request without token', async () => {
      const res = await request(app)
        .post('/api/auth/verify')
        .send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
  
  describe('GET /api/auth/me', () => {
    it('should require authentication', async () => {
      const res = await request(app).get('/api/auth/me');
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });
  });
});
