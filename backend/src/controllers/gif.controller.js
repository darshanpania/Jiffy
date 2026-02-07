const giphyService = require('../services/giphy.service');
const tenorService = require('../services/tenor.service');
const supabase = require('../config/supabase');
const logger = require('../config/logger');
const { StatusCodes } = require('http-status-codes');

/**
 * GIF Controller
 * Handles GIF search, trending, categories, and favorites
 * Uses GIPHY as primary provider with Tenor as fallback
 */
class GifController {
  /**
   * GET /api/gifs/search
   * Search GIFs across providers with automatic fallback
   */
  async searchGifs(req, res) {
    try {
      const { q: query, limit = 25, offset = 0, provider = 'auto' } = req.query;
      
      logger.debug(`GIF search: "${query}" provider=${provider}`);
      
      let result;
      
      if (provider === 'tenor') {
        // Use Tenor directly
        result = await tenorService.search(query, parseInt(limit), offset);
      } else if (provider === 'giphy') {
        // Use GIPHY directly
        result = await giphyService.search(query, parseInt(limit), parseInt(offset));
      } else {
        // Auto mode: Try GIPHY first, fallback to Tenor
        result = await giphyService.search(query, parseInt(limit), parseInt(offset));
        
        if (!result.success) {
          logger.warn('GIPHY failed, falling back to Tenor');
          result = await tenorService.search(query, parseInt(limit), offset);
        }
      }
      
      if (!result.success) {
        logger.error('All GIF providers failed:', result.error);
        return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
          error: 'Service Unavailable',
          message: 'GIF search service is temporarily unavailable',
        });
      }
      
      logger.info(`GIF search: "${query}" → ${result.data.gifs.length} results (${result.data.provider})`);
      
      res.json({
        ...result.data,
        cached: result.cached || false,
        query,
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
  async getTrendingGifs(req, res) {
    try {
      const { limit = 25, offset = 0, provider = 'auto' } = req.query;
      
      logger.debug(`GIF trending: limit=${limit} provider=${provider}`);
      
      let result;
      
      if (provider === 'tenor') {
        result = await tenorService.trending(parseInt(limit), offset);
      } else if (provider === 'giphy') {
        result = await giphyService.trending(parseInt(limit), parseInt(offset));
      } else {
        // Auto mode: Try GIPHY first
        result = await giphyService.trending(parseInt(limit), parseInt(offset));
        
        if (!result.success) {
          logger.warn('GIPHY failed, falling back to Tenor');
          result = await tenorService.trending(parseInt(limit), offset);
        }
      }
      
      if (!result.success) {
        return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
          error: 'Service Unavailable',
          message: 'GIF trending service is temporarily unavailable',
        });
      }
      
      logger.info(`GIF trending → ${result.data.gifs.length} results (${result.data.provider})`);
      
      res.json({
        ...result.data,
        cached: result.cached || false,
      });
    } catch (error) {
      logger.error('Trending GIFs error:', error);
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
      const { limit = 25, offset = 0, provider = 'auto' } = req.query;
      
      logger.debug(`GIF categories: limit=${limit} provider=${provider}`);
      
      let result;
      
      if (provider === 'tenor') {
        result = await tenorService.getCategories(parseInt(limit), offset);
      } else if (provider === 'giphy') {
        result = await giphyService.getCategories(parseInt(limit), parseInt(offset));
      } else {
        // Auto mode: Try GIPHY first
        result = await giphyService.getCategories(parseInt(limit), parseInt(offset));
        
        if (!result.success) {
          logger.warn('GIPHY failed, falling back to Tenor');
          result = await tenorService.getCategories(parseInt(limit), offset);
        }
      }
      
      if (!result.success) {
        return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
          error: 'Service Unavailable',
          message: 'GIF categories service is temporarily unavailable',
        });
      }
      
      logger.info(`GIF categories → ${result.data.categories.length} results (${result.data.provider})`);
      
      res.json({
        ...result.data,
        cached: result.cached || false,
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
      const { gifId, provider, gifUrl, title, thumbnailUrl } = req.body;
      
      logger.debug(`Saving favorite: ${gifId} (${provider}) for ${userId}`);
      
      // Insert favorite (upsert to prevent duplicates)
      const { data: favorite, error } = await supabase
        .from('gif_favorites')
        .upsert({
          user_id: userId,
          gif_id: gifId,
          provider: provider,
          gif_url: gifUrl,
          title: title || '',
          thumbnail_url: thumbnailUrl,
        }, {
          onConflict: 'user_id,gif_id,provider',
          ignoreDuplicates: false,
        })
        .select()
        .single();
      
      if (error) {
        logger.error('Save favorite error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'Failed to save favorite',
        });
      }
      
      logger.info(`Favorite saved: ${favorite.id}`);
      
      res.status(StatusCodes.CREATED).json({
        message: 'GIF saved to favorites',
        favorite: {
          id: favorite.id,
          gifId: favorite.gif_id,
          provider: favorite.provider,
          gifUrl: favorite.gif_url,
          title: favorite.title,
          thumbnailUrl: favorite.thumbnail_url,
          createdAt: favorite.created_at,
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
      
      logger.debug(`Getting favorites for: ${userId}`);
      
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
      
      logger.info(`Favorites retrieved: ${userId} → ${favorites.length} favorites`);
      
      res.json({
        favorites: favorites.map(fav => ({
          id: fav.id,
          gifId: fav.gif_id,
          provider: fav.provider,
          gifUrl: fav.gif_url,
          title: fav.title,
          thumbnailUrl: fav.thumbnail_url,
          createdAt: fav.created_at,
        })),
        count: favorites.length,
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
   * Remove GIF from user's favorites
   */
  async deleteFavorite(req, res) {
    try {
      const userId = req.userId;
      const { favoriteId } = req.params;
      
      logger.debug(`Deleting favorite: ${favoriteId} for ${userId}`);
      
      // Verify ownership before deleting
      const { data: favorite } = await supabase
        .from('gif_favorites')
        .select('user_id')
        .eq('id', favoriteId)
        .single();
      
      if (!favorite) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Not Found',
          message: 'Favorite not found',
        });
      }
      
      if (favorite.user_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: 'Forbidden',
          message: 'You can only delete your own favorites',
        });
      }
      
      // Delete favorite
      const { error } = await supabase
        .from('gif_favorites')
        .delete()
        .eq('id', favoriteId);
      
      if (error) {
        logger.error('Delete favorite error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      logger.info(`Favorite deleted: ${favoriteId}`);
      
      res.json({
        message: 'Favorite deleted successfully',
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
   * GET /api/gifs/cache-stats
   * Get cache statistics for monitoring (admin only)
   */
  async getCacheStats(req, res) {
    try {
      const giphyStats = giphyService.getCacheStats();
      const tenorStats = tenorService.getCacheStats();
      
      res.json({
        giphy: {
          ...giphyStats,
          hitRate: giphyStats.hits / (giphyStats.hits + giphyStats.misses) || 0,
        },
        tenor: {
          ...tenorStats,
          hitRate: tenorStats.hits / (tenorStats.hits + tenorStats.misses) || 0,
        },
        totalKeys: giphyStats.keys + tenorStats.keys,
      });
    } catch (error) {
      logger.error('Get cache stats error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to get cache stats',
      });
    }
  }
}

module.exports = new GifController();
