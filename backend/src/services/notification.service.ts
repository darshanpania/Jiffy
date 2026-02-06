import { fcm } from '../config/firebase';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export class NotificationService {
  /**
   * Get FCM tokens for user
   */
  private async getUserTokens(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_devices')
        .select('fcm_token')
        .eq('user_id', userId);

      if (error) {
        logger.error('Failed to fetch user tokens:', error);
        return [];
      }

      return data?.map(d => d.fcm_token) || [];
    } catch (error) {
      logger.error('Get user tokens error:', error);
      return [];
    }
  }

  /**
   * Get FCM tokens for multiple users
   */
  private async getMultipleUserTokens(userIds: string[]): Promise<string[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_devices')
        .select('fcm_token')
        .in('user_id', userIds);

      if (error) {
        logger.error('Failed to fetch tokens:', error);
        return [];
      }

      return data?.map(d => d.fcm_token) || [];
    } catch (error) {
      logger.error('Get multiple user tokens error:', error);
      return [];
    }
  }

  /**
   * Check if chat is muted for user
   */
  private async isChatMuted(userId: string, chatId: string): Promise<boolean> {
    try {
      const { data } = await supabaseAdmin
        .from('chat_notification_preferences')
        .select('muted_until')
        .eq('user_id', userId)
        .eq('chat_id', chatId)
        .single();

      if (!data || !data.muted_until) return false;

      const mutedUntil = new Date(data.muted_until);
      return mutedUntil > new Date();
    } catch (error) {
      return false;
    }
  }

  /**
   * Send notification to single user
   */
  async sendNotification(userId: string, payload: NotificationPayload) {
    try {
      const tokens = await this.getUserTokens(userId);

      if (tokens.length === 0) {
        logger.warn(`No FCM tokens found for user ${userId}`);
        return;
      }

      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        tokens,
      };

      const response = await fcm.sendEachForMulticast(message);

      logger.info(`Notification sent to user ${userId}: ${response.successCount}/${tokens.length} delivered`);

      // Remove invalid tokens
      if (response.failureCount > 0) {
        await this.cleanupInvalidTokens(tokens, response.responses);
      }
    } catch (error) {
      logger.error('Send notification failed:', error);
    }
  }

  /**
   * Send message notification
   */
  async sendMessageNotification(
    recipientIds: string[],
    chatId: string,
    senderId: string,
    messagePreview: string
  ) {
    try {
      // Get sender info
      const { data: sender } = await supabaseAdmin
        .from('profiles')
        .select('display_name, photo_url')
        .eq('id', senderId)
        .single();

      // Get chat info
      const { data: chat } = await supabaseAdmin
        .from('chat_rooms')
        .select('name, type')
        .eq('id', chatId)
        .single();

      const chatName = chat?.type === 'GROUP' ? chat.name : sender?.display_name;

      // Filter out users who have muted this chat
      const activeRecipients: string[] = [];
      for (const recipientId of recipientIds) {
        const isMuted = await this.isChatMuted(recipientId, chatId);
        if (!isMuted) {
          activeRecipients.push(recipientId);
        }
      }

      if (activeRecipients.length === 0) {
        return;
      }

      const tokens = await this.getMultipleUserTokens(activeRecipients);

      if (tokens.length === 0) {
        return;
      }

      const message = {
        notification: {
          title: chatName || 'New Message',
          body: messagePreview,
        },
        data: {
          type: 'message',
          chat_id: chatId,
          sender_id: senderId,
          sender_name: sender?.display_name || 'User',
          timestamp: Date.now().toString(),
        },
        tokens,
      };

      const response = await fcm.sendEachForMulticast(message);
      logger.info(`Message notifications sent: ${response.successCount}/${tokens.length}`);
    } catch (error) {
      logger.error('Send message notification failed:', error);
    }
  }

  /**
   * Send friend request notification
   */
  async sendFriendRequestNotification(receiverId: string, senderId: string) {
    try {
      const { data: sender } = await supabaseAdmin
        .from('profiles')
        .select('display_name, photo_url')
        .eq('id', senderId)
        .single();

      await this.sendNotification(receiverId, {
        title: 'New Friend Request',
        body: `${sender?.display_name || 'Someone'} sent you a friend request`,
        data: {
          type: 'friend_request',
          sender_id: senderId,
          sender_name: sender?.display_name || '',
        },
      });
    } catch (error) {
      logger.error('Send friend request notification failed:', error);
    }
  }

  /**
   * Send group invite notification
   */
  async sendGroupInviteNotification(
    memberIds: string[],
    groupId: string,
    groupName: string
  ) {
    try {
      const tokens = await this.getMultipleUserTokens(memberIds);

      if (tokens.length === 0) {
        return;
      }

      const message = {
        notification: {
          title: 'Added to Group',
          body: `You were added to ${groupName}`,
        },
        data: {
          type: 'group_invite',
          group_id: groupId,
          group_name: groupName,
        },
        tokens,
      };

      const response = await fcm.sendEachForMulticast(message);
      logger.info(`Group invite notifications sent: ${response.successCount}/${tokens.length}`);
    } catch (error) {
      logger.error('Send group invite notification failed:', error);
    }
  }

  /**
   * Register FCM token for user
   */
  async registerToken(userId: string, fcmToken: string, deviceType: string = 'android') {
    try {
      const { error } = await supabaseAdmin
        .from('user_devices')
        .upsert({
          user_id: userId,
          fcm_token: fcmToken,
          device_type: deviceType,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw new AppError('Failed to register FCM token', 500);
      }

      logger.info(`FCM token registered for user ${userId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cleanup invalid FCM tokens
   */
  private async cleanupInvalidTokens(tokens: string[], responses: any[]) {
    try {
      const invalidTokens = tokens.filter((token, index) => {
        const response = responses[index];
        return response.error?.code === 'messaging/invalid-registration-token' ||
               response.error?.code === 'messaging/registration-token-not-registered';
      });

      if (invalidTokens.length > 0) {
        await supabaseAdmin
          .from('user_devices')
          .delete()
          .in('fcm_token', invalidTokens);

        logger.info(`Cleaned up ${invalidTokens.length} invalid FCM tokens`);
      }
    } catch (error) {
      logger.error('Cleanup invalid tokens failed:', error);
    }
  }
}

export default new NotificationService();