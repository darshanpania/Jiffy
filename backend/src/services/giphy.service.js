/**
 * GIPHY Service
 * Integration with GIPHY API for GIF search and retrieval
 */

const axios = require('axios');
const NodeCache = require('node-cache');
const config = require('../config/config');
const logger = require('../config/logger');

class GiphyService {
  constructor() {
    this.apiKey = config.giphy.apiKey;
    this.baseUrl = config.giphy.baseUrl;
    this.cache = new NodeCache({ stdTTL: config.cache.ttl });
    
    if (!this.apiKey) {
      logger.warn('GIPHY API key not configured');
    }
  }
  
  /**
   * Search GIFs
   */
  async search(query, limit = 25, offset = 0) {
    try {
      const cacheKey = `giphy:search:${query}:${limit}:${offset}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        logger.debug('GIPHY search cache hit');
        return cached;
      }
      
      const response = await axios.get(`${this.baseUrl}/gifs/search`, {
        params: {
          api_key: this.apiKey,
          q: query,
          limit,
          offset,
          rating: config.giphy.ratingLimit,
          lang: 'en',
        },
      });
      
      const gifs = response.data.data.map(this.mapGiphyGif);
      
      this.cache.set(cacheKey, gifs);
      logger.info(`GIPHY search: "${query}" - ${gifs.length} results`);
      
      return gifs;
    } catch (error) {
      logger.error('GIPHY search error:', error.message);
      throw new Error('Failed to search GIPHY');
    }
  }
  
  /**
   * Get trending GIFs
   */
  async trending(limit = 25) {
    try {
      const cacheKey = `giphy:trending:${limit}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      const response = await axios.get(`${this.baseUrl}/gifs/trending`, {
        params: {
          api_key: this.apiKey,
          limit,
          rating: config.giphy.ratingLimit,
        },
      });
      
      const gifs = response.data.data.map(this.mapGiphyGif);
      
      this.cache.set(cacheKey, gifs);
      logger.info(`GIPHY trending: ${gifs.length} results`);
      
      return gifs;
    } catch (error) {
      logger.error('GIPHY trending error:', error.message);
      throw new Error('Failed to get trending GIFs');
    }
  }
  
  /**
   * Get GIF categories
   */
  async getCategories() {
    try {
      const cacheKey = 'giphy:categories';
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      const response = await axios.get(`${this.baseUrl}/gifs/categories`, {
        params: {
          api_key: this.apiKey,
        },
      });
      
      const categories = response.data.data.map(cat => ({
        name: cat.name,
        nameEncoded: cat.name_encoded,
      }));
      
      this.cache.set(cacheKey, categories, 3600); // Cache for 1 hour
      
      return categories;
    } catch (error) {
      logger.error('GIPHY categories error:', error.message);
      throw new Error('Failed to get categories');
    }
  }
  
  /**
   * Map GIPHY response to unified GIF format
   */
  mapGiphyGif(gif) {
    return {
      id: gif.id,
      title: gif.title || '',
      url: gif.images.original.url,
      previewUrl: gif.images.downsized?.url || gif.images.original.url,
      thumbnailUrl: gif.images.fixed_width_small?.url || gif.images.original.url,
      width: parseInt(gif.images.original.width, 10),
      height: parseInt(gif.images.original.height, 10),
      source: 'GIPHY',
    };
  }
}

module.exports = new GiphyService();
