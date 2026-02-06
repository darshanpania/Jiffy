/**
 * User Routes
 * User profile and management endpoints
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { validate } = require('../middleware/validator.middleware');

// Get user profile
router.get('/profile/:userId', userController.getProfile);

// Update user profile
router.put('/profile',
  [
    body('displayName').optional().isLength({ min: 3, max: 30 }),
    body('bio').optional().isLength({ max: 150 }),
    validate,
  ],
  userController.updateProfile
);

// Search users
router.get('/search', userController.searchUsers);

// Update online status
router.post('/presence',
  [
    body('isOnline').isBoolean(),
    validate,
  ],
  userController.updatePresence
);

// Get friends list
router.get('/friends', userController.getFriends);

// Update FCM token
router.post('/fcm-token',
  [
    body('token').notEmpty(),
    body('deviceType').optional().isIn(['android', 'ios']),
    validate,
  ],
  userController.updateFcmToken
);

module.exports = router;
