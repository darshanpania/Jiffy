const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../config/logger');
const config = require('../config/config');

/**
 * Tenor Service
 * Integration with Tenor API (Google) for GIF search and trending
 * Used as fallback when GIPHY fails
 */
class TenorService {
  constructor() {
    this.baseURL = 'https://tenor.googleapis.com/v2';
    this.apiKey = config.tenor.apiKey;
    this.cache = new NodeCache({ stdTTL: 600 }); // 10 minute cache
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      params: {
        key: this.apiKey,
      },
    });
    
    logger.info('Tenor service initialized');
  }
  
  /**
   * Check if Tenor is configured
   */
  isConfigured() {
    return !!this.apiKey && this.apiKey !== '';
  }
  
  /**
   * Search GIFs
   */
  async search(query, limit = 25, offset = 0, contentFilter = 'high') {
    try {
      if (!this.isConfigured()) {
        throw new Error('Tenor API key not configured');
      }
      
      const cacheKey = `search:${query}:${limit}:${offset}:${contentFilter}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        logger.debug(`Tenor search cache hit: ${query}`);
        return { data: cached, source: 'tenor', cached: true };
      }
      
      logger.debug(`Tenor search: ${query}`);
      
      const response = await this.client.get('/search', {
        params: {
          q: query,
          limit,
          pos: offset, // Tenor uses 'pos' instead of 'offset'
          contentfilter: contentFilter,
          media_filter: 'gif',
          locale: 'en_US',
        },
      });
      
      const formatted = this.formatSearchResponse(response.data);
      this.cache.set(cacheKey, formatted);
      
      logger.info(`Tenor search success: ${query} → ${formatted.length} results`);
      
      return { data: formatted, source: 'tenor', cached: false };
    } catch (error) {
      logger.error('Tenor search error:', error.message);
      throw error;
    }
  }
  
  /**
   * Get trending GIFs
   */
  async trending(limit = 25, offset = 0, contentFilter = 'high') {
    try {
      if (!this.isConfigured()) {
        throw new Error('Tenor API key not configured');
      }
      
      const cacheKey = `trending:${limit}:${offset}:${contentFilter}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        logger.debug('Tenor trending cache hit');
        return { data: cached, source: 'tenor', cached: true };
      }
      
      logger.debug('Tenor trending request');
      
      const response = await this.client.get('/featured', {
        params: {
          limit,
          pos: offset,
          contentfilter: contentFilter,
          media_filter: 'gif',
        },
      });
      
      const formatted = this.formatSearchResponse(response.data);
      this.cache.set(cacheKey, formatted);
      
      logger.info(`Tenor trending success: ${formatted.length} GIFs`);
      
      return { data: formatted, source: 'tenor', cached: false };
    } catch (error) {
      logger.error('Tenor trending error:', error.message);
      throw error;
    }
  }
  
  /**
   * Get GIF categories
   */
  async categories() {
    try {
      if (!this.isConfigured()) {
        throw new Error('Tenor API key not configured');
      }
      
      const cacheKey = 'categories';
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        logger.debug('Tenor categories cache hit');
        return { data: cached, source: 'tenor', cached: true };
      }
      
      logger.debug('Tenor categories request');
      
      const response = await this.client.get('/categories', {
        params: {
          locale: 'en_US',
        },
      });
      
      const categories = response.data.tags?.map(tag => ({
        name: tag.name || tag.searchterm,
        searchTerm: tag.searchterm,
        image: tag.image || null,
      })) || [];
      
      this.cache.set(cacheKey, categories, 3600); // Cache for 1 hour
      
      logger.info(`Tenor categories success: ${categories.length} categories`);
      
      return { data: categories, source: 'tenor', cached: false };
    } catch (error) {
      logger.error('Tenor categories error:', error.message);
      throw error;
    }
  }
  
  /**
   * Get trending search terms
   */
  async trendingTerms() {
    try {
      if (!this.isConfigured()) {
        throw new Error('Tenor API key not configured');
      }
      
      const cacheKey = 'trending_terms';
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        return { data: cached, source: 'tenor', cached: true };
      }
      
      const response = await this.client.get('/trending_terms', {
        params: {
          locale: 'en_US',
        },
      });
      
      const terms = response.data.results || [];
      this.cache.set(cacheKey, terms, 1800); // Cache for 30 min
      
      logger.info(`Tenor trending terms: ${terms.length} terms`);
      
      return { data: terms, source: 'tenor', cached: false };
    } catch (error) {
      logger.error('Tenor trending terms error:', error.message);
      throw error;
    }
  }
  
  /**
   * Format Tenor search response to unified format
   */
  formatSearchResponse(response) {
    if (!response || !response.results) {
      return [];
    }
    
    return response.results.map(gif => this.formatGif(gif));
  }
  
  /**
   * Format single Tenor GIF to unified format
   */
  formatGif(gif) {
    const media = gif.media_formats || {};
    
    return {
      id: gif.id,
      title: gif.content_description || gif.h1_title || '',
      url: gif.itemurl || gif.url || '',
      embedUrl: gif.itemurl || '',
      source: 'tenor',
      images: {
        original: {
          url: media.gif?.url || '',
          width: media.gif?.dims?.[0] || 0,
          height: media.gif?.dims?.[1] || 0,
          size: media.gif?.size || 0,
        },
        fixed_height: {
          url: media.mediumgif?.url || media.tinygif?.url || '',
          width: media.mediumgif?.dims?.[0] || 0,
          height: media.mediumgif?.dims?.[1] || 0,
        },
        fixed_width: {
          url: media.nanogif?.url || media.tinygif?.url || '',
          width: media.nanogif?.dims?.[0] || 0,
          height: media.nanogif?.dims?.[1] || 0,
        },
        preview: {
          url: media.tinygif?.url || media.nanogif?.url || '',
          width: media.tinygif?.dims?.[0] || 0,
          height: media.tinygif?.dims?.[1] || 0,
        },
        downsized: {
          url: media.loopedmp4?.url || media.mp4?.url || '',
          width: media.loopedmp4?.dims?.[0] || 0,
          height: media.loopedmp4?.dims?.[1] || 0,
          size: media.loopedmp4?.size || 0,
        },
      },
      username: gif.author || '',
      rating: gif.content_rating || 'g',
      createDate: gif.created || '',
      tags: gif.tags || [],
    };
  }
  
  /**
   * Clear cache
   */
  clearCache() {
    const keys = this.cache.keys();
    this.cache.flushAll();
    logger.info(`Tenor cache cleared: ${keys.length} keys`);
  }
  
  /**
   * Get cache stats
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

module.exports = new TenorService();
