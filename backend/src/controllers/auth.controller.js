/**
 * Authentication Controller
 * Handles token verification and session management
 */

const supabase = require('../config/supabase');
const logger = require('../config/logger');
const { StatusCodes } = require('http-status-codes');

class AuthController {
  /**
   * Verify JWT token
   */
  async verifyToken(req, res) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'Token is required',
        });
      }
      
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized',
          message: 'Invalid token',
        });
      }
      
      res.json({
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      logger.error('Verify token error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to verify token',
      });
    }
  }
  
  /**
   * Refresh session
   */
  async refreshSession(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'Refresh token is required',
        });
      }
      
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });
      
      if (error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized',
          message: 'Invalid refresh token',
        });
      }
      
      res.json({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in,
      });
    } catch (error) {
      logger.error('Refresh session error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to refresh session',
      });
    }
  }
  
  /**
   * Sign out user
   */
  async signOut(req, res) {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Sign out error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Internal Server Error',
          message: 'Failed to sign out',
        });
      }
      
      res.json({
        message: 'Successfully signed out',
      });
    } catch (error) {
      logger.error('Sign out error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to sign out',
      });
    }
  }
  
  /**
   * Get current user
   */
  async getCurrentUser(req, res) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', req.userId)
        .single();
      
      if (error) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Not Found',
          message: 'User profile not found',
        });
      }
      
      res.json(data);
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to get user',
      });
    }
  }
}

module.exports = new AuthController();
