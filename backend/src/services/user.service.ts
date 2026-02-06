import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

interface CreateProfileData {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  bio?: string;
}

interface UpdateProfileData {
  displayName?: string;
  photoUrl?: string;
  bio?: string;
  phoneNumber?: string;
}

export class UserService {
  /**
   * Create user profile in Supabase
   */
  async createProfile(data: CreateProfileData) {
    try {
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: data.id,
          email: data.email,
          display_name: data.displayName,
          photo_url: data.photoUrl,
          bio: data.bio,
        })
        .select()
        .single();

      if (error) {
        logger.error('Profile creation failed:', error);
        throw new AppError('Failed to create profile', 500);
      }

      logger.info(`Profile created for user: ${data.id}`);
      return profile;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        throw new AppError('Profile not found', 404);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: UpdateProfileData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({
          display_name: updates.displayName,
          photo_url: updates.photoUrl,
          bio: updates.bio,
          phone_number: updates.phoneNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new AppError('Failed to update profile', 500);
      }

      logger.info(`Profile updated for user: ${userId}`);
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search users by display name or email
   */
  async searchUsers(query: string, limit: number = 20) {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, email, display_name, photo_url, bio, is_online')
        .textSearch('search_vector', query, {
          type: 'websearch',
          config: 'english',
        })
        .limit(limit);

      if (error) {
        throw new AppError('User search failed', 500);
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user online status
   */
  async updateOnlineStatus(userId: string, isOnline: boolean) {
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          is_online: isOnline,
          last_seen: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        logger.error('Failed to update online status:', error);
      }
    } catch (error) {
      logger.error('Update online status error:', error);
    }
  }

  /**
   * Get user's friends
   */
  async getFriends(userId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('friendships')
        .select(`
          friend_id,
          profiles!friendships_friend_id_fkey (
            id,
            email,
            display_name,
            photo_url,
            bio,
            is_online,
            last_seen
          )
        `)
        .eq('user_id', userId);

      if (error) {
        throw new AppError('Failed to fetch friends', 500);
      }

      return data?.map(item => item.profiles) || [];
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();