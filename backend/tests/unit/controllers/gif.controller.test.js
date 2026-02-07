const request = require('supertest');
const app = require('../../../src/server');
const giphyService = require('../../../src/services/giphy.service');
const tenorService = require('../../../src/services/tenor.service');
const supabase = require('../../../src/config/supabase');

// Mock services
jest.mock('../../../src/services/giphy.service');
jest.mock('../../../src/services/tenor.service');
jest.mock('../../../src/config/supabase');

describe('GifController', () => {
  const validToken = 'Bearer test-jwt-token';
  
  const mockGif = {
    id: 'test-gif-id',
    title: 'Test GIF',
    url: 'https://giphy.com/gifs/test',
    source: 'giphy',
    images: {
      original: { url: 'https://...', width: 480, height: 270 },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/gifs/search', () => {
    it('should search GIFs successfully with GIPHY', async () => {
      giphyService.isConfigured.mockReturnValue(true);
      giphyService.search.mockResolvedValue({
        data: [mockGif],
        source: 'giphy',
        cached: false,
      });

      const res = await request(app)
        .get('/api/gifs/search?q=happy')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.gifs).toHaveLength(1);
      expect(res.body.source).toBe('giphy');
      expect(res.body.query).toBe('happy');
    });

    it('should fallback to Tenor when GIPHY fails', async () => {
      giphyService.isConfigured.mockReturnValue(true);
      giphyService.search.mockRejectedValue(new Error('GIPHY error'));
      
      tenorService.isConfigured.mockReturnValue(true);
      tenorService.search.mockResolvedValue({
        data: [{ ...mockGif, source: 'tenor' }],
        source: 'tenor',
        cached: false,
      });

      const res = await request(app)
        .get('/api/gifs/search?q=happy')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.source).toBe('tenor');
      expect(res.body.fallback).toBe(true);
    });

    it('should reject query too short', async () => {
      const res = await request(app)
        .get('/api/gifs/search?q=a')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Bad Request');
    });

    it('should reject missing query', async () => {
      const res = await request(app)
        .get('/api/gifs/search')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(400);
    });

    it('should validate limit range', async () => {
      const res = await request(app)
        .get('/api/gifs/search?q=happy&limit=100')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(400);
    });

    it('should validate rating values', async () => {
      const res = await request(app)
        .get('/api/gifs/search?q=happy&rating=invalid')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(400);
    });

    it('should return 503 when both providers fail', async () => {
      giphyService.isConfigured.mockReturnValue(true);
      giphyService.search.mockRejectedValue(new Error('GIPHY error'));
      
      tenorService.isConfigured.mockReturnValue(true);
      tenorService.search.mockRejectedValue(new Error('Tenor error'));

      const res = await request(app)
        .get('/api/gifs/search?q=happy')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(503);
      expect(res.body.error).toBe('Service Unavailable');
    });
  });

  describe('GET /api/gifs/trending', () => {
    it('should get trending GIFs', async () => {
      giphyService.isConfigured.mockReturnValue(true);
      giphyService.trending.mockResolvedValue({
        data: [mockGif],
        source: 'giphy',
        cached: true,
      });

      const res = await request(app)
        .get('/api/gifs/trending')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.gifs).toHaveLength(1);
      expect(res.body.cached).toBe(true);
    });

    it('should fallback to Tenor for trending', async () => {
      giphyService.isConfigured.mockReturnValue(false);
      
      tenorService.isConfigured.mockReturnValue(true);
      tenorService.trending.mockResolvedValue({
        data: [mockGif],
        source: 'tenor',
        cached: false,
      });

      const res = await request(app)
        .get('/api/gifs/trending')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.source).toBe('tenor');
    });
  });

  describe('GET /api/gifs/categories', () => {
    it('should get categories from Tenor', async () => {
      const mockCategories = [
        { name: 'Funny', searchTerm: 'funny' },
        { name: 'Love', searchTerm: 'love' },
      ];

      tenorService.isConfigured.mockReturnValue(true);
      tenorService.categories.mockResolvedValue({
        data: mockCategories,
        source: 'tenor',
        cached: false,
      });

      const res = await request(app)
        .get('/api/gifs/categories')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.categories).toHaveLength(2);
    });

    it('should fallback to GIPHY for categories', async () => {
      tenorService.isConfigured.mockReturnValue(false);
      
      giphyService.isConfigured.mockReturnValue(true);
      giphyService.categories.mockResolvedValue({
        data: [{ name: 'Reactions', searchTerm: 'reactions' }],
        source: 'giphy',
        cached: true,
      });

      const res = await request(app)
        .get('/api/gifs/categories')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.source).toBe('giphy');
    });
  });

  describe('POST /api/gifs/favorites', () => {
    it('should save favorite successfully', async () => {
      const mockFavorite = {
        id: 'fav-uuid',
        user_id: 'user-uuid',
        gif_id: 'gif-123',
        gif_url: 'https://giphy.com/gifs/123',
        title: 'Funny GIF',
        source: 'giphy',
        created_at: new Date().toISOString(),
      };

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockFavorite,
          error: null,
        }),
      });

      const res = await request(app)
        .post('/api/gifs/favorites')
        .set('Authorization', validToken)
        .send({
          gifId: 'gif-123',
          gifUrl: 'https://giphy.com/gifs/123',
          title: 'Funny GIF',
          source: 'giphy',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.favorite.gif_id).toBe('gif-123');
    });

    it('should reject duplicate favorite', async () => {
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: '23505', message: 'Duplicate' },
        }),
      });

      const res = await request(app)
        .post('/api/gifs/favorites')
        .set('Authorization', validToken)
        .send({
          gifId: 'gif-123',
          gifUrl: 'https://giphy.com/gifs/123',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toContain('already in favorites');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/gifs/favorites')
        .set('Authorization', validToken)
        .send({});

      expect(res.statusCode).toBe(400);
    });

    it('should validate URL format', async () => {
      const res = await request(app)
        .post('/api/gifs/favorites')
        .set('Authorization', validToken)
        .send({
          gifId: 'gif-123',
          gifUrl: 'not-a-url',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/gifs/favorites', () => {
    it('should get user favorites', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          gif_id: 'gif-1',
          gif_url: 'https://...',
          title: 'GIF 1',
        },
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockFavorites,
          error: null,
          count: 1,
        }),
      });

      const res = await request(app)
        .get('/api/gifs/favorites')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.favorites).toHaveLength(1);
    });

    it('should support pagination', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      });

      const res = await request(app)
        .get('/api/gifs/favorites?limit=10&offset=20')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('limit', 10);
      expect(res.body).toHaveProperty('offset', 20);
    });
  });

  describe('DELETE /api/gifs/favorites/:favoriteId', () => {
    it('should delete favorite successfully', async () => {
      supabase.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      const res = await request(app)
        .delete('/api/gifs/favorites/fav-uuid-123')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('removed');
    });

    it('should validate UUID format', async () => {
      const res = await request(app)
        .delete('/api/gifs/favorites/invalid-id')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/gifs/stats', () => {
    it('should return cache statistics', async () => {
      giphyService.isConfigured.mockReturnValue(true);
      giphyService.getCacheStats.mockReturnValue({
        keys: 5,
        hits: 10,
        misses: 3,
      });

      tenorService.isConfigured.mockReturnValue(true);
      tenorService.getCacheStats.mockReturnValue({
        keys: 3,
        hits: 7,
        misses: 2,
      });

      const res = await request(app)
        .get('/api/gifs/stats')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('giphy');
      expect(res.body).toHaveProperty('tenor');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce 10 requests per minute limit', async () => {
      giphyService.isConfigured.mockReturnValue(true);
      giphyService.search.mockResolvedValue({
        data: [mockGif],
        source: 'giphy',
        cached: false,
      });

      // Make 10 requests (should succeed)
      for (let i = 0; i < 10; i++) {
        const res = await request(app)
          .get(`/api/gifs/search?q=test${i}`)
          .set('Authorization', validToken);
        
        expect(res.statusCode).toBe(200);
      }

      // 11th request should be rate limited
      const res = await request(app)
        .get('/api/gifs/search?q=test11')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(429);
      expect(res.body.error).toBe('Too Many Requests');
    }, 15000); // Increase timeout for rate limit test
  });
});
