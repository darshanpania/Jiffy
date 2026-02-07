const request = require('supertest');
const app = require('../../../src/server');
const supabase = require('../../../src/config/supabase');

// Mock Supabase
jest.mock('../../../src/config/supabase');
jest.mock('../../../src/services/notification.service');

describe('ChatController', () => {
  const validToken = 'Bearer test-jwt-token';
  const testUserId = 'test-user-uuid';
  const testChatId = 'test-chat-uuid';
  const testMessageId = 'test-message-uuid';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/chats', () => {
    it('should return user chats successfully', async () => {
      const mockChats = [
        {
          chat_id: testChatId,
          chat_type: 'DIRECT',
          chat_name: 'Alice Johnson',
          unread_count: 3,
        },
      ];

      supabase.rpc.mockResolvedValue({
        data: mockChats,
        error: null,
      });

      const res = await request(app)
        .get('/api/chats')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.chats).toEqual(mockChats);
      expect(res.body.count).toBe(1);
    });

    it('should handle RPC function errors', async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC error' },
      });

      const res = await request(app)
        .get('/api/chats')
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(500);
    });
  });

  describe('POST /api/chats/direct', () => {
    it('should create direct chat successfully', async () => {
      supabase.rpc.mockResolvedValue({
        data: testChatId,
        error: null,
      });

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { created_at: new Date().toISOString() },
          error: null,
        }),
      });

      const res = await request(app)
        .post('/api/chats/direct')
        .set('Authorization', validToken)
        .send({ otherUserId: 'other-user-uuid' });

      expect(res.statusCode).toBeOneOf([200, 201]);
      expect(res.body.chatId).toBe(testChatId);
    });

    it('should reject creating chat with self', async () => {
      const res = await request(app)
        .post('/api/chats/direct')
        .set('Authorization', validToken)
        .send({ otherUserId: testUserId });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('yourself');
    });

    it('should validate UUID format', async () => {
      const res = await request(app)
        .post('/api/chats/direct')
        .set('Authorization', validToken)
        .send({ otherUserId: 'invalid-id' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/chats/group', () => {
    it('should create group chat successfully', async () => {
      const groupId = 'new-group-uuid';
      
      supabase.rpc.mockResolvedValue({
        data: groupId,
        error: null,
      });

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: groupId,
            type: 'GROUP',
            name: 'Test Group',
          },
          error: null,
        }),
      });

      const res = await request(app)
        .post('/api/chats/group')
        .set('Authorization', validToken)
        .send({
          name: 'Test Group',
          memberIds: ['uuid1', 'uuid2'],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.groupId).toBe(groupId);
    });

    it('should validate group name length', async () => {
      const res = await request(app)
        .post('/api/chats/group')
        .set('Authorization', validToken)
        .send({
          name: 'AB',
          memberIds: ['uuid1'],
        });

      expect(res.statusCode).toBe(400);
    });

    it('should validate memberIds is array', async () => {
      const res = await request(app)
        .post('/api/chats/group')
        .set('Authorization', validToken)
        .send({
          name: 'Test Group',
          memberIds: 'not-an-array',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/chats/:chatId/messages', () => {
    it('should return messages successfully', async () => {
      const mockMessages = [
        {
          id: testMessageId,
          content: 'Hello!',
          type: 'TEXT',
          sender: { display_name: 'Alice' },
        },
      ];

      // Mock participant check
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'participant-id' },
          error: null,
        }),
      });

      // Mock messages query
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockMessages,
          error: null,
          count: 1,
        }),
      });

      const res = await request(app)
        .get(`/api/chats/${testChatId}/messages`)
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.messages).toEqual(mockMessages);
    });

    it('should reject non-participant access', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      const res = await request(app)
        .get(`/api/chats/${testChatId}/messages`)
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(403);
    });

    it('should validate pagination parameters', async () => {
      const res = await request(app)
        .get(`/api/chats/${testChatId}/messages?limit=200`)
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/chats/:chatId/messages', () => {
    it('should send message successfully', async () => {
      const mockMessage = {
        id: testMessageId,
        content: 'Hello!',
        type: 'TEXT',
        status: 'SENT',
      };

      // Mock participant check
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'participant-id' },
          error: null,
        }),
      });

      // Mock message insert
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMessage,
          error: null,
        }),
      });

      // Mock chat update
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      // Mock unread count increment
      supabase.rpc.mockResolvedValue({ error: null });

      const res = await request(app)
        .post(`/api/chats/${testChatId}/messages`)
        .set('Authorization', validToken)
        .send({
          content: 'Hello!',
          type: 'TEXT',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(mockMessage);
    });

    it('should validate message content length', async () => {
      const res = await request(app)
        .post(`/api/chats/${testChatId}/messages`)
        .set('Authorization', validToken)
        .send({
          content: 'x'.repeat(5001),
          type: 'TEXT',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should validate message type', async () => {
      const res = await request(app)
        .post(`/api/chats/${testChatId}/messages`)
        .set('Authorization', validToken)
        .send({
          content: 'Hello',
          type: 'INVALID_TYPE',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/chats/:chatId/read', () => {
    it('should mark messages as read', async () => {
      supabase.rpc.mockResolvedValue({ error: null });

      const res = await request(app)
        .post(`/api/chats/${testChatId}/read`)
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('marked as read');
    });
  });

  describe('GET /api/chats/:chatId/members', () => {
    it('should return group members', async () => {
      const mockMembers = [
        {
          id: 'participant-uuid',
          role: 'ADMIN',
          user: { display_name: 'Alice' },
        },
      ];

      // Mock participant check
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'participant-id' },
          error: null,
        }),
      });

      // Mock members query
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockMembers,
          error: null,
        }),
      });

      const res = await request(app)
        .get(`/api/chats/${testChatId}/members`)
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.members).toEqual(mockMembers);
    });
  });

  describe('POST /api/chats/:chatId/members', () => {
    it('should add member to group', async () => {
      // Mock chat type check
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { type: 'GROUP' },
          error: null,
        }),
      });

      // Mock admin check
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'ADMIN' },
          error: null,
        }),
      });

      // Mock member insert
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      const res = await request(app)
        .post(`/api/chats/${testChatId}/members`)
        .set('Authorization', validToken)
        .send({ userId: 'new-member-uuid' });

      expect(res.statusCode).toBe(201);
    });

    it('should reject non-admin adding members', async () => {
      // Mock chat type check
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { type: 'GROUP' },
          error: null,
        }),
      });

      // Mock non-admin user
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'MEMBER' },
          error: null,
        }),
      });

      const res = await request(app)
        .post(`/api/chats/${testChatId}/members`)
        .set('Authorization', validToken)
        .send({ userId: 'new-member-uuid' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /api/chats/:chatId/leave', () => {
    it('should allow leaving group', async () => {
      // Mock chat type check
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { type: 'GROUP' },
          error: null,
        }),
      });

      // Mock delete participant
      supabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const res = await request(app)
        .post(`/api/chats/${testChatId}/leave`)
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
    });

    it('should reject leaving direct chat', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { type: 'DIRECT' },
          error: null,
        }),
      });

      const res = await request(app)
        .post(`/api/chats/${testChatId}/leave`)
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/chats/:chatId/messages/:messageId', () => {
    it('should edit own message', async () => {
      // Mock message ownership check
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { sender_id: testUserId },
          error: null,
        }),
      });

      // Mock message update
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { content: 'Updated', is_edited: true },
          error: null,
        }),
      });

      const res = await request(app)
        .put(`/api/chats/${testChatId}/messages/${testMessageId}`)
        .set('Authorization', validToken)
        .send({ content: 'Updated' });

      expect(res.statusCode).toBe(200);
    });

    it('should reject editing others messages', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { sender_id: 'different-user' },
          error: null,
        }),
      });

      const res = await request(app)
        .put(`/api/chats/${testChatId}/messages/${testMessageId}`)
        .set('Authorization', validToken)
        .send({ content: 'Updated' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/chats/:chatId/messages/:messageId', () => {
    it('should delete own message', async () => {
      // Mock ownership check
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { sender_id: testUserId },
          error: null,
        }),
      });

      // Mock delete
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const res = await request(app)
        .delete(`/api/chats/${testChatId}/messages/${testMessageId}`)
        .set('Authorization', validToken);

      expect(res.statusCode).toBe(200);
    });
  });

  describe('PUT /api/chats/:chatId/members/:userId/role', () => {
    it('should update member role as admin', async () => {
      // Mock admin check
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'ADMIN' },
          error: null,
        }),
      });

      // Mock role update
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const res = await request(app)
        .put(`/api/chats/${testChatId}/members/member-uuid/role`)
        .set('Authorization', validToken)
        .send({ role: 'ADMIN' });

      expect(res.statusCode).toBe(200);
    });

    it('should reject invalid role', async () => {
      const res = await request(app)
        .put(`/api/chats/${testChatId}/members/member-uuid/role`)
        .set('Authorization', validToken)
        .send({ role: 'INVALID' });

      expect(res.statusCode).toBe(400);
    });
  });
});

// Custom matcher for multiple possible status codes
expect.extend({
  toBeOneOf(received, array) {
    const pass = array.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${array}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${array}`,
        pass: false,
      };
    }
  },
});
