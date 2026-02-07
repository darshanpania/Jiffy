const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../config/logger');
const config = require('../config/config');

/**
 * GIPHY Service
 * Integration with GIPHY API for GIF search, trending, and categories
 */
class GiphyService {
  constructor() {
    this.baseURL = 'https://api.giphy.com/v1/gifs';
    this.apiKey = config.giphy.apiKey;
    this.cache = new NodeCache({ stdTTL: 600 }); // 10 minute cache
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      params: {
        api_key: this.apiKey,
      },
    });
    
    logger.info('GIPHY service initialized');
  }
  
  /**
   * Check if GIPHY is configured
   */
  isConfigured() {
    return !!this.apiKey && this.apiKey !== '';
  }
  
  /**
   * Search GIFs
   */
  async search(query, limit = 25, offset = 0, rating = 'g') {
    try {
      if (!this.isConfigured()) {
        throw new Error('GIPHY API key not configured');
      }
      
      const cacheKey = `search:${query}:${limit}:${offset}:${rating}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        logger.debug(`GIPHY search cache hit: ${query}`);
        return { data: cached, source: 'giphy', cached: true };
      }
      
      logger.debug(`GIPHY search: ${query}`);
      
      const response = await this.client.get('/search', {
        params: {
          q: query,
          limit,
          offset,
          rating,
          lang: 'en',
        },
      });
      
      const formatted = this.formatSearchResponse(response.data);
      this.cache.set(cacheKey, formatted);
      
      logger.info(`GIPHY search success: ${query} → ${formatted.length} results`);
      
      return { data: formatted, source: 'giphy', cached: false };
    } catch (error) {
      logger.error('GIPHY search error:', error.message);
      throw error;
    }
  }
  
  /**
   * Get trending GIFs
   */
  async trending(limit = 25, offset = 0, rating = 'g') {
    try {
      if (!this.isConfigured()) {
        throw new Error('GIPHY API key not configured');
      }
      
      const cacheKey = `trending:${limit}:${offset}:${rating}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        logger.debug('GIPHY trending cache hit');
        return { data: cached, source: 'giphy', cached: true };
      }
      
      logger.debug('GIPHY trending request');
      
      const response = await this.client.get('/trending', {
        params: {
          limit,
          offset,
          rating,
        },
      });
      
      const formatted = this.formatSearchResponse(response.data);
      this.cache.set(cacheKey, formatted);
      
      logger.info(`GIPHY trending success: ${formatted.length} GIFs`);
      
      return { data: formatted, source: 'giphy', cached: false };
    } catch (error) {
      logger.error('GIPHY trending error:', error.message);
      throw error;
    }
  }
  
  /**
   * Get GIF categories
   */
  async categories() {
    try {
      if (!this.isConfigured()) {
        throw new Error('GIPHY API key not configured');
      }
      
      const cacheKey = 'categories';
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        logger.debug('GIPHY categories cache hit');
        return { data: cached, source: 'giphy', cached: true };
      }
      
      logger.debug('GIPHY categories request');
      
      // GIPHY doesn't have a categories endpoint, so we return predefined categories
      const categories = [
        { name: 'Reactions', searchTerm: 'reactions' },
        { name: 'Entertainment', searchTerm: 'entertainment' },
        { name: 'Sports', searchTerm: 'sports' },
        { name: 'Animals', searchTerm: 'animals cute' },
        { name: 'Food & Drink', searchTerm: 'food drink' },
        { name: 'Gaming', searchTerm: 'gaming' },
        { name: 'Funny', searchTerm: 'funny humor' },
        { name: 'Love & Romance', searchTerm: 'love romance' },
        { name: 'Celebration', searchTerm: 'party celebration' },
        { name: 'Music', searchTerm: 'music dance' },
        { name: 'Nature', searchTerm: 'nature beautiful' },
        { name: 'Movies & TV', searchTerm: 'movies tv shows' },
      ];
      
      this.cache.set(cacheKey, categories, 3600); // Cache for 1 hour
      
      logger.info('GIPHY categories returned');
      
      return { data: categories, source: 'giphy', cached: false };
    } catch (error) {
      logger.error('GIPHY categories error:', error.message);
      throw error;
    }
  }
  
  /**
   * Get GIF by ID
   */
  async getById(gifId) {
    try {
      if (!this.isConfigured()) {
        throw new Error('GIPHY API key not configured');
      }
      
      const cacheKey = `gif:${gifId}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        return { data: cached, source: 'giphy', cached: true };
      }
      
      const response = await this.client.get(`/${gifId}`);
      const formatted = this.formatGif(response.data.data);
      
      this.cache.set(cacheKey, formatted, 1800); // Cache for 30 min
      
      return { data: formatted, source: 'giphy', cached: false };
    } catch (error) {
      logger.error('GIPHY get by ID error:', error.message);
      throw error;
    }
  }
  
  /**
   * Format GIPHY search response to unified format
   */
  formatSearchResponse(response) {
    if (!response || !response.data) {
      return [];
    }
    
    return response.data.map(gif => this.formatGif(gif));
  }
  
  /**
   * Format single GIPHY GIF to unified format
   */
  formatGif(gif) {
    return {
      id: gif.id,
      title: gif.title || '',
      url: gif.url,
      embedUrl: gif.embed_url,
      source: 'giphy',
      images: {
        original: {
          url: gif.images.original?.url || '',
          width: gif.images.original?.width || 0,
          height: gif.images.original?.height || 0,
          size: gif.images.original?.size || 0,
        },
        fixed_height: {
          url: gif.images.fixed_height?.url || '',
          width: gif.images.fixed_height?.width || 0,
          height: gif.images.fixed_height?.height || 0,
        },
        fixed_width: {
          url: gif.images.fixed_width?.url || '',
          width: gif.images.fixed_width?.width || 0,
          height: gif.images.fixed_width?.height || 0,
        },
        preview: {
          url: gif.images.preview_gif?.url || gif.images.fixed_height_small?.url || '',
          width: gif.images.preview_gif?.width || 0,
          height: gif.images.preview_gif?.height || 0,
        },
        downsized: {
          url: gif.images.downsized?.url || '',
          width: gif.images.downsized?.width || 0,
          height: gif.images.downsized?.height || 0,
          size: gif.images.downsized?.size || 0,
        },
      },
      username: gif.username || '',
      rating: gif.rating || '',
      trendingDatetime: gif.trending_datetime || '',
      createDate: gif.import_datetime || '',
    };
  }
  
  /**
   * Clear cache
   */
  clearCache() {
    const keys = this.cache.keys();
    this.cache.flushAll();
    logger.info(`GIPHY cache cleared: ${keys.length} keys`);
  }
  
  /**
   * Get cache stats
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

module.exports = new GiphyService();
