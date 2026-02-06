/**
 * Chat Routes
 * Messaging and chat management endpoints
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const chatController = require('../controllers/chat.controller');
const { validate } = require('../middleware/validator.middleware');

// Get user's chats
router.get('/', chatController.getUserChats);

// Get or create direct chat
router.post('/direct',
  [
    body('otherUserId').notEmpty().isUUID(),
    validate,
  ],
  chatController.getOrCreateDirectChat
);

// Create group chat
router.post('/group',
  [
    body('name').notEmpty().isLength({ min: 3, max: 50 }),
    body('memberIds').isArray().notEmpty(),
    body('description').optional().isLength({ max: 200 }),
    validate,
  ],
  chatController.createGroupChat
);

// Get chat messages
router.get('/:chatId/messages',
  [
    param('chatId').isUUID(),
    validate,
  ],
  chatController.getMessages
);

// Send message
router.post('/:chatId/messages',
  [
    param('chatId').isUUID(),
    body('content').notEmpty().isLength({ max: 5000 }),
    body('type').isIn(['TEXT', 'GIF', 'IMAGE']),
    validate,
  ],
  chatController.sendMessage
);

// Mark messages as read
router.post('/:chatId/read',
  [
    param('chatId').isUUID(),
    validate,
  ],
  chatController.markAsRead
);

// Get group members
router.get('/:chatId/members',
  [
    param('chatId').isUUID(),
    validate,
  ],
  chatController.getGroupMembers
);

// Add group member
router.post('/:chatId/members',
  [
    param('chatId').isUUID(),
    body('userId').isUUID(),
    validate,
  ],
  chatController.addGroupMember
);

// Remove group member
router.delete('/:chatId/members/:userId',
  [
    param('chatId').isUUID(),
    param('userId').isUUID(),
    validate,
  ],
  chatController.removeGroupMember
);

module.exports = router;
