/**
 * GIF Controller
 * Handles GIPHY and Tenor API integration
 */

const GiphyService = require('../services/giphy.service');
const TenorService = require('../services/tenor.service');
const supabase = require('../config/supabase');
const logger = require('../config/logger');
const { StatusCodes } = require('http-status-codes');

class GifController {
  /**
   * Search GIFs from GIPHY or Tenor
   */
  async searchGifs(req, res) {
    try {
      const { q, source = 'giphy', limit = 25, offset = 0 } = req.query;
      
      let results;
      
      if (source === 'giphy') {
        results = await GiphyService.search(q, limit, offset);
      } else if (source === 'tenor') {
        results = await TenorService.search(q, limit, offset);
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'Invalid source. Use "giphy" or "tenor"',
        });
      }
      
      res.json({
        results,
        count: results.length,
        source,
        query: q,
      });
    } catch (error) {
      logger.error('Search GIFs error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to search GIFs',
      });
    }
  }
  
  /**
   * Get trending GIFs
   */
  async getTrendingGifs(req, res) {
    try {
      const { source = 'giphy', limit = 25 } = req.query;
      
      let results;
      
      if (source === 'giphy') {
        results = await GiphyService.trending(limit);
      } else if (source === 'tenor') {
        results = await TenorService.featured(limit);
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'Invalid source. Use "giphy" or "tenor"',
        });
      }
      
      res.json({
        results,
        count: results.length,
        source,
      });
    } catch (error) {
      logger.error('Get trending GIFs error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to get trending GIFs',
      });
    }
  }
  
  /**
   * Get GIF categories
   */
  async getCategories(req, res) {
    try {
      const { source = 'giphy' } = req.query;
      
      let categories;
      
      if (source === 'giphy') {
        categories = await GiphyService.getCategories();
      } else if (source === 'tenor') {
        categories = await TenorService.getCategories();
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'Invalid source',
        });
      }
      
      res.json({
        categories,
        source,
      });
    } catch (error) {
      logger.error('Get categories error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to get categories',
      });
    }
  }
  
  /**
   * Save favorite GIF to Supabase
   */
  async saveFavorite(req, res) {
    try {
      const { gifId, gifUrl, source, title, thumbnailUrl } = req.body;
      const userId = req.userId;
      
      const { data, error } = await supabase
        .from('favorite_gifs')
        .insert({
          user_id: userId,
          gif_id: gifId,
          gif_url: gifUrl,
          gif_source: source.toUpperCase(),
          title,
          thumbnail_url: thumbnailUrl,
        })
        .select()
        .single();
      
      if (error) {
        // Handle duplicate
        if (error.code === '23505') {
          return res.status(StatusCodes.CONFLICT).json({
            error: 'Conflict',
            message: 'GIF already in favorites',
          });
        }
        
        logger.error('Save favorite error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      res.status(StatusCodes.CREATED).json(data);
    } catch (error) {
      logger.error('Save favorite error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to save favorite',
      });
    }
  }
  
  /**
   * Get user's favorite GIFs
   */
  async getFavorites(req, res) {
    try {
      const userId = req.userId;
      const { limit = 50, offset = 0 } = req.query;
      
      const { data, error } = await supabase
        .from('favorite_gifs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);
      
      if (error) {
        logger.error('Get favorites error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Internal Server Error',
          message: 'Failed to get favorites',
        });
      }
      
      res.json({
        favorites: data,
        count: data.length,
      });
    } catch (error) {
      logger.error('Get favorites error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to get favorites',
      });
    }
  }
  
  /**
   * Remove favorite GIF
   */
  async removeFavorite(req, res) {
    try {
      const { favoriteId } = req.params;
      const userId = req.userId;
      
      const { error } = await supabase
        .from('favorite_gifs')
        .delete()
        .eq('id', favoriteId)
        .eq('user_id', userId); // Ensure user owns the favorite
      
      if (error) {
        logger.error('Remove favorite error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      res.json({
        message: 'Favorite removed',
      });
    } catch (error) {
      logger.error('Remove favorite error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to remove favorite',
      });
    }
  }
}

module.exports = new GifController();
