const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../config/logger');
const config = require('../config/config');

/**
 * Tenor Service
 * Handles Tenor API integration with caching (fallback provider)
 */
class TenorService {
  constructor() {
    this.apiKey = config.tenor.apiKey;
    this.baseUrl = 'https://tenor.googleapis.com/v2';
    this.clientKey = config.tenor.clientKey || 'jiffy';
    
    // Cache with 10 minute TTL
    this.cache = new NodeCache({
      stdTTL: 600, // 10 minutes
      checkperiod: 120,
      useClones: false,
    });
    
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      params: {
        key: this.apiKey,
        client_key: this.clientKey,
      },
    });
    
    logger.info('Tenor service initialized');
  }
  
  /**
   * Generate cache key
   */
  getCacheKey(operation, params) {
    const paramStr = JSON.stringify(params);
    return `tenor:${operation}:${paramStr}`;
  }
  
  /**
   * Search GIFs
   */
  async search(query, limit = 25, pos = null, contentFilter = 'medium') {
    try {
      const cacheKey = this.getCacheKey('search', { query, limit, pos, contentFilter });
      
      // Check cache
      const cached = this.cache.get(cacheKey);
      if (cached) {
        logger.debug(`Tenor cache hit: ${cacheKey}`);
        return { success: true, data: cached, cached: true };
      }
      
      logger.debug(`Tenor search: "${query}" limit=${limit}`);
      
      const params = {
        q: query,
        limit,
        contentfilter: contentFilter,
        media_filter: 'gif',
        ar_range: 'all',
      };
      
      if (pos) {
        params.pos = pos;
      }
      
      const response = await this.axiosInstance.get('/search', { params });
      
      const gifs = this.formatGifs(response.data.results);
      const result = {
        gifs,
        next: response.data.next || null,
        provider: 'tenor',
      };
      
      // Cache result
      this.cache.set(cacheKey, result);
      
      logger.info(`Tenor search: "${query}" → ${gifs.length} results`);
      
      return { success: true, data: result, cached: false };
    } catch (error) {
      logger.error('Tenor search error:', error.message);
      return {
        success: false,
        error: error.message,
        provider: 'tenor',
      };
    }
  }
  
  /**
   * Get trending GIFs
   */
  async trending(limit = 25, pos = null, contentFilter = 'medium') {
    try {
      const cacheKey = this.getCacheKey('trending', { limit, pos, contentFilter });
      
      // Check cache
      const cached = this.cache.get(cacheKey);
      if (cached) {
        logger.debug(`Tenor trending cache hit`);
        return { success: true, data: cached, cached: true };
      }
      
      logger.debug(`Tenor trending: limit=${limit}`);
      
      const params = {
        limit,
        contentfilter: contentFilter,
        media_filter: 'gif',
      };
      
      if (pos) {
        params.pos = pos;
      }
      
      const response = await this.axiosInstance.get('/featured', { params });
      
      const gifs = this.formatGifs(response.data.results);
      const result = {
        gifs,
        next: response.data.next || null,
        provider: 'tenor',
      };
      
      // Cache result
      this.cache.set(cacheKey, result);
      
      logger.info(`Tenor trending → ${gifs.length} results`);
      
      return { success: true, data: result, cached: false };
    } catch (error) {
      logger.error('Tenor trending error:', error.message);
      return {
        success: false,
        error: error.message,
        provider: 'tenor',
      };
    }
  }
  
  /**
   * Get GIF categories
   */
  async getCategories(limit = 25, pos = null) {
    try {
      const cacheKey = this.getCacheKey('categories', { limit, pos });
      
      // Check cache
      const cached = this.cache.get(cacheKey);
      if (cached) {
        logger.debug(`Tenor categories cache hit`);
        return { success: true, data: cached, cached: true };
      }
      
      logger.debug(`Tenor categories: limit=${limit}`);
      
      const params = {
        limit,
        contentfilter: 'medium',
      };
      
      if (pos) {
        params.pos = pos;
      }
      
      const response = await this.axiosInstance.get('/categories', { params });
      
      const categories = response.data.tags.map(tag => ({
        name: tag.searchterm,
        nameEncoded: encodeURIComponent(tag.searchterm),
        image: tag.image,
        path: tag.path,
      }));
      
      const result = {
        categories,
        provider: 'tenor',
      };
      
      // Cache for 30 minutes
      this.cache.set(cacheKey, result, 1800);
      
      logger.info(`Tenor categories → ${categories.length} results`);
      
      return { success: true, data: result, cached: false };
    } catch (error) {
      logger.error('Tenor categories error:', error.message);
      return {
        success: false,
        error: error.message,
        provider: 'tenor',
      };
    }
  }
  
  /**
   * Format single GIF to unified format
   */
  formatGif(gif) {
    if (!gif) return null;
    
    const media = gif.media_formats || {};
    
    return {
      id: gif.id,
      provider: 'tenor',
      title: gif.content_description || gif.h1_title || '',
      url: gif.itemurl || gif.url,
      embedUrl: gif.itemurl,
      rating: gif.content_rating || 'g',
      images: {
        original: {
          url: media.gif?.url || media.mediumgif?.url,
          width: parseInt(media.gif?.dims?.[0] || 0),
          height: parseInt(media.gif?.dims?.[1] || 0),
          size: parseInt(media.gif?.size || 0),
        },
        downsized: {
          url: media.tinygif?.url || media.nanogif?.url,
          width: parseInt(media.tinygif?.dims?.[0] || 0),
          height: parseInt(media.tinygif?.dims?.[1] || 0),
          size: parseInt(media.tinygif?.size || 0),
        },
        preview: {
          url: media.nanogif?.url || media.tinygif?.url,
          width: parseInt(media.nanogif?.dims?.[0] || 0),
          height: parseInt(media.nanogif?.dims?.[1] || 0),
        },
        fixed_height: {
          url: media.mediumgif?.url,
          width: parseInt(media.mediumgif?.dims?.[0] || 0),
          height: parseInt(media.mediumgif?.dims?.[1] || 0),
        },
        fixed_width: {
          url: media.tinygif?.url,
          width: parseInt(media.tinygif?.dims?.[0] || 0),
          height: parseInt(media.tinygif?.dims?.[1] || 0),
        },
      },
      user: null, // Tenor doesn't provide user info
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
    logger.info('Tenor cache cleared');
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

module.exports = new TenorService();
