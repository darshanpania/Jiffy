# 📡 JIFFY Backend API Documentation

**Version:** 1.0.0  
**Base URL:** `https://your-app.railway.app`  
**Authentication:** Bearer Token (Supabase JWT)

---

## 🔐 Authentication

All endpoints (except `/health`) require authentication.

### Headers
```http
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json
```

---

## 📡 Endpoints

### Health Check

#### GET /health

Check server health status (no auth required).

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-06T15:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

---

## 🔑 Authentication Endpoints

### POST /api/auth/verify

Verify JWT token validity.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "authenticated"
  }
}
```

### POST /api/auth/refresh

Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "refresh-token-here"
}
```

**Response:**
```json
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token",
  "expiresIn": 3600
}
```

### GET /api/auth/me

Get current authenticated user profile.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "display_name": "John Doe",
  "photo_url": "https://...",
  "bio": "Love GIFs!",
  "is_online": true,
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

## 👥 User Endpoints

### GET /api/users/profile/:userId

Get user profile by ID.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "display_name": "John Doe",
  "photo_url": "https://...",
  "bio": "Love GIFs!",
  "is_online": true,
  "last_seen": "2026-02-06T15:00:00Z"
}
```

### PUT /api/users/profile

Update current user's profile.

**Request:**
```json
{
  "displayName": "Jane Doe",
  "bio": "GIF enthusiast",
  "photoUrl": "https://..."
}
```

**Response:**
```json
{
  "id": "uuid",
  "display_name": "Jane Doe",
  "bio": "GIF enthusiast",
  "photo_url": "https://...",
  "updated_at": "2026-02-06T15:00:00Z"
}
```

### GET /api/users/search

Search users using PostgreSQL full-text search.

**Query Parameters:**
- `q` (required): Search query
- `limit` (optional, default: 20): Results per page
- `offset` (optional, default: 0): Pagination offset

**Example:**
```http
GET /api/users/search?q=john&limit=10&offset=0
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "email": "john@example.com",
      "display_name": "John Doe",
      "photo_url": "https://...",
      "bio": "...",
      "is_online": true
    }
  ],
  "count": 1,
  "offset": 0,
  "limit": 10
}
```

### POST /api/users/presence

Update user's online/offline status.

**Request:**
```json
{
  "isOnline": true
}
```

**Response:**
```json
{
  "message": "Presence updated",
  "isOnline": true
}
```

### GET /api/users/friends

Get user's friends list.

**Response:**
```json
{
  "friends": [
    {
      "id": "uuid",
      "display_name": "Friend Name",
      "photo_url": "https://...",
      "is_online": true,
      "last_seen": "2026-02-06T14:00:00Z"
    }
  ],
  "count": 15
}
```

### POST /api/users/fcm-token

Update user's FCM token for push notifications.

**Request:**
```json
{
  "token": "fcm-token-here",
  "deviceType": "android"
}
```

**Response:**
```json
{
  "message": "FCM token updated successfully"
}
```

---

## 💬 Chat Endpoints

### GET /api/chats

Get all chats for current user.

**Response:**
```json
{
  "chats": [
    {
      "chat_id": "uuid",
      "chat_type": "DIRECT",
      "chat_name": "John Doe",
      "chat_photo": "https://...",
      "last_message": {...},
      "unread_count": 3,
      "updated_at": "2026-02-06T15:00:00Z"
    }
  ],
  "count": 10
}
```

### POST /api/chats/direct

Get or create direct chat with another user.

**Request:**
```json
{
  "otherUserId": "uuid"
}
```

**Response:**
```json
{
  "chatId": "uuid"
}
```

### POST /api/chats/group

Create a group chat.

**Request:**
```json
{
  "name": "Team GIFs",
  "memberIds": ["uuid1", "uuid2", "uuid3"],
  "description": "Our awesome group",
  "photoUrl": "https://..."
}
```

**Response:**
```json
{
  "groupId": "uuid",
  "message": "Group created successfully"
}
```

### GET /api/chats/:chatId/messages

Get messages for a chat.

**Query Parameters:**
- `limit` (optional, default: 50): Messages per page
- `offset` (optional, default: 0): Pagination offset

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "chat_id": "uuid",
      "sender_id": "uuid",
      "content": "Hello!",
      "type": "TEXT",
      "status": "READ",
      "created_at": "2026-02-06T15:00:00Z",
      "sender": {
        "id": "uuid",
        "display_name": "John",
        "photo_url": "https://..."
      }
    }
  ],
  "count": 20,
  "offset": 0,
  "limit": 50
}
```

### POST /api/chats/:chatId/messages

Send a message in a chat.

**Request:**
```json
{
  "content": "Check out this GIF!",
  "type": "TEXT"
}
```

**For GIF messages:**
```json
{
  "content": "https://media.giphy.com/media/xyz/giphy.gif",
  "type": "GIF"
}
```

**Response:**
```json
{
  "id": "uuid",
  "chat_id": "uuid",
  "sender_id": "uuid",
  "content": "Check out this GIF!",
  "type": "TEXT",
  "status": "SENT",
  "created_at": "2026-02-06T15:00:00Z",
  "sender": {...}
}
```

**Note:** Automatically sends FCM notifications to all chat participants.

### POST /api/chats/:chatId/read

Mark all messages in a chat as read.

**Response:**
```json
{
  "message": "Messages marked as read"
}
```

---

## 🎬 GIF Endpoints

### GET /api/gifs/search

Search GIFs from GIPHY or Tenor.

