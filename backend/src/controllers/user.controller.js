/**
 * User Controller
 * Handles user profile and management operations
 */

const supabase = require('../config/supabase');
const logger = require('../config/logger');
const { StatusCodes } = require('http-status-codes');

class UserController {
  /**
   * Get user profile
   */
  async getProfile(req, res) {
    try {
      const { userId } = req.params;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error || !data) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Not Found',
          message: 'User profile not found',
        });
      }
      
      res.json(data);
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to get profile',
      });
    }
  }
  
  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const { displayName, bio, photoUrl } = req.body;
      const userId = req.userId;
      
      const updates = {};
      if (displayName) updates.display_name = displayName;
      if (bio !== undefined) updates.bio = bio;
      if (photoUrl) updates.photo_url = photoUrl;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        logger.error('Update profile error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      res.json(data);
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to update profile',
      });
    }
  }
  
  /**
   * Search users (PostgreSQL full-text search)
   */
  async searchUsers(req, res) {
    try {
      const { q, limit = 20, offset = 0 } = req.query;
      
      if (!q || q.trim().length < 2) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'Search query must be at least 2 characters',
        });
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, photo_url, bio, is_online')
        .textSearch('search_vector', q, { config: 'english' })
        .range(offset, offset + parseInt(limit) - 1);
      
      if (error) {
        logger.error('Search users error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Internal Server Error',
          message: 'Search failed',
        });
      }
      
      res.json({
        results: data,
        count: data.length,
        offset: parseInt(offset),
        limit: parseInt(limit),
      });
    } catch (error) {
      logger.error('Search users error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to search users',
      });
    }
  }
  
  /**
   * Update online presence
   */
  async updatePresence(req, res) {
    try {
      const { isOnline } = req.body;
      const userId = req.userId;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          is_online: isOnline,
          last_seen: new Date().toISOString(),
        })
        .eq('id', userId);
      
      if (error) {
        logger.error('Update presence error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      res.json({
        message: 'Presence updated',
        isOnline,
      });
    } catch (error) {
      logger.error('Update presence error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to update presence',
      });
    }
  }
  
  /**
   * Get friends list
   */
  async getFriends(req, res) {
    try {
      const userId = req.userId;
      
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          friend_profile:profiles!friendships_friend_id_fkey(
            id, email, display_name, photo_url, bio, is_online, last_seen
          )
        `)
        .eq('user_id', userId);
      
      if (error) {
        logger.error('Get friends error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Internal Server Error',
          message: 'Failed to get friends',
        });
      }
      
      const friends = data.map(f => f.friend_profile);
      
      res.json({
        friends,
        count: friends.length,
      });
    } catch (error) {
      logger.error('Get friends error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to get friends',
      });
    }
  }
  
  /**
   * Update FCM token
   */
  async updateFcmToken(req, res) {
    try {
      const { token, deviceType = 'android' } = req.body;
      const userId = req.userId;
      
      const { error } = await supabase
        .from('user_devices')
        .upsert({
          user_id: userId,
          fcm_token: token,
          device_type: deviceType,
          updated_at: new Date().toISOString(),
        });
      
      if (error) {
        logger.error('Update FCM token error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      logger.info(`FCM token updated for user ${userId}`);
      
      res.json({
        message: 'FCM token updated successfully',
      });
    } catch (error) {
      logger.error('Update FCM token error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to update FCM token',
      });
    }
  }
}

module.exports = new UserController();
