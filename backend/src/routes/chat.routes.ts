import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import chatService from '../services/chat.service';
import { validate, schemas } from '../middleware/validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/v1/chats
 * Get all chats for current user
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const chats = await chatService.getUserChats(req.user!.id);

    res.json({
      success: true,
      data: chats,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * POST /api/v1/chats/direct
 * Get or create direct chat with another user
 */
router.post('/direct', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: { message: 'User ID is required' },
      });
    }

    const chatId = await chatService.getOrCreateDirectChat(req.user!.id, userId);

    res.json({
      success: true,
      data: { chatId },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * POST /api/v1/chats/group
 * Create group chat
 */
router.post('/group', validate(schemas.createGroup), async (req: AuthRequest, res: Response) => {
  try {
    const groupId = await chatService.createGroup({
      ...req.body,
      createdBy: req.user!.id,
    });

    res.status(201).json({
      success: true,
      data: { groupId },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * GET /api/v1/chats/:chatId/messages
 * Get messages in a chat
 */
router.get('/:chatId/messages', async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const { page, limit } = req.query;

    const messages = await chatService.getMessages(
      chatId,
      parseInt(page as string) || 1,
      parseInt(limit as string) || 50
    );

    res.json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * POST /api/v1/chats/:chatId/messages
 * Send message in chat
 */
router.post('/:chatId/messages', validate(schemas.sendMessage), async (req: AuthRequest, res: Response) => {
  try {
    const message = await chatService.sendMessage({
      ...req.body,
      senderId: req.user!.id,
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * PUT /api/v1/chats/:chatId/read
 * Mark messages as read
 */
router.put('/:chatId/read', async (req: AuthRequest, res: Response) => {
  try {
    await chatService.markMessagesAsRead(req.user!.id, req.params.chatId);

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * POST /api/v1/chats/:chatId/members
 * Add member to group
 */
router.post('/:chatId/members', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: { message: 'User ID is required' },
      });
    }

    await chatService.addGroupMember(req.params.chatId, userId, req.user!.id);

    res.json({
      success: true,
      message: 'Member added to group',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * DELETE /api/v1/chats/:chatId/members/:userId
 * Remove member from group
 */
router.delete('/:chatId/members/:userId', async (req: AuthRequest, res: Response) => {
  try {
    await chatService.removeGroupMember(
      req.params.chatId,
      req.params.userId,
      req.user!.id
    );

    res.json({
      success: true,
      message: 'Member removed from group',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

export default router;