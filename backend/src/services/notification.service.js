const admin = require('../config/firebase');
const supabase = require('../config/supabase');
const logger = require('../config/logger');

/**
 * Notification Service
 * Handles FCM push notifications for messages, groups, and other events
 */
class NotificationService {
  /**
   * Get FCM tokens for user from Supabase
   */
  async getUserTokens(userId) {
    try {
      const { data: devices, error } = await supabase
        .from('user_devices')
        .select('fcm_token')
        .eq('user_id', userId)
        .eq('notification_enabled', true);
      
      if (error) {
        logger.error('Get user tokens error:', error);
        return [];
      }
      
      return devices.map(d => d.fcm_token).filter(Boolean);
    } catch (error) {
      logger.error('Get user tokens error:', error);
      return [];
    }
  }
  
  /**
   * Get FCM tokens for multiple users
   */
  async getMultipleUserTokens(userIds) {
    try {
      const { data: devices, error } = await supabase
        .from('user_devices')
        .select('fcm_token, user_id')
        .in('user_id', userIds)
        .eq('notification_enabled', true);
      
      if (error) {
        logger.error('Get multiple user tokens error:', error);
        return [];
      }
      
      return devices.map(d => d.fcm_token).filter(Boolean);
    } catch (error) {
      logger.error('Get multiple user tokens error:', error);
      return [];
    }
  }
  
  /**
   * Check if chat is muted for user
   */
  async isChatMuted(userId, chatId) {
    try {
      const { data } = await supabase
        .from('chat_notification_preferences')
        .select('muted_until')
        .eq('user_id', userId)
        .eq('chat_id', chatId)
        .maybeSingle();
      
      if (!data || !data.muted_until) return false;
      
      const mutedUntil = new Date(data.muted_until);
      return mutedUntil > new Date();
    } catch (error) {
      return false; // If error, assume not muted
    }
  }
  
  /**
   * Send notification to single user
   */
  async sendToUser(userId, title, body, data = {}) {
    try {
      if (!admin) {
        logger.warn('FCM not configured - skipping notification');
        return { success: false, error: 'FCM not configured' };
      }
      
      const tokens = await this.getUserTokens(userId);
      
      if (tokens.length === 0) {
        logger.debug(`No FCM tokens found for user ${userId}`);
        return { success: false, error: 'No FCM tokens' };
      }
      
      const result = await this.sendMulticast(tokens, title, body, data);
      
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
        return { successCount: 0, failureCount: userIds.length };
      }
      
      const tokens = await this.getMultipleUserTokens(userIds);
      
      if (tokens.length === 0) {
        logger.debug('No FCM tokens found for users');
        return { successCount: 0, failureCount: userIds.length };
      }
      
      const result = await this.sendMulticast(tokens, title, body, data);
      
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
   * Called when new message is sent
   */
  async sendMessageNotifications(chatId, senderId, message) {
    try {
      if (!admin) {
        logger.debug('FCM not configured - skipping message notification');
        return;
      }
      
      // Get chat participants (excluding sender)
      const { data: participants } = await supabase
        .from('chat_participants')
        .select('user_id')
        .eq('chat_id', chatId)
        .neq('user_id', senderId);
      
      if (!participants || participants.length === 0) {
        return;
      }
      
      // Filter out users who muted this chat
      const activeRecipients = [];
      for (const p of participants) {
        const isMuted = await this.isChatMuted(p.user_id, chatId);
        if (!isMuted) {
          activeRecipients.push(p.user_id);
        }
      }
      
      if (activeRecipients.length === 0) {
        logger.debug('All recipients muted this chat');
        return;
      }
      
      // Get sender profile
      const { data: sender } = await supabase
        .from('profiles')
        .select('display_name, photo_url')
        .eq('id', senderId)
        .maybeSingle();
      
      // Get chat info
      const { data: chat } = await supabase
        .from('chat_rooms')
        .select('type, name')
        .eq('id', chatId)
        .maybeSingle();
      
      // Prepare notification
      const title = chat?.type === 'GROUP' 
        ? chat.name 
        : sender?.display_name || 'New Message';
      
      const body = message.type === 'GIF' 
        ? '🎬 Sent a GIF' 
        : message.type === 'IMAGE'
        ? '📷 Sent an image'
        : message.content.substring(0, 100);
      
      const notificationData = {
        type: 'message',
        chat_id: chatId,
        sender_id: senderId,
        sender_name: sender?.display_name || 'User',
        sender_avatar: sender?.photo_url || '',
        message_id: message.id,
        message_type: message.type,
        message_preview: body,
        timestamp: Date.now().toString(),
      };
      
      // Send to all active recipients
      const result = await this.sendToMultipleUsers(
        activeRecipients,
        title,
        body,
        notificationData
      );
      
      logger.info('Message notifications sent:', {
        chatId,
        recipients: activeRecipients.length,
        success: result.successCount,
        failed: result.failureCount,
      });
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
      if (!admin) return;
      
      const { data: group } = await supabase
        .from('chat_rooms')
        .select('name, photo_url')
        .eq('id', groupId)
        .maybeSingle();
      
      const { data: inviter } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', inviterId)
        .maybeSingle();
      
      const title = 'Group Invitation';
      const body = `${inviter?.display_name || 'Someone'} added you to ${group?.name || 'a group'}`;
      
      const data = {
        type: 'group_invite',
        group_id: groupId,
        group_name: group?.name || '',
        group_photo: group?.photo_url || '',
        inviter_id: inviterId,
        inviter_name: inviter?.display_name || '',
        timestamp: Date.now().toString(),
      };
      
      await this.sendToMultipleUsers(memberIds, title, body, data);
      
      logger.info('Group invite notifications sent:', {
        groupId,
        recipients: memberIds.length,
      });
    } catch (error) {
      logger.error('Send group invite notifications error:', error);
    }
  }
  
  /**
   * Send multicast notification to multiple tokens
   */
  async sendMulticast(tokens, title, body, data = {}) {
    try {
      if (!admin) {
        logger.warn('FCM not configured');
        return { successCount: 0, failureCount: tokens.length, invalidTokens: [] };
      }
      
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
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: data.type === 'message' ? 'messages' : 'general',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true,
            color: '#6200EE',
          },
        },
        tokens,
      };
      
      const response = await admin.messaging().sendEachForMulticast(message);
      
      logger.info('FCM multicast sent:', {
        total: tokens.length,
        success: response.successCount,
        failure: response.failureCount,
      });
      
      // Collect invalid tokens for cleanup
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
      
      // Cleanup invalid tokens asynchronously
      if (invalidTokens.length > 0) {
        this.removeInvalidTokens(invalidTokens).catch(err => {
          logger.error('Failed to remove invalid tokens:', err);
        });
      }
      
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
