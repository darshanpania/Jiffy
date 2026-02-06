/**
 * Notification Service
 * Firebase Cloud Messaging (FCM) integration
 * Sends push notifications via FCM, manages tokens via Supabase
 */

const admin = require('../config/firebase');
const supabase = require('../config/supabase');
const logger = require('../config/logger');

class NotificationService {
  /**
   * Send notification to a single user
   */
  async sendToUser(userId, title, body, data = {}) {
    try {
      if (!admin) {
        logger.warn('FCM not configured - skipping notification');
        return { success: false, error: 'FCM not configured' };
      }
      
      // Get user's FCM tokens from Supabase
      const { data: devices, error } = await supabase
        .from('user_devices')
        .select('fcm_token')
        .eq('user_id', userId)
        .eq('notification_enabled', true);
      
      if (error || !devices || devices.length === 0) {
        logger.warn(`No FCM tokens found for user ${userId}`);
        return { success: false, error: 'No FCM tokens' };
      }
      
      const tokens = devices.map(d => d.fcm_token).filter(Boolean);
      
      if (tokens.length === 0) {
        return { success: false, error: 'No valid tokens' };
      }
      
      // Send to all user's devices
      const result = await this.sendMulticast(tokens, title, body, data);
      
      // Remove invalid tokens
      if (result.invalidTokens.length > 0) {
        await this.removeInvalidTokens(result.invalidTokens);
      }
      
      return {
        success: result.successCount > 0,
        successCount: result.successCount,
        failureCount: result.failureCount,
      };
    } catch (error) {
      logger.error('Send to user error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Send notification to multiple users
   */
  async sendToMultipleUsers(userIds, title, body, data = {}) {
    try {
      if (!admin) {
        return { success: false, successCount: 0, failureCount: userIds.length };
      }
      
      // Get all FCM tokens for these users
      const { data: devices, error } = await supabase
        .from('user_devices')
        .select('fcm_token')
        .in('user_id', userIds)
        .eq('notification_enabled', true);
      
      if (error || !devices || devices.length === 0) {
        logger.warn('No FCM tokens found for users');
        return { successCount: 0, failureCount: userIds.length };
      }
      
      const tokens = devices.map(d => d.fcm_token).filter(Boolean);
      
      const result = await this.sendMulticast(tokens, title, body, data);
      
      // Remove invalid tokens
      if (result.invalidTokens.length > 0) {
        await this.removeInvalidTokens(result.invalidTokens);
      }
      
      return {
        successCount: result.successCount,
        failureCount: result.failureCount,
      };
    } catch (error) {
      logger.error('Send to multiple users error:', error);
      return { successCount: 0, failureCount: userIds.length };
    }
  }
  
  /**
   * Send message notification
   */
  async sendMessageNotifications(chatId, senderId, message) {
    try {
      // Get chat participants (except sender)
      const { data: participants, error } = await supabase
        .from('chat_participants')
        .select('user_id')
        .eq('chat_id', chatId)
        .neq('user_id', senderId);
      
      if (error || !participants || participants.length === 0) {
        return;
      }
      
      // Get sender profile
      const { data: sender } = await supabase
        .from('profiles')
        .select('display_name, photo_url')
        .eq('id', senderId)
        .single();
      
      // Get chat info
      const { data: chat } = await supabase
        .from('chat_rooms')
        .select('type, name')
        .eq('id', chatId)
        .single();
      
      const userIds = participants.map(p => p.user_id);
      const title = chat?.type === 'GROUP' ? chat.name : sender?.display_name || 'New Message';
      const body = message.type === 'GIF' ? '🎬 Sent a GIF' : message.content;
      
      const notificationData = {
        type: 'message',
        chat_id: chatId,
        sender_id: senderId,
        sender_name: sender?.display_name || 'User',
        sender_avatar: sender?.photo_url || '',
        message_preview: body.substring(0, 100),
        message_type: message.type,
      };
      
      await this.sendToMultipleUsers(userIds, title, body, notificationData);
      
      logger.info(`Message notifications sent for chat ${chatId}`);
    } catch (error) {
      logger.error('Send message notifications error:', error);
      // Don't throw - notifications are non-critical
    }
  }
  
  /**
   * Send group invite notifications
   */
  async sendGroupInviteNotifications(groupId, inviterId, memberIds) {
    try {
      const { data: group } = await supabase
        .from('chat_rooms')
        .select('name')
        .eq('id', groupId)
        .single();
      
      const { data: inviter } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', inviterId)
        .single();
      
      const title = 'Group Invitation';
      const body = `${inviter?.display_name || 'Someone'} added you to ${group?.name || 'a group'}`;
      
      await this.sendToMultipleUsers(memberIds, title, body, {
        type: 'group_invite',
        group_id: groupId,
        inviter_id: inviterId,
      });
    } catch (error) {
      logger.error('Send group invite notifications error:', error);
    }
  }
  
  /**
   * Send notification to single device
   */
  async sendGroupInviteNotification(groupId, userId) {
    try {
      const { data: group } = await supabase
        .from('chat_rooms')
        .select('name')
        .eq('id', groupId)
        .single();
      
      await this.sendToUser(
        userId,
        'Added to Group',
        `You were added to ${group?.name || 'a group'}`,
        { type: 'group_invite', group_id: groupId }
      );
    } catch (error) {
      logger.error('Send group invite notification error:', error);
    }
  }
  
  /**
   * Send multicast notification via FCM
   */
  async sendMulticast(tokens, title, body, data = {}) {
    try {
      if (tokens.length === 0) {
        return { successCount: 0, failureCount: 0, invalidTokens: [] };
      }
      
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          timestamp: Date.now().toString(),
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: data.type === 'message' ? 'messages' : 'general',
          },
        },
        tokens,
      };
      
      const response = await admin.messaging().sendEachForMulticast(message);
      
      logger.info(`FCM sent: ${response.successCount} success, ${response.failureCount} failed`);
      
      // Collect invalid tokens
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });
      
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens,
      };
    } catch (error) {
      logger.error('Send multicast error:', error);
      return {
        successCount: 0,
        failureCount: tokens.length,
        invalidTokens: [],
      };
    }
  }
  
  /**
   * Remove invalid FCM tokens from Supabase
   */
  async removeInvalidTokens(tokens) {
    try {
      if (tokens.length === 0) return;
      
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .in('fcm_token', tokens);
      
      if (error) {
        logger.error('Remove invalid tokens error:', error);
      } else {
        logger.info(`Removed ${tokens.length} invalid FCM tokens`);
      }
    } catch (error) {
      logger.error('Remove invalid tokens error:', error);
    }
  }
}

module.exports = new NotificationService();
