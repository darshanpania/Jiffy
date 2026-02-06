export interface User {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  bio?: string;
  phoneNumber?: string;
  isOnline: boolean;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'GIF' | 'IMAGE';
  status: 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  deletedAt?: string;
  replyTo?: string;
}

export interface ChatRoom {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name?: string;
  description?: string;
  photoUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  chatId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  unreadCount: number;
  lastReadAt?: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  createdAt: string;
}

export interface GifItem {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  source: 'GIPHY' | 'TENOR';
}

export interface FavoriteGif {
  id: string;
  userId: string;
  gifId: string;
  gifUrl: string;
  gifSource: 'GIPHY' | 'TENOR';
  title: string;
  thumbnailUrl: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}