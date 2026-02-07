const supabase = require('../config/supabase');
const logger = require('../config/logger');
const { StatusCodes } = require('http-status-codes');

/**
 * User Controller
 * Handles all user management operations including profiles,
 * search, presence, and friends management
 */
class UserController {
  /**
   * GET /api/users/profile/:userId
   * Get user profile by ID
   */
  async getProfile(req, res) {
    try {
      const { userId } = req.params;
      
      logger.debug(`Getting profile for user: ${userId}`);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          display_name,
          photo_url,
          bio,
          phone_number,
          is_online,
          last_seen,
          created_at,
          updated_at
        `)
        .eq('id', userId)
        .single();
      
      if (error || !profile) {
        logger.warn(`Profile not found: ${userId}`);
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Not Found',
          message: 'User profile not found',
        });
      }
      
      logger.info(`Profile retrieved: ${userId}`);
      res.json(profile);
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to get profile',
      });
    }
  }
  
  /**
   * PUT /api/users/profile
   * Update current user's profile
   */
  async updateProfile(req, res) {
    try {
      const userId = req.userId;
      const { displayName, bio, photoUrl, phoneNumber } = req.body;
      
      logger.debug(`Updating profile for user: ${userId}`);
      
      // Build update object (only include provided fields)
      const updates = {
        updated_at: new Date().toISOString(),
      };
      
      if (displayName !== undefined) updates.display_name = displayName;
      if (bio !== undefined) updates.bio = bio;
      if (photoUrl !== undefined) updates.photo_url = photoUrl;
      if (phoneNumber !== undefined) updates.phone_number = phoneNumber;
      
      const { data: profile, error } = await supabase
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
      
      logger.info(`Profile updated: ${userId}`, { updates: Object.keys(updates) });
      
      res.json({
        message: 'Profile updated successfully',
        profile: {
          id: profile.id,
          email: profile.email,
          display_name: profile.display_name,
          photo_url: profile.photo_url,
          bio: profile.bio,
          phone_number: profile.phone_number,
          updated_at: profile.updated_at,
        },
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to update profile',
      });
    }
  }
  
  /**
   * GET /api/users/search
   * Search users using PostgreSQL full-text search
   */
  async searchUsers(req, res) {
    try {
      const { q: query, limit = 20, offset = 0 } = req.query;
      const currentUserId = req.userId;
      
      logger.debug(`User search: "${query}" by ${currentUserId}`);
      
      // Use PostgreSQL full-text search on search_vector
      // The search_vector column should be automatically updated by trigger
      const { data: users, error, count } = await supabase
        .from('profiles')
        .select('id, email, display_name, photo_url, bio, is_online, last_seen', { count: 'exact' })
        .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
        .neq('id', currentUserId) // Exclude current user
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
        .order('display_name', { ascending: true });
      
      if (error) {
        logger.error('User search error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Internal Server Error',
          message: 'Search failed',
        });
      }
      
      logger.info(`User search: "${query}" → ${users.length} results`);
      
      res.json({
        results: users,
        count: users.length,
        total: count,
        offset: parseInt(offset),
        limit: parseInt(limit),
        query,
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
   * POST /api/users/presence
   * Update user's online/offline status and last seen
   */
  async updatePresence(req, res) {
    try {
      const userId = req.userId;
      const { isOnline } = req.body;
      
      logger.debug(`Updating presence for user: ${userId} → ${isOnline ? 'online' : 'offline'}`);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          is_online: isOnline,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      
      if (error) {
        logger.error('Update presence error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      logger.info(`Presence updated: ${userId} → ${isOnline ? 'online' : 'offline'}`);
      
      res.json({
        message: 'Presence updated',
        isOnline,
        lastSeen: new Date().toISOString(),
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
   * GET /api/users/friends
   * Get user's friends list with profile data
   */
  async getFriends(req, res) {
    try {
      const userId = req.userId;
      const { limit = 100, offset = 0 } = req.query;
      
      logger.debug(`Getting friends for user: ${userId}`);
      
      // Get friendships with joined profile data
      const { data: friendships, error, count } = await supabase
        .from('friendships')
        .select(`
          id,
          created_at,
          friend:profiles!friendships_friend_id_fkey(
            id,
            email,
            display_name,
            photo_url,
            bio,
            is_online,
            last_seen
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error('Get friends error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Internal Server Error',
          message: 'Failed to get friends',
        });
      }
      
      // Extract friend profiles and sort by name
      const friends = friendships
        .map(f => f.friend)
        .filter(f => f !== null) // Filter out any null results
        .sort((a, b) => a.display_name.localeCompare(b.display_name));
      
      logger.info(`Friends retrieved: ${userId} → ${friends.length} friends`);
      
      res.json({
        friends,
        count: friends.length,
        total: count,
        offset: parseInt(offset),
        limit: parseInt(limit),
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
   * POST /api/users/fcm-token
   * Update or register FCM token for current user
   */
  async updateFcmToken(req, res) {
    try {
      const userId = req.userId;
      const { fcmToken, deviceType = 'android', notificationEnabled = true } = req.body;
      
      logger.debug(`Updating FCM token for user: ${userId}`);
      
      // Upsert FCM token in user_devices table
      const { data, error } = await supabase
        .from('user_devices')
        .upsert({
          user_id: userId,
          fcm_token: fcmToken,
          device_type: deviceType,
          notification_enabled: notificationEnabled,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,fcm_token',
          ignoreDuplicates: false,
        })
        .select()
        .single();
      
      if (error) {
        logger.error('Update FCM token error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'Failed to update FCM token',
        });
      }
      
      logger.info(`FCM token updated: ${userId}`, {
        deviceType,
        notificationEnabled,
      });
      
      res.json({
        message: 'FCM token updated successfully',
        deviceType,
        notificationEnabled,
        updatedAt: data.updated_at,
      });
    } catch (error) {
      logger.error('Update FCM token error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to update FCM token',
      });
    }
  }
  
  /**
   * GET /api/users/me
   * Get current authenticated user's full profile
   * (Alias to auth/me but placed here for consistency)
   */
  async getCurrentUser(req, res) {
    try {
      const userId = req.userId;
      
      logger.debug(`Getting current user: ${userId}`);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error || !profile) {
        logger.error('Get current user error:', error);
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Not Found',
          message: 'User profile not found',
        });
      }
      
      res.json({
        id: profile.id,
        email: profile.email,
        displayName: profile.display_name,
        photoUrl: profile.photo_url,
        bio: profile.bio,
        phoneNumber: profile.phone_number,
        isOnline: profile.is_online,
        lastSeen: profile.last_seen,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to get user profile',
      });
    }
  }
}

module.exports = new UserController();
