const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const chatController = require('../controllers/chat.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');

/**
 * Chat Routes
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/chats
 * Get all chats for current user
 */
router.get('/', chatController.getUserChats);

/**
 * POST /api/chats/direct
 * Get or create direct chat with another user
 */
router.post('/direct',
  [
    body('otherUserId')
      .notEmpty()
      .withMessage('Other user ID is required')
      .isUUID()
      .withMessage('Invalid user ID format'),
    validate,
  ],
  chatController.getOrCreateDirectChat
);

/**
 * POST /api/chats/group
 * Create new group chat
 */
router.post('/group',
  [
    body('name')
      .notEmpty()
      .withMessage('Group name is required')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Group name must be 3-50 characters'),
    body('memberIds')
      .isArray({ min: 1, max: 100 })
      .withMessage('Member IDs must be array of 1-100 users'),
    body('memberIds.*')
      .isUUID()
      .withMessage('Each member ID must be valid UUID'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Description max 200 characters'),
    body('photoUrl')
      .optional()
      .isURL()
      .withMessage('Invalid photo URL'),
    validate,
  ],
  chatController.createGroupChat
);

/**
 * GET /api/chats/:chatId/info
 * Get chat details
 */
router.get('/:chatId/info',
  [
    param('chatId').isUUID().withMessage('Invalid chat ID'),
    validate,
  ],
  chatController.getChatInfo
);

/**
 * PUT /api/chats/:chatId
 * Update chat metadata (groups only)
 */
router.put('/:chatId',
  [
    param('chatId').isUUID().withMessage('Invalid chat ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Group name must be 3-50 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Description max 200 characters'),
    body('photoUrl')
      .optional()
      .isURL()
      .withMessage('Invalid photo URL'),
    validate,
  ],
  chatController.updateChat
);

/**
 * GET /api/chats/:chatId/messages
 * Get messages in chat
 */
router.get('/:chatId/messages',
  [
    param('chatId').isUUID().withMessage('Invalid chat ID'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be 1-100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be >= 0'),
    query('before')
      .optional()
      .isISO8601()
      .withMessage('Before must be valid ISO 8601 timestamp'),
    validate,
  ],
  chatController.getMessages
);

/**
 * POST /api/chats/:chatId/messages
 * Send message in chat
 */
router.post('/:chatId/messages',
  [
    param('chatId').isUUID().withMessage('Invalid chat ID'),
    body('content')
      .notEmpty()
      .withMessage('Message content is required')
      .isString()
      .withMessage('Content must be string')
      .isLength({ min: 1, max: 5000 })
      .withMessage('Content must be 1-5000 characters'),
    body('type')
      .optional()
      .isIn(['TEXT', 'GIF', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE'])
      .withMessage('Invalid message type'),
    body('replyTo')
      .optional()
      .isUUID()
      .withMessage('Reply to must be valid message ID'),
    validate,
  ],
  chatController.sendMessage
);

/**
 * PUT /api/chats/:chatId/messages/:messageId
 * Edit message
 */
router.put('/:chatId/messages/:messageId',
  [
    param('chatId').isUUID().withMessage('Invalid chat ID'),
    param('messageId').isUUID().withMessage('Invalid message ID'),
    body('content')
      .notEmpty()
      .withMessage('Message content is required')
      .isLength({ min: 1, max: 5000 })
      .withMessage('Content must be 1-5000 characters'),
    validate,
  ],
  chatController.editMessage
);

/**
 * DELETE /api/chats/:chatId/messages/:messageId
 * Delete message
 */
router.delete('/:chatId/messages/:messageId',
  [
    param('chatId').isUUID().withMessage('Invalid chat ID'),
    param('messageId').isUUID().withMessage('Invalid message ID'),
    validate,
  ],
  chatController.deleteMessage
);

/**
 * POST /api/chats/:chatId/read
 * Mark all messages as read
 */
router.post('/:chatId/read',
  [
    param('chatId').isUUID().withMessage('Invalid chat ID'),
    validate,
  ],
  chatController.markAsRead
);

/**
 * GET /api/chats/:chatId/members
 * Get group members
 */
router.get('/:chatId/members',
  [
    param('chatId').isUUID().withMessage('Invalid chat ID'),
    validate,
  ],
  chatController.getGroupMembers
);

/**
 * POST /api/chats/:chatId/members
 * Add member to group
 */
router.post('/:chatId/members',
  [
    param('chatId').isUUID().withMessage('Invalid chat ID'),
    body('userId')
      .notEmpty()
      .withMessage('User ID is required')
      .isUUID()
      .withMessage('Invalid user ID'),
    validate,
  ],
  chatController.addGroupMember
);

/**
 * DELETE /api/chats/:chatId/members/:userId
 * Remove member from group
 */
router.delete('/:chatId/members/:userId',
  [
    param('chatId').isUUID().withMessage('Invalid chat ID'),
    param('userId').isUUID().withMessage('Invalid user ID'),
    validate,
  ],
  chatController.removeGroupMember
);

/**
 * PUT /api/chats/:chatId/members/:userId/role
 * Update member role
 */
router.put('/:chatId/members/:userId/role',
  [
    param('chatId').isUUID().withMessage('Invalid chat ID'),
    param('userId').isUUID().withMessage('Invalid user ID'),
    body('role')
      .isIn(['MEMBER', 'ADMIN'])
      .withMessage('Role must be MEMBER or ADMIN'),
    validate,
  ],
  chatController.updateMemberRole
);

/**
 * POST /api/chats/:chatId/leave
 * Leave group chat
 */
router.post('/:chatId/leave',
  [
    param('chatId').isUUID().withMessage('Invalid chat ID'),
    validate,
  ],
  chatController.leaveGroup
);

module.exports = router;
