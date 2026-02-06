/**
 * Application Constants
 */

module.exports = {
  // Message types
  MESSAGE_TYPES: {
    TEXT: 'TEXT',
    GIF: 'GIF',
    IMAGE: 'IMAGE',
  },
  
  // Message status
  MESSAGE_STATUS: {
    SENDING: 'SENDING',
    SENT: 'SENT',
    DELIVERED: 'DELIVERED',
    READ: 'READ',
    FAILED: 'FAILED',
  },
  
  // Chat types
  CHAT_TYPES: {
    DIRECT: 'DIRECT',
    GROUP: 'GROUP',
  },
  
  // User roles
  USER_ROLES: {
    MEMBER: 'MEMBER',
    ADMIN: 'ADMIN',
  },
  
  // Friend request status
  FRIEND_REQUEST_STATUS: {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    DECLINED: 'DECLINED',
    CANCELLED: 'CANCELLED',
  },
  
  // GIF sources
  GIF_SOURCES: {
    GIPHY: 'GIPHY',
    TENOR: 'TENOR',
  },
  
  // Notification types
  NOTIFICATION_TYPES: {
    MESSAGE: 'message',
    FRIEND_REQUEST: 'friend_request',
    GROUP_INVITE: 'group_invite',
    MENTION: 'mention',
  },
  
  // Limits
  LIMITS: {
    MAX_MESSAGE_LENGTH: 5000,
    MAX_GROUP_MEMBERS: 100,
    MAX_GROUPS_PER_USER: 50,
    MAX_FRIEND_REQUESTS: 50,
    MAX_DISPLAY_NAME_LENGTH: 30,
    MIN_DISPLAY_NAME_LENGTH: 3,
    MAX_BIO_LENGTH: 150,
  },
  
  // HTTP Status Codes (using http-status-codes package)
  // See: require('http-status-codes').StatusCodes
};
