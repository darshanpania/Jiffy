/**
 * GIF Routes
 * GIPHY and Tenor API integration endpoints
 */

const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const gifController = require('../controllers/gif.controller');
const { validate } = require('../middleware/validator.middleware');

// Search GIFs (supports both GIPHY and Tenor)
router.get('/search',
  [
    query('q').notEmpty().trim(),
    query('source').optional().isIn(['giphy', 'tenor']),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('offset').optional().isInt({ min: 0 }),
    validate,
  ],
  gifController.searchGifs
);

// Get trending GIFs
router.get('/trending',
  [
    query('source').optional().isIn(['giphy', 'tenor']),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    validate,
  ],
  gifController.getTrendingGifs
);

// Get GIF categories
router.get('/categories',
  [
    query('source').optional().isIn(['giphy', 'tenor']),
    validate,
  ],
  gifController.getCategories
);

// Save favorite GIF
router.post('/favorites',
  [
    query('gifId').notEmpty(),
    query('gifUrl').notEmpty().isURL(),
    query('source').isIn(['giphy', 'tenor']),
    validate,
  ],
  gifController.saveFavorite
);

// Get user's favorite GIFs
router.get('/favorites', gifController.getFavorites);

// Remove favorite GIF
router.delete('/favorites/:favoriteId', gifController.removeFavorite);

module.exports = router;
