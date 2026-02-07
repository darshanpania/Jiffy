const giphyService = require('../services/giphy.service');
const tenorService = require('../services/tenor.service');
const supabase = require('../config/supabase');
const logger = require('../config/logger');
const { StatusCodes } = require('http-status-codes');

/**
 * GIF Controller
 * Handles GIF search, trending, categories, and favorites
 * Integrates GIPHY and Tenor with automatic fallback
 */
class GifController {
  /**
   * GET /api/gifs/search
   * Search GIFs with automatic fallback (GIPHY → Tenor)
   */
  async searchGifs(req, res) {
    try {
      const { q: query, limit = 25, offset = 0, rating = 'g', provider } = req.query;
      
      logger.debug(`GIF search: "${query}" (limit: ${limit}, offset: ${offset})`);
      
      let result;
      let primaryError = null;
      
      // Try specified provider or GIPHY first
      if (!provider || provider === 'giphy') {
        try {
          if (giphyService.isConfigured()) {
            result = await giphyService.search(query, parseInt(limit), parseInt(offset), rating);
            
            if (result.data && result.data.length > 0) {
              return res.json({
                gifs: result.data,
                count: result.data.length,
                query,
                limit: parseInt(limit),
                offset: parseInt(offset),
                source: result.source,
                cached: result.cached,
              });
            }
          } else {
            logger.debug('GIPHY not configured, trying Tenor');
          }
        } catch (error) {
          logger.warn('GIPHY search failed, trying fallback:', error.message);
          primaryError = error;
        }
      }
      
      // Fallback to Tenor if GIPHY failed or not configured
      if (!provider || provider === 'tenor' || primaryError) {
        try {
          if (tenorService.isConfigured()) {
            const contentFilter = rating === 'g' ? 'high' : 'medium';
            result = await tenorService.search(query, parseInt(limit), parseInt(offset), contentFilter);
            
            return res.json({
              gifs: result.data,
              count: result.data.length,
              query,
              limit: parseInt(limit),
              offset: parseInt(offset),
              source: result.source,
              cached: result.cached,
              fallback: !!primaryError,
            });
          } else {
            logger.error('Tenor not configured either');
          }
        } catch (error) {
          logger.error('Tenor search also failed:', error.message);
          
          return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
            error: 'Service Unavailable',
            message: 'GIF search is temporarily unavailable',
            details: 'Both GIPHY and Tenor services failed',
          });
        }
      }
      
