const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const rateLimit = require('express-rate-limit');
const gifController = require('../controllers/gif.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');

/**
 * GIF Routes
 * All routes require authentication
 * Stricter rate limiting (10 requests per minute per user)
 */

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Stricter rate limiting for GIF endpoints
const gifRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: {
    error: 'Too Many Requests',
    message: 'GIF API rate limit exceeded. Please try again in a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID for rate limiting if available
  keyGenerator: (req) => req.userId || req.ip,
});

router.use(gifRateLimiter);

/**
 * GET /api/gifs/search
 * Search GIFs across providers
 */
router.get('/search',
  [
    query('q')
      .notEmpty()
      .withMessage('Search query is required')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Query must be 2-100 characters'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be 1-50'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be >= 0'),
    query('provider')
      .optional()
      .isIn(['auto', 'giphy', 'tenor'])
      .withMessage('Provider must be auto, giphy, or tenor'),
    validate,
  ],
  gifController.searchGifs
);

/**
 * GET /api/gifs/trending
 * Get trending GIFs
 */
router.get('/trending',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be 1-50'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be >= 0'),
    query('provider')
      .optional()
      .isIn(['auto', 'giphy', 'tenor'])
      .withMessage('Provider must be auto, giphy, or tenor'),
    validate,
  ],
  gifController.getTrendingGifs
);

/**
 * GET /api/gifs/categories
 * Get GIF categories
 */
router.get('/categories',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be 1-50'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be >= 0'),
    query('provider')
      .optional()
      .isIn(['auto', 'giphy', 'tenor'])
      .withMessage('Provider must be auto, giphy, or tenor'),
    validate,
  ],
  gifController.getCategories
);

/**
 * POST /api/gifs/favorites
 * Save GIF to favorites
 */
router.post('/favorites',
  [
    body('gifId')
      .notEmpty()
      .withMessage('GIF ID is required')
      .isString()
      .withMessage('GIF ID must be string'),
    body('provider')
      .isIn(['giphy', 'tenor'])
      .withMessage('Provider must be giphy or tenor'),
    body('gifUrl')
      .notEmpty()
      .withMessage('GIF URL is required')
      .isURL()
      .withMessage('Invalid GIF URL'),
    body('title')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Title max 200 characters'),
    body('thumbnailUrl')
      .optional()
      .isURL()
      .withMessage('Invalid thumbnail URL'),
    validate,
  ],
  gifController.saveFavorite
);

/**
 * GET /api/gifs/favorites
 * Get user's favorite GIFs
 */
router.get('/favorites',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be 1-100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be >= 0'),
    validate,
  ],
  gifController.getFavorites
);

/**
 * DELETE /api/gifs/favorites/:favoriteId
 * Delete favorite GIF
 */
router.delete('/favorites/:favoriteId',
  [
    param('favoriteId')
      .isUUID()
      .withMessage('Invalid favorite ID'),
    validate,
  ],
  gifController.deleteFavorite
);

/**
 * GET /api/gifs/cache-stats
 * Get cache statistics (for monitoring)
 */
router.get('/cache-stats', gifController.getCacheStats);

module.exports = router;
