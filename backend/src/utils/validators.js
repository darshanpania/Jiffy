/**
 * Custom Validators
 * Reusable validation functions
 */

const { body, query, param } = require('express-validator');

class Validators {
  // User validation
  static updateProfile() {
    return [
      body('displayName')
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Display name must be 3-30 characters'),
      body('bio')
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage('Bio must be max 150 characters'),
      body('photoUrl')
        .optional()
        .isURL()
        .withMessage('Invalid photo URL'),
    ];
  }
  
  // Chat validation
  static sendMessage() {
    return [
      param('chatId').isUUID().withMessage('Invalid chat ID'),
      body('content')
        .notEmpty()
        .withMessage('Message content is required')
        .isLength({ max: 5000 })
        .withMessage('Message too long (max 5000 characters)'),
      body('type')
        .isIn(['TEXT', 'GIF', 'IMAGE'])
        .withMessage('Invalid message type'),
    ];
  }
  
  // GIF search validation
  static searchGifs() {
    return [
      query('q')
        .notEmpty()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Search query must be at least 2 characters'),
      query('source')
        .optional()
        .isIn(['giphy', 'tenor'])
        .withMessage('Source must be giphy or tenor'),
      query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be 1-50'),
    ];
  }
  
  // Group chat validation
  static createGroup() {
    return [
      body('name')
        .notEmpty()
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Group name must be 3-50 characters'),
      body('memberIds')
        .isArray({ min: 1, max: 100 })
        .withMessage('Group must have 1-100 members'),
      body('memberIds.*')
        .isUUID()
        .withMessage('Invalid member ID'),
    ];
  }
}

module.exports = Validators;
