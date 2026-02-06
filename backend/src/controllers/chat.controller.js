/**
 * Chat Controller
 * Handles messaging and chat operations with Supabase
 */

const supabase = require('../config/supabase');
const logger = require('../config/logger');
const { StatusCodes } = require('http-status-codes');
const NotificationService = require('../services/notification.service');

class ChatController {
  /**
   * Get user's chats
   */
  async getUserChats(req, res) {
    try {
      const userId = req.userId;
      
      const { data, error } = await supabase.rpc('get_user_chats', {
        p_user_id: userId,
      });
      
      if (error) {
        logger.error('Get user chats error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Internal Server Error',
          message: 'Failed to get chats',
        });
      }
      
      res.json({
        chats: data,
        count: data.length,
      });
    } catch (error) {
      logger.error('Get user chats error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to get chats',
      });
    }
  }
  
  /**
   * Get or create direct chat
   */
  async getOrCreateDirectChat(req, res) {
    try {
      const { otherUserId } = req.body;
      const userId = req.userId;
      
      // Call Supabase function to get or create chat
      const { data: chatId, error } = await supabase.rpc('get_or_create_direct_chat', {
        user1_id: userId,
        user2_id: otherUserId,
      });
      
      if (error) {
        logger.error('Get or create chat error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Internal Server Error',
          message: 'Failed to create chat',
        });
      }
      
      res.status(StatusCodes.CREATED).json({
        chatId,
      });
    } catch (error) {
      logger.error('Get or create direct chat error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to create chat',
      });
    }
  }
  
  /**
   * Create group chat
   */
  async createGroupChat(req, res) {
    try {
      const { name, memberIds, description, photoUrl } = req.body;
      const userId = req.userId;
      
      // Call Supabase function to create group
      const { data: groupId, error } = await supabase.rpc('create_group_chat', {
        p_creator_id: userId,
        p_group_name: name,
        p_member_ids: memberIds,
      });
      
      if (error) {
        logger.error('Create group chat error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      // Update description and photo if provided
      if (description || photoUrl) {
        await supabase
          .from('chat_rooms')
          .update({
            ...(description && { description }),
            ...(photoUrl && { photo_url: photoUrl }),
          })
          .eq('id', groupId);
      }
      
      // Send notifications to all members
      await NotificationService.sendGroupInviteNotifications(groupId, userId, memberIds);
      
      logger.info(`Group chat created: ${groupId}`);
      
      res.status(StatusCodes.CREATED).json({
        groupId,
        message: 'Group created successfully',
      });
    } catch (error) {
      logger.error('Create group chat error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to create group',
      });
    }
  }
  
  /**
   * Get chat messages
   */
  async getMessages(req, res) {
    try {
      const { chatId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(id, display_name, photo_url)')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);
      
      if (error) {
        logger.error('Get messages error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Internal Server Error',
          message: 'Failed to get messages',
        });
      }
      
      res.json({
        messages: data.reverse(), // Return in chronological order
        count: data.length,
        offset: parseInt(offset),
        limit: parseInt(limit),
      });
    } catch (error) {
      logger.error('Get messages error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to get messages',
      });
    }
  }
  
  /**
   * Send message
   */
  async sendMessage(req, res) {
    try {
      const { chatId } = req.params;
      const { content, type } = req.body;
      const userId = req.userId;
      
      // Insert message
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: userId,
          content,
          type,
          status: 'SENT',
        })
        .select('*, sender:profiles!messages_sender_id_fkey(id, display_name, photo_url)')
        .single();
      
      if (error) {
        logger.error('Send message error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      // Send FCM notifications to chat participants
      await NotificationService.sendMessageNotifications(chatId, userId, message);
      
      logger.info(`Message sent in chat ${chatId}`);
      
      res.status(StatusCodes.CREATED).json(message);
    } catch (error) {
      logger.error('Send message error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to send message',
      });
    }
  }
  
  /**
   * Mark messages as read
   */
  async markAsRead(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.userId;
      
      const { error } = await supabase.rpc('mark_messages_as_read', {
        p_user_id: userId,
        p_chat_id: chatId,
      });
      
      if (error) {
        logger.error('Mark as read error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Internal Server Error',
          message: 'Failed to mark messages as read',
        });
      }
      
      res.json({
        message: 'Messages marked as read',
      });
    } catch (error) {
      logger.error('Mark as read error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to mark messages as read',
      });
    }
  }
  
  /**
   * Get group members
   */
  async getGroupMembers(req, res) {
    try {
      const { chatId } = req.params;
      
      const { data, error } = await supabase
        .from('chat_participants')
        .select('*, profile:profiles!chat_participants_user_id_fkey(*)')
        .eq('chat_id', chatId);
      
      if (error) {
        logger.error('Get group members error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Internal Server Error',
          message: 'Failed to get members',
        });
      }
      
      res.json({
        members: data,
        count: data.length,
      });
    } catch (error) {
      logger.error('Get group members error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to get members',
      });
    }
  }
  
  /**
   * Add group member
   */
  async addGroupMember(req, res) {
    try {
      const { chatId } = req.params;
      const { userId: newMemberId } = req.body;
      const adminId = req.userId;
      
      // Call Supabase function (checks admin permission)
      const { error } = await supabase.rpc('add_group_member', {
        p_group_id: chatId,
        p_user_id: newMemberId,
        p_added_by: adminId,
      });
      
      if (error) {
        logger.error('Add group member error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      // Send notification to new member
      await NotificationService.sendGroupInviteNotification(chatId, newMemberId);
      
      res.json({
        message: 'Member added successfully',
      });
    } catch (error) {
      logger.error('Add group member error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to add member',
      });
    }
  }
  
  /**
   * Remove group member
   */
  async removeGroupMember(req, res) {
    try {
      const { chatId, userId: memberToRemove } = req.params;
      const adminId = req.userId;
      
      // Call Supabase function (checks admin permission)
      const { error } = await supabase.rpc('remove_group_member', {
        p_group_id: chatId,
        p_user_id: memberToRemove,
        p_removed_by: adminId,
      });
      
      if (error) {
        logger.error('Remove group member error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      res.json({
        message: 'Member removed successfully',
      });
    } catch (error) {
      logger.error('Remove group member error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to remove member',
      });
    }
  }
}

module.exports = new ChatController();
