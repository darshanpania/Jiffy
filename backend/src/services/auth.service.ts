import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export class AuthService {
  /**
   * Verify user authentication with Supabase
   */
  async verifyToken(token: string) {
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        throw new AppError('Invalid authentication token', 401);
      }

      return user;
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw new AppError('Authentication failed', 401);
    }
  }

  /**
   * Get user session
   */
  async getSession(accessToken: string) {
    try {
      const { data, error } = await supabaseAdmin.auth.getUser(accessToken);

      if (error) {
        throw new AppError('Session retrieval failed', 401);
      }

      return data;
    } catch (error) {
      logger.error('Get session failed:', error);
      throw error;
    }
  }

  /**
   * Sign out user (revoke tokens)
   */
  async signOut(userId: string) {
    try {
      const { error } = await supabaseAdmin.auth.admin.signOut(userId);

      if (error) {
        throw new AppError('Sign out failed', 500);
      }

      logger.info(`User ${userId} signed out`);
      return { success: true };
    } catch (error) {
      logger.error('Sign out failed:', error);
      throw error;
    }
  }
}

export default new AuthService();