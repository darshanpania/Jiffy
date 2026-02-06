import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import friendService from '../services/friend.service';
import { validate, schemas } from '../middleware/validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/v1/friends/requests
 * Send friend request
 */
router.post('/requests', validate(schemas.sendFriendRequest), async (req: AuthRequest, res: Response) => {
  try {
    const request = await friendService.sendFriendRequest(
      req.user!.id,
      req.body.receiverId
    );

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * GET /api/v1/friends/requests/pending
 * Get pending friend requests
 */
router.get('/requests/pending', async (req: AuthRequest, res: Response) => {
  try {
    const requests = await friendService.getPendingRequests(req.user!.id);

    res.json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * PUT /api/v1/friends/requests/:requestId/accept
 * Accept friend request
 */
router.put('/requests/:requestId/accept', async (req: AuthRequest, res: Response) => {
  try {
    const request = await friendService.acceptFriendRequest(
      req.params.requestId,
      req.user!.id
    );

    res.json({
      success: true,
      data: request,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * PUT /api/v1/friends/requests/:requestId/decline
 * Decline friend request
 */
router.put('/requests/:requestId/decline', async (req: AuthRequest, res: Response) => {
  try {
    const request = await friendService.declineFriendRequest(
      req.params.requestId,
      req.user!.id
    );

    res.json({
      success: true,
      data: request,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * GET /api/v1/friends/suggested
 * Get suggested friends
 */
router.get('/suggested', async (req: AuthRequest, res: Response) => {
  try {
    const { limit } = req.query;
    const suggestions = await friendService.getSuggestedFriends(
      req.user!.id,
      parseInt(limit as string) || 10
    );

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * DELETE /api/v1/friends/:friendId
 * Unfriend user
 */
router.delete('/:friendId', async (req: AuthRequest, res: Response) => {
  try {
    await friendService.unfriend(req.user!.id, req.params.friendId);

    res.json({
      success: true,
      message: 'Unfriended successfully',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

export default router;