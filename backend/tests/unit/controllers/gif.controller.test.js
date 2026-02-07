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
  const testUserId = 'test-user-uuid';

  const mockGif = {
    id: 'test-gif-id',
    provider: 'giphy',
    title: 'Test GIF',
    url: 'https://giphy.com/gifs/test',
    images: {
      original: {
        url: 'https://media.giphy.com/test.gif',
        width: 480,
        height: 270,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/gifs/search', () => {
    it('should search GIFs successfully with GIPHY', async () => {
      giphyService.search.mockResolvedValue({
        success: true,
        data: {
          gifs: [mockGif],
          pagination: { total_count: 1 },
          provider: 'giphy',
        },
        cached: false,
      });

      const res = await request(app)
        .get('/api/gifs/search?q=funny')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.gifs).toHaveLength(1);
      expect(res.body.provider).toBe('giphy');
      expect(res.body.query).toBe('funny');
    });

    it('should fallback to Tenor when GIPHY fails', async () => {
      giphyService.search.mockResolvedValue({
        success: false,
        error: 'API error',
      });

      tenorService.search.mockResolvedValue({
        success: true,
        data: {
          gifs: [{ ...mockGif, provider: 'tenor' }],
          provider: 'tenor',
        },
      });

      const res = await request(app)
        .get('/api/gifs/search?q=funny')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.provider).toBe('tenor');
    });

    it('should return 503 when all providers fail', async () => {
      giphyService.search.mockResolvedValue({
        success: false,
        error: 'API error',
      });

      tenorService.search.mockResolvedValue({
        success: false,
        error: 'API error',
      });

      const res = await request(app)
        .get('/api/gifs/search?q=funny')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(503);
      expect(res.body.error).toBe('Service Unavailable');
    });

    it('should validate query length', async () => {
      const res = await request(app)
        .get('/api/gifs/search?q=a')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(400);
    });

    it('should validate limit maximum', async () => {
      const res = await request(app)
        .get('/api/gifs/search?q=funny&limit=100')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(400);
    });

    it('should allow manual provider selection', async () => {
      tenorService.search.mockResolvedValue({
        success: true,
        data: {
          gifs: [mockGif],
          provider: 'tenor',
        },
      });

      const res = await request(app)
        .get('/api/gifs/search?q=funny&provider=tenor')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(tenorService.search).toHaveBeenCalled();
      expect(giphyService.search).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/gifs/trending', () => {
    it('should get trending GIFs successfully', async () => {
      giphyService.trending.mockResolvedValue({
        success: true,
        data: {
          gifs: [mockGif],
          provider: 'giphy',
        },
      });

      const res = await request(app)
        .get('/api/gifs/trending')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.gifs).toBeDefined();
      expect(res.body.provider).toBe('giphy');
    });

    it('should fallback to Tenor for trending', async () => {
      giphyService.trending.mockResolvedValue({
        success: false,
        error: 'API error',
      });

      tenorService.trending.mockResolvedValue({
        success: true,
        data: {
          gifs: [mockGif],
          provider: 'tenor',
        },
      });

      const res = await request(app)
        .get('/api/gifs/trending')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.provider).toBe('tenor');
    });
  });

  describe('GET /api/gifs/categories', () => {
    it('should get categories successfully', async () => {
      giphyService.getCategories.mockResolvedValue({
        success: true,
        data: {
          categories: [
            { name: 'Reactions', nameEncoded: 'reactions' },
          ],
          provider: 'giphy',
        },
      });

      const res = await request(app)
        .get('/api/gifs/categories')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.categories).toBeDefined();
    });
  });

  describe('POST /api/gifs/favorites', () => {
    it('should save favorite successfully', async () => {
      supabase.from.mockReturnValue({
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'favorite-uuid',
            gif_id: 'test-gif',
            provider: 'giphy',
            gif_url: 'https://...',
            created_at: new Date().toISOString(),
          },
          error: null,
        }),
      });

      const res = await request(app)
        .post('/api/gifs/favorites')
        .set('Authorization', validToken)
        .send({
          gifId: 'test-gif',
          provider: 'giphy',
          gifUrl: 'https://media.giphy.com/test.gif',
          title: 'Test GIF',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.favorite).toBeDefined();
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/gifs/favorites')
        .set('Authorization', validToken)
        .send({
          gifId: 'test-gif',
          // Missing provider and gifUrl
        });

      expect(res.statusCode).toBe(400);
    });

    it('should validate provider enum', async () => {
      const res = await request(app)
        .post('/api/gifs/favorites')
        .set('Authorization', validToken)
        .send({
          gifId: 'test-gif',
          provider: 'invalid',
          gifUrl: 'https://...',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should validate URL format', async () => {
      const res = await request(app)
        .post('/api/gifs/favorites')
        .set('Authorization', validToken)
        .send({
          gifId: 'test-gif',
          provider: 'giphy',
          gifUrl: 'not-a-url',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/gifs/favorites', () => {
    it('should get user favorites successfully', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          gif_id: 'gif-1',
          provider: 'giphy',
          gif_url: 'https://...',
          title: 'Favorite 1',
          created_at: new Date().toISOString(),
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
      expect(res.body.total).toBe(1);
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
    });
  });

  describe('DELETE /api/gifs/favorites/:favoriteId', () => {
    it('should delete favorite successfully', async () => {
      // Mock ownership check
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: testUserId },
          error: null,
        }),
      });

      // Mock delete
      supabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      const res = await request(app)
        .delete('/api/gifs/favorites/favorite-uuid')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('deleted');
    });

    it('should reject deleting others favorites', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: 'different-user' },
          error: null,
        }),
      });

      const res = await request(app)
        .delete('/api/gifs/favorites/favorite-uuid')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(403);
    });

    it('should return 404 for non-existent favorite', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      const res = await request(app)
        .delete('/api/gifs/favorites/non-existent-uuid')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(404);
    });

    it('should validate UUID format', async () => {
      const res = await request(app)
        .delete('/api/gifs/favorites/invalid-id')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/gifs/cache-stats', () => {
    it('should return cache statistics', async () => {
      giphyService.getCacheStats.mockReturnValue({
        keys: 10,
        hits: 50,
        misses: 20,
      });

      tenorService.getCacheStats.mockReturnValue({
        keys: 5,
        hits: 30,
        misses: 10,
      });

      const res = await request(app)
        .get('/api/gifs/cache-stats')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.giphy).toBeDefined();
      expect(res.body.tenor).toBeDefined();
      expect(res.body.totalKeys).toBe(15);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce 10 requests per minute limit', async () => {
      giphyService.search.mockResolvedValue({
        success: true,
        data: { gifs: [], provider: 'giphy' },
      });

      // Make 11 requests rapidly
      const requests = [];
      for (let i = 0; i < 11; i++) {
        requests.push(
          request(app)
            .get('/api/gifs/search?q=test')
            .set('Authorization', validToken)
        );
      }

      const responses = await Promise.all(requests);
      
      // Last request should be rate limited
      const lastResponse = responses[10];
      expect(lastResponse.statusCode).toBe(429);
      expect(lastResponse.body.error).toContain('Too Many Requests');
    });
  });
});
