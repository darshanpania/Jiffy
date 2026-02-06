import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import authService from '../services/auth.service';
import notificationService from '../services/notification.service';
import { validate, schemas } from '../middleware/validator';
import logger from '../utils/logger';

const router = Router();

/**
 * POST /api/v1/auth/verify
 * Verify authentication token
 */
router.post('/verify', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * POST /api/v1/auth/register-fcm-token
 * Register FCM token for push notifications
 */
router.post('/register-fcm-token', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { fcmToken, deviceType } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        error: { message: 'FCM token is required' },
      });
    }

    await notificationService.registerToken(req.user!.id, fcmToken, deviceType);

    res.json({
      success: true,
      message: 'FCM token registered successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * POST /api/v1/auth/signout
 * Sign out user
 */
router.post('/signout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await authService.signOut(req.user!.id);

    res.json({
      success: true,
      message: 'Signed out successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

export default router;