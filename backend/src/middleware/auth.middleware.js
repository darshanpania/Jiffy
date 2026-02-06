/**
 * Authentication Middleware
 * Validates Supabase JWT tokens
 */

const supabase = require('../config/supabase');
const logger = require('../config/logger');
const { StatusCodes } = require('http-status-codes');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      logger.warn('Invalid token attempt:', error?.message);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }
    
    // Attach user to request
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
};

module.exports = authMiddleware;
