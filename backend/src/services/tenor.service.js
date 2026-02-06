/**
 * Tenor Service
 * Integration with Tenor API (Google) for GIF search
 */

const axios = require('axios');
const NodeCache = require('node-cache');
const config = require('../config/config');
const logger = require('../config/logger');

class TenorService {
  constructor() {
    this.apiKey = config.tenor.apiKey;
    this.baseUrl = config.tenor.baseUrl;
    this.cache = new NodeCache({ stdTTL: config.cache.ttl });
    
    if (!this.apiKey) {
      logger.warn('Tenor API key not configured');
    }
  }
  
  /**
   * Search GIFs
   */
  async search(query, limit = 20, offset = 0) {
    try {
      const cacheKey = `tenor:search:${query}:${limit}:${offset}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        logger.debug('Tenor search cache hit');
        return cached;
      }
      
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          key: this.apiKey,
          q: query,
          limit,
          pos: offset > 0 ? offset.toString() : undefined,
          contentfilter: 'medium',
          media_filter: 'gif',
        },
      });
      
      const gifs = response.data.results.map(this.mapTenorGif);
      
      this.cache.set(cacheKey, gifs);
      logger.info(`Tenor search: "${query}" - ${gifs.length} results`);
      
      return gifs;
    } catch (error) {
      logger.error('Tenor search error:', error.message);
      throw new Error('Failed to search Tenor');
    }
  }
  
  /**
   * Get featured/trending GIFs
   */
  async featured(limit = 20) {
    try {
      const cacheKey = `tenor:featured:${limit}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      const response = await axios.get(`${this.baseUrl}/featured`, {
        params: {
          key: this.apiKey,
          limit,
          contentfilter: 'medium',
          media_filter: 'gif',
        },
      });
      
      const gifs = response.data.results.map(this.mapTenorGif);
      
      this.cache.set(cacheKey, gifs);
      logger.info(`Tenor featured: ${gifs.length} results`);
      
      return gifs;
    } catch (error) {
      logger.error('Tenor featured error:', error.message);
      throw new Error('Failed to get featured GIFs');
    }
  }
  
  /**
   * Get categories
   */
  async getCategories() {
    try {
      const cacheKey = 'tenor:categories';
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      const response = await axios.get(`${this.baseUrl}/categories`, {
        params: {
          key: this.apiKey,
        },
      });
      
      const categories = response.data.tags.map(tag => ({
        name: tag.searchterm,
        image: tag.image,
      }));
      
      this.cache.set(cacheKey, categories, 3600); // Cache for 1 hour
      
      return categories;
    } catch (error) {
      logger.error('Tenor categories error:', error.message);
      throw new Error('Failed to get categories');
    }
  }
  
  /**
   * Map Tenor response to unified GIF format
   */
  mapTenorGif(gif) {
    const gifFormat = gif.media_formats?.gif || gif.media_formats?.tinygif;
    const previewFormat = gif.media_formats?.tinygif || gifFormat;
    const thumbnailFormat = gif.media_formats?.nanogif || previewFormat;
    
    return {
      id: gif.id,
      title: gif.title || gif.content_description || '',
      url: gifFormat?.url || '',
      previewUrl: previewFormat?.url || '',
      thumbnailUrl: thumbnailFormat?.url || '',
      width: gifFormat?.dims?.[0] || 0,
      height: gifFormat?.dims?.[1] || 0,
      source: 'TENOR',
    };
  }
}

module.exports = new TenorService();
