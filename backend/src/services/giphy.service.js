const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../config/logger');
const config = require('../config/config');

/**
 * GIPHY Service
 * Handles GIPHY API integration with caching
 */
class GiphyService {
  constructor() {
    this.apiKey = config.giphy.apiKey;
    this.baseUrl = 'https://api.giphy.com/v1/gifs';
    
    // Cache with 10 minute TTL
    this.cache = new NodeCache({
      stdTTL: 600, // 10 minutes
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false,
    });
    
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000, // 10 second timeout
      params: {
        api_key: this.apiKey,
      },
    });
    
    logger.info('GIPHY service initialized');
  }
  
  /**
   * Generate cache key
   */
  getCacheKey(operation, params) {
    const paramStr = JSON.stringify(params);
    return `giphy:${operation}:${paramStr}`;
  }
  
  /**
   * Search GIFs
   */
  async search(query, limit = 25, offset = 0, rating = 'g') {
    try {
      const cacheKey = this.getCacheKey('search', { query, limit, offset, rating });
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached) {
        logger.debug(`GIPHY cache hit: ${cacheKey}`);
        return { success: true, data: cached, cached: true };
      }
      
      logger.debug(`GIPHY search: "${query}" limit=${limit} offset=${offset}`);
      
      const response = await this.axiosInstance.get('/search', {
        params: {
          q: query,
          limit,
          offset,
          rating,
          lang: 'en',
        },
      });
      
      const gifs = this.formatGifs(response.data.data);
      const result = {
        gifs,
        pagination: response.data.pagination,
        provider: 'giphy',
      };
      
      // Cache result
      this.cache.set(cacheKey, result);
      
      logger.info(`GIPHY search: "${query}" → ${gifs.length} results`);
      
      return { success: true, data: result, cached: false };
    } catch (error) {
      logger.error('GIPHY search error:', error.message);
      return {
        success: false,
        error: error.message,
        provider: 'giphy',
      };
    }
  }
  
  /**
   * Get trending GIFs
   */
  async trending(limit = 25, offset = 0, rating = 'g') {
    try {
      const cacheKey = this.getCacheKey('trending', { limit, offset, rating });
      
      // Check cache
      const cached = this.cache.get(cacheKey);
      if (cached) {
        logger.debug(`GIPHY trending cache hit`);
        return { success: true, data: cached, cached: true };
      }
      
      logger.debug(`GIPHY trending: limit=${limit}`);
      
      const response = await this.axiosInstance.get('/trending', {
        params: {
          limit,
          offset,
          rating,
        },
      });
      
      const gifs = this.formatGifs(response.data.data);
      const result = {
        gifs,
        pagination: response.data.pagination,
        provider: 'giphy',
      };
      
      // Cache for 10 minutes
      this.cache.set(cacheKey, result);
      
      logger.info(`GIPHY trending → ${gifs.length} results`);
      
      return { success: true, data: result, cached: false };
    } catch (error) {
      logger.error('GIPHY trending error:', error.message);
      return {
        success: false,
        error: error.message,
        provider: 'giphy',
      };
    }
  }
  
  /**
   * Get GIF categories
   */
  async getCategories(limit = 25, offset = 0) {
    try {
      const cacheKey = this.getCacheKey('categories', { limit, offset });
      
      // Check cache
      const cached = this.cache.get(cacheKey);
      if (cached) {
        logger.debug(`GIPHY categories cache hit`);
        return { success: true, data: cached, cached: true };
      }
      
      logger.debug(`GIPHY categories: limit=${limit}`);
      
      const response = await this.axiosInstance.get('/categories', {
        params: {
          limit,
          offset,
        },
      });
      
      const categories = response.data.data.map(cat => ({
        name: cat.name,
        nameEncoded: cat.name_encoded,
        gif: cat.gif ? this.formatGif(cat.gif) : null,
      }));
      
      const result = {
        categories,
        pagination: response.data.pagination,
        provider: 'giphy',
      };
      
      // Cache for longer (30 minutes) - categories don't change often
      this.cache.set(cacheKey, result, 1800);
      
      logger.info(`GIPHY categories → ${categories.length} results`);
      
      return { success: true, data: result, cached: false };
    } catch (error) {
      logger.error('GIPHY categories error:', error.message);
      return {
        success: false,
        error: error.message,
        provider: 'giphy',
      };
    }
  }
  
  /**
   * Get GIF by ID
   */
  async getById(gifId) {
    try {
      const cacheKey = `giphy:gif:${gifId}`;
      
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return { success: true, data: cached, cached: true };
      }
      
      const response = await this.axiosInstance.get(`/${gifId}`);
      
      const gif = this.formatGif(response.data.data);
      
      // Cache for 1 hour
      this.cache.set(cacheKey, gif, 3600);
      
      return { success: true, data: gif, cached: false };
    } catch (error) {
      logger.error('GIPHY getById error:', error.message);
      return {
        success: false,
        error: error.message,
        provider: 'giphy',
      };
    }
  }
  
  /**
   * Format single GIF to unified format
   */
  formatGif(gif) {
    if (!gif) return null;
    
    return {
      id: gif.id,
      provider: 'giphy',
      title: gif.title || '',
      url: gif.url,
      embedUrl: gif.embed_url,
      rating: gif.rating,
      images: {
        original: {
          url: gif.images.original?.url,
          width: parseInt(gif.images.original?.width || 0),
          height: parseInt(gif.images.original?.height || 0),
          size: parseInt(gif.images.original?.size || 0),
        },
        downsized: {
          url: gif.images.downsized?.url,
          width: parseInt(gif.images.downsized?.width || 0),
          height: parseInt(gif.images.downsized?.height || 0),
          size: parseInt(gif.images.downsized?.size || 0),
        },
        preview: {
          url: gif.images.preview_gif?.url,
          width: parseInt(gif.images.preview_gif?.width || 0),
          height: parseInt(gif.images.preview_gif?.height || 0),
        },
        fixed_height: {
          url: gif.images.fixed_height?.url,
          width: parseInt(gif.images.fixed_height?.width || 0),
          height: parseInt(gif.images.fixed_height?.height || 0),
        },
        fixed_width: {
          url: gif.images.fixed_width?.url,
          width: parseInt(gif.images.fixed_width?.width || 0),
          height: parseInt(gif.images.fixed_width?.height || 0),
        },
      },
      user: gif.user ? {
        username: gif.user.username,
        displayName: gif.user.display_name,
        avatarUrl: gif.user.avatar_url,
      } : null,
    };
  }
  
  /**
   * Format multiple GIFs
   */
  formatGifs(gifs) {
    if (!Array.isArray(gifs)) return [];
    return gifs.map(gif => this.formatGif(gif)).filter(Boolean);
  }
  
  /**
   * Clear cache
   */
  clearCache() {
    this.cache.flushAll();
    logger.info('GIPHY cache cleared');
  }
  
  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      keys: this.cache.keys().length,
      hits: this.cache.getStats().hits,
      misses: this.cache.getStats().misses,
      ksize: this.cache.getStats().ksize,
      vsize: this.cache.getStats().vsize,
    };
  }
}

module.exports = new GiphyService();