      // If we get here, no provider is configured
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        error: 'Service Unavailable',
        message: 'GIF service not configured',
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
   * GET /api/gifs/trending
   * Get trending GIFs with automatic fallback
   */
  async getTrending(req, res) {
    try {
      const { limit = 25, offset = 0, rating = 'g', provider } = req.query;
      
      logger.debug(`GIF trending request (limit: ${limit})`);
      
      let result;
      let primaryError = null;
      
      // Try GIPHY first
      if (!provider || provider === 'giphy') {
        try {
          if (giphyService.isConfigured()) {
            result = await giphyService.trending(parseInt(limit), parseInt(offset), rating);
            
            return res.json({
              gifs: result.data,
              count: result.data.length,
              limit: parseInt(limit),
              offset: parseInt(offset),
              source: result.source,
              cached: result.cached,
            });
          }
        } catch (error) {
          logger.warn('GIPHY trending failed, trying fallback:', error.message);
          primaryError = error;
        }
      }
      
      // Fallback to Tenor
      if (!provider || provider === 'tenor' || primaryError) {
        try {
          if (tenorService.isConfigured()) {
            const contentFilter = rating === 'g' ? 'high' : 'medium';
            result = await tenorService.trending(parseInt(limit), parseInt(offset), contentFilter);
            
            return res.json({
              gifs: result.data,
              count: result.data.length,
              limit: parseInt(limit),
              offset: parseInt(offset),
              source: result.source,
              cached: result.cached,
              fallback: !!primaryError,
            });
          }
        } catch (error) {
          logger.error('Tenor trending also failed:', error.message);
          
          return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
            error: 'Service Unavailable',
            message: 'Trending GIFs unavailable',
          });
        }
      }
      
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        error: 'Service Unavailable',
        message: 'GIF service not configured',
      });
    } catch (error) {
      logger.error('Get trending error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to get trending GIFs',
      });
    }
  }
  
  /**
   * GET /api/gifs/categories
   * Get GIF categories with automatic fallback
   */
  async getCategories(req, res) {
    try {
      const { provider } = req.query;
      
      logger.debug('GIF categories request');
      
      let result;
      
      // Try Tenor first (has better categories API)
      if (!provider || provider === 'tenor') {
        try {
          if (tenorService.isConfigured()) {
            result = await tenorService.categories();
            
            return res.json({
              categories: result.data,
              count: result.data.length,
              source: result.source,
              cached: result.cached,
            });
          }
        } catch (error) {
          logger.warn('Tenor categories failed, trying GIPHY:', error.message);
        }
      }
      
      // Fallback to GIPHY
      try {
        if (giphyService.isConfigured()) {
          result = await giphyService.categories();
          
          return res.json({
            categories: result.data,
            count: result.data.length,
            source: result.source,
            cached: result.cached,
          });
        }
      } catch (error) {
        logger.error('GIPHY categories also failed:', error.message);
      }
      
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        error: 'Service Unavailable',
        message: 'Categories unavailable',
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
   * POST /api/gifs/favorites
   * Save GIF to user's favorites
   */
  async saveFavorite(req, res) {
    try {
      const userId = req.userId;
      const { gifId, gifUrl, title, source, previewUrl } = req.body;
      
      logger.debug(`Saving favorite: ${gifId} for user ${userId}`);
      
      const { data: favorite, error } = await supabase
        .from('gif_favorites')
        .insert({
          user_id: userId,
          gif_id: gifId,
          gif_url: gifUrl,
          title: title || '',
          source: source || 'giphy',
          preview_url: previewUrl || gifUrl,
        })
        .select()
        .single();
      
      if (error) {
        // Check for duplicate
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
      
      logger.info(`Favorite saved: ${favorite.id}`);
      
      res.status(StatusCodes.CREATED).json({
        message: 'GIF added to favorites',
        favorite: {
          id: favorite.id,
          gif_id: favorite.gif_id,
          gif_url: favorite.gif_url,
          title: favorite.title,
          source: favorite.source,
          preview_url: favorite.preview_url,
          created_at: favorite.created_at,
        },
      });
    } catch (error) {
      logger.error('Save favorite error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to save favorite',
      });
    }
  }
  
  /**
   * GET /api/gifs/favorites
   * Get user's favorite GIFs
   */
  async getFavorites(req, res) {
    try {
      const userId = req.userId;
      const { limit = 50, offset = 0 } = req.query;
      
      logger.debug(`Getting favorites for user: ${userId}`);
      
      const { data: favorites, error, count } = await supabase
        .from('gif_favorites')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
      
      if (error) {
        logger.error('Get favorites error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Internal Server Error',
          message: 'Failed to get favorites',
        });
      }
      
      logger.info(`Favorites retrieved: ${userId} → ${favorites?.length || 0} GIFs`);
      
      res.json({
        favorites: favorites || [],
        count: favorites?.length || 0,
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
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
   * DELETE /api/gifs/favorites/:favoriteId
   * Remove GIF from favorites
   */
  async deleteFavorite(req, res) {
    try {
      const userId = req.userId;
      const { favoriteId } = req.params;
      
      logger.debug(`Deleting favorite: ${favoriteId} for user ${userId}`);
      
      // Delete only if belongs to user
      const { error } = await supabase
        .from('gif_favorites')
        .delete()
        .eq('id', favoriteId)
        .eq('user_id', userId);
      
      if (error) {
        logger.error('Delete favorite error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      logger.info(`Favorite deleted: ${favoriteId}`);
      
      res.json({
        message: 'Favorite removed successfully',
        favoriteId,
      });
    } catch (error) {
      logger.error('Delete favorite error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to delete favorite',
      });
    }
  }
  
  /**
   * GET /api/gifs/stats
   * Get cache statistics (admin/debug endpoint)
   */
  async getStats(req, res) {
    try {
      const giphyStats = giphyService.getCacheStats();
      const tenorStats = tenorService.getCacheStats();
      
      res.json({
        giphy: {
          configured: giphyService.isConfigured(),
          cache: giphyStats,
        },
        tenor: {
          configured: tenorService.isConfigured(),
          cache: tenorStats,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get stats error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to get stats',
      });
    }
  }
  
  /**
   * POST /api/gifs/cache/clear
   * Clear GIF cache (admin endpoint)
   */
  async clearCache(req, res) {
    try {
      giphyService.clearCache();
      tenorService.clearCache();
      
      logger.info('GIF cache cleared by admin');
      
      res.json({
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Clear cache error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to clear cache',
      });
    }
  }
}

module.exports = new GifController();
