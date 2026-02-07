const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');

/**
 * User Routes
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/users/profile/:userId
 * Get user profile by ID
 */
router.get('/profile/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID format'),
    validate,
  ],
  userController.getProfile
);

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
router.put('/profile',
  [
    body('displayName')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Display name must be 3-30 characters')
      .matches(/^[a-zA-Z0-9\s\-\_\.]+$/)
      .withMessage('Display name can only contain letters, numbers, spaces, hyphens, underscores, and dots'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 150 })
      .withMessage('Bio must be max 150 characters'),
    body('photoUrl')
      .optional()
      .isURL()
      .withMessage('Invalid photo URL format'),
    body('phoneNumber')
      .optional()
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Invalid phone number format (E.164 format required)'),
    validate,
  ],
  userController.updateProfile
);

/**
 * GET /api/users/search
 * Search users using full-text search
 */
router.get('/search',
  [
    query('q')
      .notEmpty()
      .withMessage('Search query is required')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search query must be 2-100 characters'),
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
  userController.searchUsers
);

/**
 * POST /api/users/presence
 * Update user's online/offline status
 */
router.post('/presence',
  [
    body('isOnline')
      .isBoolean()
      .withMessage('isOnline must be a boolean'),
    validate,
  ],
  userController.updatePresence
);

/**
 * GET /api/users/friends
 * Get user's friends list
 */
router.get('/friends',
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
  userController.getFriends
);

/**
 * POST /api/users/fcm-token
 * Update or register FCM token
 */
router.post('/fcm-token',
  [
    body('fcmToken')
      .notEmpty()
      .withMessage('FCM token is required')
      .isString()
      .withMessage('FCM token must be a string')
      .isLength({ min: 10, max: 500 })
      .withMessage('FCM token length invalid'),
    body('deviceType')
      .optional()
      .isIn(['android', 'ios', 'web'])
      .withMessage('Device type must be android, ios, or web'),
    body('notificationEnabled')
      .optional()
      .isBoolean()
      .withMessage('notificationEnabled must be a boolean'),
    validate,
  ],
  userController.updateFcmToken
);

/**
 * GET /api/users/me
 * Get current authenticated user's profile
 */
router.get('/me', userController.getCurrentUser);

module.exports = router;
