const supabase = require('../config/supabase');
const logger = require('../config/logger');
const { StatusCodes } = require('http-status-codes');
const NotificationService = require('../services/notification.service');

/**
 * Chat Controller
 * Handles all chat and messaging operations including direct chats,
 * group chats, messages, and member management
 */
class ChatController {
  /**
   * GET /api/chats
   * Get all chats for current user with last message
   */
  async getUserChats(req, res) {
    try {
      const userId = req.userId;
      
      logger.debug(`Getting chats for user: ${userId}`);
      
      // Call Supabase RPC function for optimized chat list
      const { data: chats, error } = await supabase
        .rpc('get_user_chats', { p_user_id: userId });
      
      if (error) {
        logger.error('Get user chats error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Internal Server Error',
          message: 'Failed to get chats',
        });
      }
      
      logger.info(`Chats retrieved: ${userId} → ${chats?.length || 0} chats`);
      
      res.json({
        chats: chats || [],
        count: chats?.length || 0,
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
   * POST /api/chats/direct
   * Get or create direct chat with another user
   */
  async getOrCreateDirectChat(req, res) {
    try {
      const userId = req.userId;
      const { otherUserId } = req.body;
      
      if (userId === otherUserId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'Cannot create chat with yourself',
        });
      }
      
      logger.debug(`Get/create direct chat: ${userId} ↔ ${otherUserId}`);
      
      // Call RPC function to get or create direct chat
      const { data: chatId, error } = await supabase
        .rpc('get_or_create_direct_chat', {
          user1_id: userId,
          user2_id: otherUserId,
        });
      
      if (error) {
        logger.error('Create direct chat error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Internal Server Error',
          message: 'Failed to create chat',
        });
      }
      
      // Check if chat was newly created
      const { data: chat } = await supabase
        .from('chat_rooms')
        .select('created_at')
        .eq('id', chatId)
        .single();
      
      const isNew = chat && new Date() - new Date(chat.created_at) < 1000;
      
      logger.info(`Direct chat ${isNew ? 'created' : 'retrieved'}: ${chatId}`);
      
      res.status(isNew ? StatusCodes.CREATED : StatusCodes.OK).json({
        chatId,
        created: isNew,
        message: `Chat ${isNew ? 'created' : 'retrieved'} successfully`,
      });
    } catch (error) {
      logger.error('Get/create direct chat error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to create chat',
      });
    }
  }
  
  /**
   * POST /api/chats/group
   * Create new group chat
   */
  async createGroupChat(req, res) {
    try {
      const userId = req.userId;
      const { name, memberIds, description, photoUrl } = req.body;
      
      logger.debug(`Creating group chat: ${name} by ${userId}`);
      
      // Call RPC function to create group
      const { data: groupId, error } = await supabase
        .rpc('create_group_chat', {
          p_creator_id: userId,
          p_group_name: name,
          p_member_ids: memberIds,
          p_description: description || null,
          p_photo_url: photoUrl || null,
        });
      
      if (error) {
        logger.error('Create group error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Internal Server Error',
          message: error.message || 'Failed to create group',
        });
      }
      
      // Get group details
      const { data: group } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', groupId)
        .single();
      
      logger.info(`Group created: ${groupId} - ${name} with ${memberIds.length + 1} members`);
      
      // Send notifications to added members (async, non-blocking)
      if (NotificationService) {
        NotificationService.sendGroupInviteNotifications(groupId, userId, memberIds)
          .catch(err => logger.error('Group notification error:', err));
      }
      
      res.status(StatusCodes.CREATED).json({
        groupId,
        message: 'Group created successfully',
        group: {
          id: group.id,
          type: group.type,
          name: group.name,
          description: group.description,
          photo_url: group.photo_url,
          created_by: group.created_by,
          created_at: group.created_at,
          members_count: memberIds.length + 1,
        },
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
   * GET /api/chats/:chatId/info
   * Get chat details and metadata
   */
  async getChatInfo(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.userId;
      
      // Verify user is participant
      const { data: participant } = await supabase
        .from('chat_participants')
        .select('role')
        .eq('chat_id', chatId)
        .eq('user_id', userId)
        .single();
      
      if (!participant) {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: 'Forbidden',
          message: 'You are not a member of this chat',
        });
      }
      
      // Get chat details
      const { data: chat, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', chatId)
        .single();
      
      if (error || !chat) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Not Found',
          message: 'Chat not found',
        });
      }
      
      // Get member count
      const { count: memberCount } = await supabase
        .from('chat_participants')
        .select('*', { count: 'exact', head: true })
        .eq('chat_id', chatId);
      
      res.json({
        ...chat,
        member_count: memberCount,
        user_role: participant.role,
      });
    } catch (error) {
      logger.error('Get chat info error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to get chat info',
      });
    }
  }
  
  /**
   * GET /api/chats/:chatId/messages
   * Get messages in chat with pagination
   */
  async getMessages(req, res) {
    try {
      const { chatId } = req.params;
      const { limit = 50, offset = 0, before } = req.query;
      const userId = req.userId;
      
      // Verify user is participant
      const { data: participant } = await supabase
        .from('chat_participants')
        .select('id')
        .eq('chat_id', chatId)
        .eq('user_id', userId)
        .single();
      
      if (!participant) {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: 'Forbidden',
          message: 'You are not a member of this chat',
        });
      }
      
      let query = supabase
        .from('messages')
        .select(`
          id,
          chat_id,
          sender_id,
          content,
          type,
          status,
          is_edited,
          created_at,
          updated_at,
          reply_to,
          sender:profiles!messages_sender_id_fkey(
            id,
            display_name,
            photo_url
          )
        `, { count: 'exact' })
        .eq('chat_id', chatId);
      
      // Filter by timestamp if provided
      if (before) {
        query = query.lt('created_at', before);
      }
      
      const { data: messages, error, count } = await query
        .order('created_at', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
      
      if (error) {
        logger.error('Get messages error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Internal Server Error',
          message: 'Failed to get messages',
        });
      }
      
      logger.info(`Messages retrieved: ${chatId} → ${messages.length} messages`);
      
      res.json({
        messages: messages || [],
        count: messages?.length || 0,
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: count > parseInt(offset) + parseInt(limit),
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
   * POST /api/chats/:chatId/messages
   * Send message in chat (triggers realtime and notifications)
   */
  async sendMessage(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.userId;
      const { content, type, replyTo } = req.body;
      
      // Verify user is participant
      const { data: participant } = await supabase
        .from('chat_participants')
        .select('id')
        .eq('chat_id', chatId)
        .eq('user_id', userId)
        .single();
      
      if (!participant) {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: 'Forbidden',
          message: 'You are not a member of this chat',
        });
      }
      
      // Insert message
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: userId,
          content,
          type: type || 'TEXT',
          status: 'SENT',
          reply_to: replyTo || null,
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            id,
            display_name,
            photo_url
          )
        `)
        .single();
      
      if (error) {
        logger.error('Send message error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      logger.info(`Message sent: ${message.id} in ${chatId}`);
      
      // Update chat's updated_at timestamp
      await supabase
        .from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);
      
      // Increment unread count for other participants
      await supabase
        .rpc('increment_unread_count', {
          p_chat_id: chatId,
          p_sender_id: userId,
        });
      
      // Send FCM notifications asynchronously (non-blocking)
      if (NotificationService) {
        NotificationService.sendMessageNotifications(chatId, userId, message)
          .catch(err => logger.error('Message notification error:', err));
      }
      
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
   * PUT /api/chats/:chatId/messages/:messageId
   * Edit message
   */
  async editMessage(req, res) {
    try {
      const { chatId, messageId } = req.params;
      const userId = req.userId;
      const { content } = req.body;
      
      // Verify message belongs to user
      const { data: message } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('id', messageId)
        .eq('chat_id', chatId)
        .single();
      
      if (!message) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Not Found',
          message: 'Message not found',
        });
      }
      
      if (message.sender_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: 'Forbidden',
          message: 'You can only edit your own messages',
        });
      }
      
      // Update message
      const { data: updated, error } = await supabase
        .from('messages')
        .update({
          content,
          is_edited: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .select()
        .single();
      
      if (error) {
        logger.error('Edit message error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      logger.info(`Message edited: ${messageId}`);
      
      res.json({
        message: 'Message updated successfully',
        data: updated,
      });
    } catch (error) {
      logger.error('Edit message error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to edit message',
      });
    }
  }
  
  /**
   * DELETE /api/chats/:chatId/messages/:messageId
   * Delete message (soft delete - marks as deleted)
   */
  async deleteMessage(req, res) {
    try {
      const { chatId, messageId } = req.params;
      const userId = req.userId;
      
      // Verify message belongs to user
      const { data: message } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('id', messageId)
        .eq('chat_id', chatId)
        .single();
      
      if (!message) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Not Found',
          message: 'Message not found',
        });
      }
      
      if (message.sender_id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: 'Forbidden',
          message: 'You can only delete your own messages',
        });
      }
      
      // Soft delete - update content and mark as deleted
      const { error } = await supabase
        .from('messages')
        .update({
          content: 'This message was deleted',
          type: 'DELETED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', messageId);
      
      if (error) {
        logger.error('Delete message error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      logger.info(`Message deleted: ${messageId}`);
      
      res.json({
        message: 'Message deleted successfully',
        messageId,
      });
    } catch (error) {
      logger.error('Delete message error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to delete message',
      });
    }
  }
  
  /**
   * POST /api/chats/:chatId/read
   * Mark all messages in chat as read for current user
   */
  async markAsRead(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.userId;
      
      logger.debug(`Marking messages as read: ${chatId} for ${userId}`);
      
      // Call RPC function to mark messages as read
      const { error } = await supabase
        .rpc('mark_messages_as_read', {
          p_user_id: userId,
          p_chat_id: chatId,
        });
      
      if (error) {
        logger.error('Mark as read error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      logger.info(`Messages marked as read: ${chatId}`);
      
      res.json({
        message: 'Messages marked as read',
        chatId,
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
   * GET /api/chats/:chatId/members
   * Get group members with their profiles
   */
  async getGroupMembers(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.userId;
      
      // Verify user is participant
      const { data: participant } = await supabase
        .from('chat_participants')
        .select('id')
        .eq('chat_id', chatId)
        .eq('user_id', userId)
        .single();
      
      if (!participant) {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: 'Forbidden',
          message: 'You are not a member of this chat',
        });
      }
      
      // Get members with profiles
      const { data: members, error } = await supabase
        .from('chat_participants')
        .select(`
          id,
          role,
          joined_at,
          user:profiles!chat_participants_user_id_fkey(
            id,
            email,
            display_name,
            photo_url,
            is_online,
            last_seen
          )
        `)
        .eq('chat_id', chatId)
        .order('joined_at', { ascending: true });
      
      if (error) {
        logger.error('Get members error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: 'Internal Server Error',
          message: 'Failed to get members',
        });
      }
      
      res.json({
        members: members || [],
        count: members?.length || 0,
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
   * POST /api/chats/:chatId/members
   * Add member to group chat
   */
  async addGroupMember(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.userId;
      const { userId: newMemberId } = req.body;
      
      // Verify chat is a group
      const { data: chat } = await supabase
        .from('chat_rooms')
        .select('type')
        .eq('id', chatId)
        .single();
      
      if (!chat || chat.type !== 'GROUP') {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'Can only add members to group chats',
        });
      }
      
      // Verify user is admin
      const { data: participant } = await supabase
        .from('chat_participants')
        .select('role')
        .eq('chat_id', chatId)
        .eq('user_id', userId)
        .single();
      
      if (!participant || participant.role !== 'ADMIN') {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: 'Forbidden',
          message: 'Only admins can add members',
        });
      }
      
      // Add new member
      const { error } = await supabase
        .from('chat_participants')
        .insert({
          chat_id: chatId,
          user_id: newMemberId,
          role: 'MEMBER',
        });
      
      if (error) {
        if (error.code === '23505') {
          return res.status(StatusCodes.CONFLICT).json({
            error: 'Conflict',
            message: 'User is already a member',
          });
        }
        
        logger.error('Add member error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      logger.info(`Member added: ${newMemberId} to ${chatId}`);
      
      // Send notification to new member
      if (NotificationService) {
        NotificationService.sendGroupInviteNotifications(chatId, userId, [newMemberId])
          .catch(err => logger.error('Add member notification error:', err));
      }
      
      res.status(StatusCodes.CREATED).json({
        message: 'Member added successfully',
        userId: newMemberId,
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
   * DELETE /api/chats/:chatId/members/:userId
   * Remove member from group chat
   */
  async removeGroupMember(req, res) {
    try {
      const { chatId, userId: targetUserId } = req.params;
      const userId = req.userId;
      
      // Verify user is admin
      const { data: participant } = await supabase
        .from('chat_participants')
        .select('role')
        .eq('chat_id', chatId)
        .eq('user_id', userId)
        .single();
      
      if (!participant || participant.role !== 'ADMIN') {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: 'Forbidden',
          message: 'Only admins can remove members',
        });
      }
      
      // Can't remove yourself this way (use leave endpoint)
      if (targetUserId === userId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'Use leave endpoint to exit group',
        });
      }
      
      // Remove member
      const { error } = await supabase
        .from('chat_participants')
        .delete()
        .eq('chat_id', chatId)
        .eq('user_id', targetUserId);
      
      if (error) {
        logger.error('Remove member error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      logger.info(`Member removed: ${targetUserId} from ${chatId}`);
      
      res.json({
        message: 'Member removed successfully',
        userId: targetUserId,
      });
    } catch (error) {
      logger.error('Remove group member error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to remove member',
      });
    }
  }
  
  /**
   * POST /api/chats/:chatId/leave
   * Leave group chat
   */
  async leaveGroup(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.userId;
      
      // Verify chat is a group
      const { data: chat } = await supabase
        .from('chat_rooms')
        .select('type')
        .eq('id', chatId)
        .single();
      
      if (!chat || chat.type !== 'GROUP') {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'Can only leave group chats',
        });
      }
      
      // Remove user from participants
      const { error } = await supabase
        .from('chat_participants')
        .delete()
        .eq('chat_id', chatId)
        .eq('user_id', userId);
      
      if (error) {
        logger.error('Leave group error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      logger.info(`User left group: ${userId} from ${chatId}`);
      
      res.json({
        message: 'Left group successfully',
        chatId,
      });
    } catch (error) {
      logger.error('Leave group error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to leave group',
      });
    }
  }
  
  /**
   * PUT /api/chats/:chatId/members/:userId/role
   * Update member role (promote/demote admin)
   */
  async updateMemberRole(req, res) {
    try {
      const { chatId, userId: targetUserId } = req.params;
      const userId = req.userId;
      const { role } = req.body;
      
      // Verify user is admin
      const { data: participant } = await supabase
        .from('chat_participants')
        .select('role')
        .eq('chat_id', chatId)
        .eq('user_id', userId)
        .single();
      
      if (!participant || participant.role !== 'ADMIN') {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: 'Forbidden',
          message: 'Only admins can change member roles',
        });
      }
      
      // Update role
      const { error } = await supabase
        .from('chat_participants')
        .update({ role })
        .eq('chat_id', chatId)
        .eq('user_id', targetUserId);
      
      if (error) {
        logger.error('Update role error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      logger.info(`Member role updated: ${targetUserId} → ${role}`);
      
      res.json({
        message: 'Role updated successfully',
        userId: targetUserId,
        role,
      });
    } catch (error) {
      logger.error('Update member role error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to update role',
      });
    }
  }
  
  /**
   * PUT /api/chats/:chatId
   * Update chat metadata (name, photo for groups)
   */
  async updateChat(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.userId;
      const { name, photoUrl, description } = req.body;
      
      // Verify chat is a group
      const { data: chat } = await supabase
        .from('chat_rooms')
        .select('type')
        .eq('id', chatId)
        .single();
      
      if (!chat || chat.type !== 'GROUP') {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'Can only update group chats',
        });
      }
      
      // Verify user is admin
      const { data: participant } = await supabase
        .from('chat_participants')
        .select('role')
        .eq('chat_id', chatId)
        .eq('user_id', userId)
        .single();
      
      if (!participant || participant.role !== 'ADMIN') {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: 'Forbidden',
          message: 'Only admins can update group info',
        });
      }
      
      // Build update object
      const updates = {
        updated_at: new Date().toISOString(),
      };
      
      if (name !== undefined) updates.name = name;
      if (photoUrl !== undefined) updates.photo_url = photoUrl;
      if (description !== undefined) updates.description = description;
      
      // Update chat
      const { data: updated, error } = await supabase
        .from('chat_rooms')
        .update(updates)
        .eq('id', chatId)
        .select()
        .single();
      
      if (error) {
        logger.error('Update chat error:', error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
      
      logger.info(`Chat updated: ${chatId}`);
      
      res.json({
        message: 'Chat updated successfully',
        chat: updated,
      });
    } catch (error) {
      logger.error('Update chat error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to update chat',
      });
    }
  }
}

module.exports = new ChatController();
