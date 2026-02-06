import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import notificationService from '../services/notification.service';
import { validate, schemas } from '../middleware/validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/v1/notifications/send
 * Send push notification (admin/system use)
 */
router.post('/send', validate(schemas.sendNotification), async (req: AuthRequest, res: Response) => {
  try {
    const { userId, title, body, data } = req.body;

    await notificationService.sendNotification(userId, {
      title,
      body,
      data,
    });

    res.json({
      success: true,
      message: 'Notification sent successfully',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * POST /api/v1/notifications/test
 * Send test notification to current user
 */
router.post('/test', async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.sendNotification(req.user!.id, {
      title: 'Test Notification',
      body: 'This is a test notification from JIFFY backend',
      data: {
        type: 'test',
        timestamp: Date.now().toString(),
      },
    });

    res.json({
      success: true,
      message: 'Test notification sent',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

export default router;