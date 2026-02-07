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
 * Stricter rate limiting (10 requests/min per user)
 */

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Stricter rate limiting for GIF endpoints (API quota management)
const gifRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: {
    error: 'Too Many Requests',
    message: 'GIF API rate limit exceeded. Please wait before making more requests.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID from auth for per-user limiting
  keyGenerator: (req) => {
    return req.userId || req.ip;
  },
});

// Apply stricter rate limiting to search and trending (external API calls)
router.use('/search', gifRateLimiter);
router.use('/trending', gifRateLimiter);

/**
 * GET /api/gifs/search
 * Search GIFs using GIPHY or Tenor
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
    query('rating')
      .optional()
      .isIn(['g', 'pg', 'pg-13', 'r'])
      .withMessage('Rating must be g, pg, pg-13, or r'),
    query('provider')
      .optional()
      .isIn(['giphy', 'tenor'])
      .withMessage('Provider must be giphy or tenor'),
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
    query('rating')
      .optional()
      .isIn(['g', 'pg', 'pg-13', 'r'])
      .withMessage('Rating must be g, pg, pg-13, or r'),
    query('provider')
      .optional()
      .isIn(['giphy', 'tenor'])
      .withMessage('Provider must be giphy or tenor'),
    validate,
  ],
  gifController.getTrending
);

/**
 * GET /api/gifs/categories
 * Get GIF categories
 */
router.get('/categories',
  [
    query('provider')
      .optional()
      .isIn(['giphy', 'tenor'])
      .withMessage('Provider must be giphy or tenor'),
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
    body('gifUrl')
      .notEmpty()
      .withMessage('GIF URL is required')
      .isURL()
      .withMessage('Invalid GIF URL format'),
    body('title')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Title max 200 characters'),
    body('source')
      .optional()
      .isIn(['giphy', 'tenor'])
      .withMessage('Source must be giphy or tenor'),
    body('previewUrl')
      .optional()
      .isURL()
      .withMessage('Invalid preview URL'),
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
 * Remove GIF from favorites
 */
router.delete('/favorites/:favoriteId',
  [
    param('favoriteId')
      .isUUID()
      .withMessage('Invalid favorite ID format'),
    validate,
  ],
  gifController.deleteFavorite
);

/**
 * GET /api/gifs/stats
 * Get cache statistics (debug/monitoring)
 */
router.get('/stats', gifController.getStats);

/**
 * POST /api/gifs/cache/clear
 * Clear GIF cache (admin only)
 */
router.post('/cache/clear', gifController.clearCache);

module.exports = router;