**Query Parameters:**
- `q` (required): Search query
- `source` (optional, default: 'giphy'): 'giphy' or 'tenor'
- `limit` (optional, default: 25): Results limit
- `offset` (optional, default: 0): Pagination offset

**Example:**
```http
GET /api/gifs/search?q=happy+cat&source=giphy&limit=25
```

**Response:**
```json
{
  "results": [
    {
      "id": "abc123",
      "title": "Happy Cat",
      "url": "https://media.giphy.com/media/abc123/giphy.gif",
      "previewUrl": "https://media.giphy.com/media/abc123/200.gif",
      "thumbnailUrl": "https://media.giphy.com/media/abc123/100.gif",
      "width": 480,
      "height": 270,
      "source": "GIPHY"
    }
  ],
  "count": 25,
  "source": "giphy",
  "query": "happy cat"
}
```

### GET /api/gifs/trending

Get trending GIFs.

**Query Parameters:**
- `source` (optional, default: 'giphy'): 'giphy' or 'tenor'
- `limit` (optional, default: 25): Results limit

**Response:**
```json
{
  "results": [...],
  "count": 25,
  "source": "giphy"
}
```

### GET /api/gifs/categories

Get GIF categories.

**Query Parameters:**
- `source` (optional, default: 'giphy'): 'giphy' or 'tenor'

**Response:**
```json
{
  "categories": [
    {
      "name": "Reactions",
      "nameEncoded": "reactions"
    },
    {
      "name": "Entertainment",
      "nameEncoded": "entertainment"
    }
  ],
  "source": "giphy"
}
```

### POST /api/gifs/favorites

Save a GIF to favorites.

**Request:**
```json
{
  "gifId": "abc123",
  "gifUrl": "https://media.giphy.com/media/abc123/giphy.gif",
  "source": "giphy",
  "title": "Happy Cat",
  "thumbnailUrl": "https://..."
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "gif_id": "abc123",
  "gif_url": "https://...",
  "gif_source": "GIPHY",
  "title": "Happy Cat",
  "created_at": "2026-02-06T15:00:00Z"
}
```

### GET /api/gifs/favorites

Get user's favorite GIFs.

**Query Parameters:**
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Response:**
```json
{
  "favorites": [...],
  "count": 15
}
```

### DELETE /api/gifs/favorites/:favoriteId

Remove a favorite GIF.

**Response:**
```json
{
  "message": "Favorite removed"
}
```

---

## 🔔 Notification Endpoints

### POST /api/notifications/send

Send push notification to a single user via FCM.

**Request:**
```json
{
  "userId": "uuid",
  "title": "New Message",
  "body": "You have a new message!",
  "data": {
    "type": "message",
    "chat_id": "uuid"
  }
}
```

**Response:**
```json
{
  "message": "Notification sent",
  "sentCount": 2
}
```

### POST /api/notifications/send-multi

Send notification to multiple users.

**Request:**
```json
{
  "userIds": ["uuid1", "uuid2", "uuid3"],
  "title": "Group Update",
  "body": "You were added to a group",
  "data": {
    "type": "group_invite",
    "group_id": "uuid"
  }
}
```

**Response:**
```json
{
  "message": "Notifications sent",
  "sentCount": 3,
  "failedCount": 0
}
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request data",
  "details": [...]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid authorization header"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again later."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

---

## 📋 Rate Limits

- **Default:** 100 requests per 15 minutes per IP
- **Applies to:** All `/api/*` endpoints
- **Excludes:** `/health` endpoint

**Headers in Response:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## 🔄 Pagination

All list endpoints support pagination:

**Query Parameters:**
- `limit`: Items per page (max 100)
- `offset`: Number of items to skip

**Example:**
```http
GET /api/users/search?q=john&limit=20&offset=40
```

Returns items 41-60.

---

## 📊 Response Format

### Success Response
```json
{
  "data": {...},
  "message": "Success",
  "timestamp": "2026-02-06T15:00:00Z"
}
```

### List Response
```json
{
  "results": [...],
  "count": 25,
  "offset": 0,
  "limit": 25,
  "total": 100
}
```

---

## 🔒 Security

### Authentication Flow

1. User signs in via Android app (Supabase Auth)
2. Supabase returns JWT token
3. Android app includes token in API requests:
   ```http
   Authorization: Bearer <jwt-token>
   ```
4. Backend validates token with Supabase
5. Request proceeds if valid

### Data Access

- **Row Level Security (RLS)** enforced in Supabase
- Backend uses **service key** for admin operations
- User can only access their own data
- PostgreSQL policies enforce permissions

---

## 🐛 Testing

### Using cURL

```bash
# Set your token
TOKEN="your-supabase-jwt-token"

# Test search
curl -X GET "https://your-app.railway.app/api/users/search?q=john" \
  -H "Authorization: Bearer $TOKEN"

# Test send message
curl -X POST "https://your-app.railway.app/api/chats/uuid/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello!", "type": "TEXT"}'
```

### Using Postman

Import the Postman collection:
```
backend/postman/JIFFY_API.postman_collection.json
```

---

## 📦 Caching

### Cached Endpoints

- **GIF Search:** 10 minutes
- **Trending GIFs:** 10 minutes
- **Categories:** 1 hour

### Cache Headers

```http
X-Cache: HIT
```

Indicates response served from cache.

---

## 📞 Support

**Questions or issues?**
- GitHub: [Issues](https://github.com/darshanpania/jiffy/issues)
- Email: dev@jiffy.app

---

**Last Updated:** February 6, 2026  
**API Version:** 1.0.0
