/**
 * Notification Controller
 * Handles FCM push notifications
 */

const NotificationService = require('../services/notification.service');
const logger = require('../config/logger');
const { StatusCodes } = require('http-status-codes');

class NotificationController {
  /**
   * Send notification to single user
   */
  async sendToUser(req, res) {
    try {
      const { userId, title, body, data } = req.body;
      
      const result = await NotificationService.sendToUser(userId, title, body, data);
      
      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: result.error || 'Failed to send notification',
        });
      }
      
      res.json({
        message: 'Notification sent',
        sentCount: result.successCount,
      });
    } catch (error) {
      logger.error('Send notification error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to send notification',
      });
    }
  }
  
  /**
   * Send notification to multiple users
   */
  async sendToMultiple(req, res) {
    try {
      const { userIds, title, body, data } = req.body;
      
      const result = await NotificationService.sendToMultipleUsers(userIds, title, body, data);
      
      res.json({
        message: 'Notifications sent',
        sentCount: result.successCount,
        failedCount: result.failureCount,
      });
    } catch (error) {
      logger.error('Send multiple notifications error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to send notifications',
      });
    }
  }
  
  /**
   * Send test notification (development only)
   */
  async sendTestNotification(req, res) {
    try {
      const userId = req.userId;
      
      const result = await NotificationService.sendToUser(
        userId,
        'Test Notification',
        'This is a test notification from JIFFY backend',
        { type: 'test' }
      );
      
      res.json({
        message: 'Test notification sent',
        success: result.success,
      });
    } catch (error) {
      logger.error('Send test notification error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to send test notification',
      });
    }
  }
}

module.exports = new NotificationController();
