import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import notificationService from './notification.service';

interface SendMessageData {
  chatId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'GIF' | 'IMAGE';
  replyTo?: string;
}

interface CreateGroupData {
  name: string;
  description?: string;
  createdBy: string;
  memberIds: string[];
}

export class ChatService {
  /**
   * Send message in chat
   */
  async sendMessage(data: SendMessageData) {
    try {
      // Insert message into Supabase
      const { data: message, error } = await supabaseAdmin
        .from('messages')
        .insert({
          chat_id: data.chatId,
          sender_id: data.senderId,
          content: data.content,
          type: data.type,
          status: 'SENT',
          reply_to: data.replyTo,
        })
        .select()
        .single();

      if (error) {
        logger.error('Send message failed:', error);
        throw new AppError('Failed to send message', 500);
      }

      // Get chat participants (excluding sender)
      const { data: participants } = await supabaseAdmin
        .from('chat_participants')
        .select('user_id')
        .eq('chat_id', data.chatId)
        .neq('user_id', data.senderId);

      // Send FCM notifications to all participants
      if (participants && participants.length > 0) {
        const recipientIds = participants.map(p => p.user_id);
        await notificationService.sendMessageNotification(
          recipientIds,
          data.chatId,
          data.senderId,
          data.content.substring(0, 100)
        );
      }

      logger.info(`Message sent in chat ${data.chatId}`);
      return message;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get or create direct chat between two users
   */
  async getOrCreateDirectChat(user1Id: string, user2Id: string) {
    try {
      const { data, error } = await supabaseAdmin
        .rpc('get_or_create_direct_chat', {
          user1_id: user1Id,
          user2_id: user2Id,
        });

      if (error) {
        throw new AppError('Failed to get/create chat', 500);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's chats
   */
  async getUserChats(userId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .rpc('get_user_chats', {
          p_user_id: userId,
        });

      if (error) {
        throw new AppError('Failed to fetch chats', 500);
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get messages in chat with pagination
   */
  async getMessages(chatId: string, page: number = 1, limit: number = 50) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabaseAdmin
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('chat_id', chatId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new AppError('Failed to fetch messages', 500);
      }

      return {
        messages: data || [],
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > offset + limit,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(userId: string, chatId: string) {
    try {
      const { error } = await supabaseAdmin
        .rpc('mark_messages_as_read', {
          p_user_id: userId,
          p_chat_id: chatId,
        });

      if (error) {
        throw new AppError('Failed to mark messages as read', 500);
      }

      logger.info(`Messages marked as read for user ${userId} in chat ${chatId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create group chat
   */
  async createGroup(data: CreateGroupData) {
    try {
      const { data: groupId, error } = await supabaseAdmin
        .rpc('create_group_chat', {
          p_creator_id: data.createdBy,
          p_group_name: data.name,
          p_member_ids: data.memberIds,
        });

      if (error) {
        logger.error('Group creation failed:', error);
        throw new AppError('Failed to create group', 500);
      }

      // Send notifications to all added members
      await notificationService.sendGroupInviteNotification(
        data.memberIds,
        groupId,
        data.name
      );

      logger.info(`Group created: ${groupId}`);
      return groupId;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add member to group
   */
  async addGroupMember(groupId: string, userId: string, addedBy: string) {
    try {
      const { error } = await supabaseAdmin
        .rpc('add_group_member', {
          p_group_id: groupId,
          p_user_id: userId,
          p_added_by: addedBy,
        });

      if (error) {
        throw new AppError('Failed to add member to group', 500);
      }

      logger.info(`User ${userId} added to group ${groupId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove member from group
   */
  async removeGroupMember(groupId: string, userId: string, removedBy: string) {
    try {
      const { error } = await supabaseAdmin
        .rpc('remove_group_member', {
          p_group_id: groupId,
          p_user_id: userId,
          p_removed_by: removedBy,
        });

      if (error) {
        throw new AppError('Failed to remove member from group', 500);
      }

      logger.info(`User ${userId} removed from group ${groupId}`);
    } catch (error) {
      throw error;
    }
  }
}

export default new ChatService();