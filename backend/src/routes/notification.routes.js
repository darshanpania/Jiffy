/**
 * Notification Routes
 * FCM push notification endpoints
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const notificationController = require('../controllers/notification.controller');
const { validate } = require('../middleware/validator.middleware');

// Send notification to user
router.post('/send',
  [
    body('userId').notEmpty().isUUID(),
    body('title').notEmpty(),
    body('body').notEmpty(),
    body('data').optional().isObject(),
    validate,
  ],
  notificationController.sendToUser
);

// Send notification to multiple users
router.post('/send-multi',
  [
    body('userIds').isArray().notEmpty(),
    body('title').notEmpty(),
    body('body').notEmpty(),
    body('data').optional().isObject(),
    validate,
  ],
  notificationController.sendToMultiple
);

// Test notification (development only)
if (process.env.NODE_ENV === 'development') {
  router.post('/test', notificationController.sendTestNotification);
}

module.exports = router;
