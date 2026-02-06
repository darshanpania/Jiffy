import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import notificationService from './notification.service';

export class FriendService {
  /**
   * Send friend request
   */
  async sendFriendRequest(senderId: string, receiverId: string) {
    try {
      // Check if already friends
      const { data: existingFriendship } = await supabaseAdmin
        .from('friendships')
        .select('id')
        .or(`and(user_id.eq.${senderId},friend_id.eq.${receiverId}),and(user_id.eq.${receiverId},friend_id.eq.${senderId})`)
        .single();

      if (existingFriendship) {
        throw new AppError('Already friends with this user', 400);
      }

      // Check for existing pending request
      const { data: existingRequest } = await supabaseAdmin
        .from('friend_requests')
        .select('id, status')
        .eq('sender_id', senderId)
        .eq('receiver_id', receiverId)
        .single();

      if (existingRequest && existingRequest.status === 'PENDING') {
        throw new AppError('Friend request already sent', 400);
      }

      // Create friend request
      const { data, error } = await supabaseAdmin
        .from('friend_requests')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          status: 'PENDING',
        })
        .select()
        .single();

      if (error) {
        logger.error('Send friend request failed:', error);
        throw new AppError('Failed to send friend request', 500);
      }

      // Send FCM notification
      await notificationService.sendFriendRequestNotification(receiverId, senderId);

      logger.info(`Friend request sent from ${senderId} to ${receiverId}`);
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Accept friend request
   */
  async acceptFriendRequest(requestId: string, receiverId: string) {
    try {
      // Update request status to ACCEPTED
      const { data: request, error } = await supabaseAdmin
        .from('friend_requests')
        .update({ status: 'ACCEPTED', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('receiver_id', receiverId)
        .eq('status', 'PENDING')
        .select()
        .single();

      if (error || !request) {
        throw new AppError('Friend request not found or already processed', 404);
      }

      // Friendship is created automatically by PostgreSQL trigger
      // (See database/schema.sql - create_friendship_on_accept trigger)

      logger.info(`Friend request ${requestId} accepted`);
      return request;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Decline friend request
   */
  async declineFriendRequest(requestId: string, receiverId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('friend_requests')
        .update({ status: 'DECLINED', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('receiver_id', receiverId)
        .eq('status', 'PENDING')
        .select()
        .single();

      if (error || !data) {
        throw new AppError('Friend request not found', 404);
      }

      logger.info(`Friend request ${requestId} declined`);
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get pending friend requests
   */
  async getPendingRequests(userId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('friend_requests')
        .select(`
          *,
          sender:profiles!friend_requests_sender_id_fkey(
            id,
            display_name,
            photo_url,
            bio
          )
        `)
        .eq('receiver_id', userId)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      if (error) {
        throw new AppError('Failed to fetch friend requests', 500);
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get suggested friends (mutual connections)
   */
  async getSuggestedFriends(userId: string, limit: number = 10) {
    try {
      const { data, error } = await supabaseAdmin
        .rpc('get_suggested_friends', {
          p_user_id: userId,
          p_limit: limit,
        });

      if (error) {
        throw new AppError('Failed to fetch suggested friends', 500);
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Unfriend user
   */
  async unfriend(userId: string, friendId: string) {
    try {
      // Delete bidirectional friendship
      const { error } = await supabaseAdmin
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

      if (error) {
        throw new AppError('Failed to unfriend user', 500);
      }

      logger.info(`Users ${userId} and ${friendId} are no longer friends`);
    } catch (error) {
      throw error;
    }
  }
}

export default new FriendService();