import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import userService from '../services/user.service';
import { validate, schemas } from '../middleware/validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/v1/users/me
 * Get current user profile
 */
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await userService.getProfile(req.user!.id);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * GET /api/v1/users/:userId
 * Get user profile by ID
 */
router.get('/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await userService.getProfile(req.params.userId);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * PUT /api/v1/users/me
 * Update current user profile
 */
router.put('/me', validate(schemas.updateProfile), async (req: AuthRequest, res: Response) => {
  try {
    const profile = await userService.updateProfile(req.user!.id, req.body);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * GET /api/v1/users/search
 * Search users by name or email
 */
router.get('/search', async (req: AuthRequest, res: Response) => {
  try {
    const { q, limit } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: { message: 'Search query is required' },
      });
    }

    const users = await userService.searchUsers(q, parseInt(limit as string) || 20);

    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * GET /api/v1/users/me/friends
 * Get current user's friends
 */
router.get('/me/friends', async (req: AuthRequest, res: Response) => {
  try {
    const friends = await userService.getFriends(req.user!.id);

    res.json({
      success: true,
      data: friends,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * PUT /api/v1/users/me/status
 * Update online status
 */
router.put('/me/status', async (req: AuthRequest, res: Response) => {
  try {
    const { isOnline } = req.body;

    await userService.updateOnlineStatus(req.user!.id, isOnline);

    res.json({
      success: true,
      message: 'Status updated',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

export default router;