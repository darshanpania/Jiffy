# 📡 JIFFY Backend API Documentation

**Base URL:** `https://api.jiffy.app/api/v1` (Production)  
**Base URL:** `http://localhost:3000/api/v1` (Development)

---

## 🔐 Authentication

All API endpoints require authentication except `/health`.

### Authentication Header

```http
Authorization: Bearer <supabase-jwt-token>
```

### How to Get Token

1. **Android App:** Get token from Supabase Auth after Google/Apple Sign-In
2. **Testing:** Use Supabase Dashboard to generate test token

**Example:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     http://localhost:3000/api/v1/users/me
```

---

## 👤 User Endpoints

### Get Current User Profile

```http
GET /api/v1/users/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "John Doe",
    "photo_url": "https://...",
    "bio": "Love GIFs!",
    "is_online": true,
    "created_at": "2026-02-06T10:00:00Z"
  }
}
```

### Update Profile

```http
PUT /api/v1/users/me
Content-Type: application/json

{
  "displayName": "John Doe Updated",
  "bio": "New bio",
  "phoneNumber": "+1234567890"
}
```

### Search Users

```http
GET /api/v1/users/search?q=john&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "display_name": "John Doe",
      "email": "john@example.com",
      "photo_url": "https://...",
      "is_online": true
    }
  ]
}
```

### Get Friends List

```http
GET /api/v1/users/me/friends
```

### Update Online Status

```http
PUT /api/v1/users/me/status
Content-Type: application/json

{
  "isOnline": true
}
```

---

## 💬 Chat Endpoints

### Get All Chats

```http
GET /api/v1/chats
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "chat_id": "uuid",
      "chat_type": "DIRECT",
      "chat_name": "Jane Doe",
      "last_message": {
        "content": "Hey! 👋",
        "created_at": "2026-02-06T10:00:00Z"
      },
      "unread_count": 3
    }
  ]
}
```

### Create/Get Direct Chat

```http
POST /api/v1/chats/direct
Content-Type: application/json

{
  "userId": "friend-user-id"
}
```

### Create Group Chat

```http
POST /api/v1/chats/group
Content-Type: application/json

{
  "name": "My Group",
  "description": "Group for friends",
  "memberIds": ["user-id-1", "user-id-2"]
}
```

### Get Messages

```http
GET /api/v1/chats/:chatId/messages?page=1&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "chat_id": "uuid",
        "sender_id": "uuid",
        "content": "Hello!",
        "type": "TEXT",
        "status": "READ",
        "created_at": "2026-02-06T10:00:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 50,
    "hasMore": true
  }
}
```

### Send Message

```http
POST /api/v1/chats/:chatId/messages
Content-Type: application/json

{
  "chatId": "chat-uuid",
  "content": "Hey there!",
  "type": "TEXT"
}
```

### Send GIF Message

```http
POST /api/v1/chats/:chatId/messages
Content-Type: application/json

{
  "chatId": "chat-uuid",
  "content": "https://media.giphy.com/media/...",
  "type": "GIF"
}
```

### Mark Messages as Read

```http
PUT /api/v1/chats/:chatId/read
```

### Add Group Member

```http
POST /api/v1/chats/:chatId/members
Content-Type: application/json

{
  "userId": "user-to-add-id"
}
```

### Remove Group Member

```http
DELETE /api/v1/chats/:chatId/members/:userId
```

---

## 🎬 GIF Endpoints

### Search GIFs - GIPHY

```http
GET /api/v1/gifs/search/giphy?q=funny+cat&limit=25&offset=0
```

**Response:**
```json
{
  "success": true,
  "source": "GIPHY",
  "data": [
    {
      "id": "giphy-id",
      "title": "Funny Cat GIF",
      "url": "https://media.giphy.com/media/.../giphy.gif",
      "previewUrl": "https://media.giphy.com/media/.../200.gif",
      "thumbnailUrl": "https://media.giphy.com/media/.../100.gif",
      "width": 480,
      "height": 270,
      "source": "GIPHY"
    }
  ]
}
```

### Search GIFs - Tenor

```http
GET /api/v1/gifs/search/tenor?q=funny+cat&limit=25
```

### Trending GIFs - GIPHY

```http
GET /api/v1/gifs/trending/giphy?limit=25
```

### Trending GIFs - Tenor

```http
GET /api/v1/gifs/trending/tenor?limit=25
```

### Save Favorite GIF

```http
POST /api/v1/gifs/favorites
Content-Type: application/json

{
  "id": "gif-id",
  "title": "Funny Cat",
  "url": "https://...",
  "previewUrl": "https://...",
  "thumbnailUrl": "https://...",
  "width": 480,
  "height": 270,
  "source": "GIPHY"
}
```

### Get Favorite GIFs

```http
GET /api/v1/gifs/favorites
```

---

## 🔔 Notification Endpoints

### Register FCM Token

```http
POST /api/v1/auth/register-fcm-token
Content-Type: application/json

{
  "fcmToken": "firebase-token-here",
  "deviceType": "android"
}
```

### Send Test Notification

```http
POST /api/v1/notifications/test
```

---

## ❤️‍🩹 Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-06T15:00:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "supabase": "connected"
}
```

---

## ⚠️ Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid auth token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## 📈 Rate Limiting

### Global Rate Limit
- **100 requests per 15 minutes** per IP
- Applies to all `/api/v1/*` endpoints

### Strict Rate Limit (GIF Search)
- **10 requests per minute** per IP
- Applies to GIF search endpoints

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## 📑 Pagination

### Query Parameters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasMore": true
  }
}
```

---

## 🐛 Testing APIs

### Using cURL

```bash
# Health check
curl http://localhost:3000/health

# Get user profile (requires token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v1/users/me

# Search GIFs from GIPHY
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:3000/api/v1/gifs/search/giphy?q=cat&limit=10"
```

### Using Postman

1. Import collection from `/docs/postman-collection.json` (create this)
2. Set `Authorization` header with Bearer token
3. Test endpoints

---

## 🛠️ Development

### Run Locally

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run in development mode
npm run dev

# Server runs on http://localhost:3000
```

### Run with Docker

```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down
```

---

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

---

## 📊 Monitoring

### Logs

- **Development:** Console output
- **Production:** `logs/combined.log` and `logs/error.log`

### Metrics

- Health check: `/health`
- Uptime monitoring via Railway
- Error tracking via Winston logs

---

## 🔒 Security

### Best Practices

1. **Never expose service keys** - Use environment variables
2. **Validate all inputs** - Joi validation enabled
3. **Rate limiting** - Prevents abuse
4. **HTTPS only** - Use Railway's SSL
5. **Helmet headers** - Security headers enabled
6. **CORS configured** - Only allow trusted origins

---

## 📚 Additional Resources

- [Supabase API Reference](https://supabase.com/docs/reference/javascript)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [GIPHY API Docs](https://developers.giphy.com/docs/api/)
- [Tenor API Docs](https://developers.google.com/tenor)

---

**Last Updated:** February 6, 2026