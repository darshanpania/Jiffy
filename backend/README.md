# 🚀 JIFFY Backend API

**Node.js/Express backend for JIFFY GIF Messenger**

---

## 📊 Overview

RESTful API backend for JIFFY that integrates with:
- **Supabase** - PostgreSQL database, Auth, Realtime, Storage
- **Firebase Cloud Messaging** - Push notifications ONLY
- **GIPHY API** - GIF content provider #1
- **Tenor API** - GIF content provider #2
- **Railway** - Deployment platform

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth (JWT)
- **Push Notifications:** Firebase Admin SDK (FCM)
- **Caching:** node-cache
- **Logging:** Winston
- **Deployment:** Railway with Docker

---

## 📂 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── config.js           # Environment configuration
│   │   ├── logger.js           # Winston logger setup
│   │   ├── supabase.js         # Supabase client
│   │   └── firebase.js         # Firebase Admin SDK (FCM)
│   ├── controllers/
│   │   ├── auth.controller.js  # Authentication endpoints
│   │   ├── user.controller.js  # User management
│   │   ├── chat.controller.js  # Chat/messaging
│   │   ├── gif.controller.js   # GIF operations
│   │   └── notification.controller.js  # Push notifications
│   ├── middleware/
│   │   ├── auth.middleware.js  # JWT verification
│   │   ├── error.middleware.js # Error handling
│   │   └── validator.middleware.js  # Request validation
│   ├── routes/
│   │   ├── auth.routes.js      # Auth routes
│   │   ├── user.routes.js      # User routes
│   │   ├── chat.routes.js      # Chat routes
│   │   ├── gif.routes.js       # GIF routes
│   │   └── notification.routes.js  # Notification routes
│   ├── services/
│   │   ├── giphy.service.js    # GIPHY API integration
│   │   ├── tenor.service.js    # Tenor API integration
│   │   └── notification.service.js  # FCM service
│   ├── utils/
│   │   └── helpers.js          # Utility functions
│   └── server.js               # Main server file
├── logs/                       # Log files
├── .env.example                # Environment variables template
├── .dockerignore
├── Dockerfile                  # Docker configuration
├── railway.json                # Railway deployment config
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Firebase project (for FCM)
- GIPHY API key
- Tenor API key

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your API keys
vim .env

# Start development server
npm run dev
```

### Environment Setup

Edit `.env` file with your credentials:

```env
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key

# Firebase (FCM only)
FCM_PROJECT_ID=your-firebase-project
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FCM_CLIENT_EMAIL=firebase-adminsdk@....iam.gserviceaccount.com

# APIs
GIPHY_API_KEY=your-giphy-key
TENOR_API_KEY=your-tenor-key
```

---

## 📡 API Endpoints

### Health Check
```http
GET /health
```
Returns server health status (no auth required)

### Authentication
```http
POST /api/auth/verify          # Verify JWT token
POST /api/auth/refresh         # Refresh session
POST /api/auth/signout         # Sign out
GET  /api/auth/me              # Get current user
```

### Users
```http
GET  /api/users/profile/:userId     # Get user profile
PUT  /api/users/profile             # Update profile
GET  /api/users/search?q=query      # Search users (PostgreSQL FTS)
POST /api/users/presence            # Update online status
GET  /api/users/friends             # Get friends list
POST /api/users/fcm-token           # Update FCM token
```

### Chats
```http
GET    /api/chats                      # Get user's chats
POST   /api/chats/direct               # Get or create direct chat
POST   /api/chats/group                # Create group chat
GET    /api/chats/:chatId/messages     # Get messages
POST   /api/chats/:chatId/messages     # Send message
POST   /api/chats/:chatId/read         # Mark as read
GET    /api/chats/:chatId/members      # Get group members
POST   /api/chats/:chatId/members      # Add group member
DELETE /api/chats/:chatId/members/:id  # Remove member
```

### GIFs
```http
GET    /api/gifs/search?q=cat&source=giphy   # Search GIFs
GET    /api/gifs/trending?source=tenor        # Trending GIFs
GET    /api/gifs/categories                   # GIF categories
POST   /api/gifs/favorites                    # Save favorite
GET    /api/gifs/favorites                    # Get favorites
DELETE /api/gifs/favorites/:id                # Remove favorite
```

### Notifications
```http
POST /api/notifications/send        # Send to single user
POST /api/notifications/send-multi  # Send to multiple users
POST /api/notifications/test        # Test notification (dev only)
```

---

## 🔐 Authentication

All endpoints (except `/health` and `/api/auth/*`) require authentication.

**Authorization Header:**
```http
Authorization: Bearer <supabase-jwt-token>
```

The backend validates JWT tokens with Supabase Auth.

---

## 📦 API Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error Type",
  "message": "Error description",
  "timestamp": "2026-02-06T15:00:00.000Z"
}
```

---

## 🐛 Example Requests

### Search Users
```bash
curl -X GET "http://localhost:3000/api/users/search?q=john" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Send Message
```bash
curl -X POST "http://localhost:3000/api/chats/{chatId}/messages" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello!",
    "type": "TEXT"
  }'
```

### Search GIFs
```bash
curl -X GET "http://localhost:3000/api/gifs/search?q=happy&source=giphy" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔥 Firebase Cloud Messaging (FCM)

### Setup FCM

1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Generate new private key
4. Save JSON file securely
5. Extract values for `.env`:

```env
FCM_PROJECT_ID=your-project-id
FCM_PRIVATE_KEY_ID=key-id-from-json
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FCM_CLIENT_EMAIL=firebase-adminsdk@...iam.gserviceaccount.com
FCM_CLIENT_ID=client-id-from-json
```

### Notification Payload Structure

```json
{
  "notification": {
    "title": "New Message",
    "body": "John: Hey there!"
  },
  "data": {
    "type": "message",
    "chat_id": "uuid",
    "sender_id": "uuid",
    "message_preview": "Hey there!"
  },
  "android": {
    "priority": "high",
    "notification": {
      "sound": "default",
      "channelId": "messages"
    }
  }
}
```

---

## 📦 Railway Deployment

### Deploy to Railway

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login to Railway:**
```bash
railway login
```

3. **Initialize project:**
```bash
cd backend
railway init
```

4. **Set environment variables:**
```bash
railway variables set SUPABASE_URL=your-url
railway variables set SUPABASE_SERVICE_KEY=your-key
# Set all other variables from .env
```

5. **Deploy:**
```bash
railway up
```

### Railway Configuration

The `railway.json` file configures deployment:
- Docker-based build
- Health check on `/health`
- Auto-restart on failure
- Single replica (scale as needed)

---

## 🐳 Docker

### Build Docker Image
```bash
docker build -t jiffy-backend .
```

### Run Docker Container
```bash
docker run -p 3000:3000 --env-file .env jiffy-backend
```

### Docker Compose (optional)
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
```

---

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# With coverage
npm run test:coverage
```

### Test Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Test with authentication
curl -X GET "http://localhost:3000/api/auth/me" \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN"
```

---

## 📈 Monitoring

### Logging

Logs are written to:
- Console (all levels)
- `logs/error.log` (errors only)
- `logs/all.log` (all logs)

### Health Monitoring

Monitor the `/health` endpoint:
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

## ⚡ Performance

### Caching

- **GIPHY/Tenor responses:** 10 minutes TTL
- **Categories:** 1 hour TTL
- **In-memory caching** with node-cache

### Rate Limiting

- **100 requests per 15 minutes** per IP
- Configurable via `RATE_LIMIT_*` env vars

### Optimization

- **Compression** enabled for responses
- **Helmet** for security headers
- **Connection pooling** for Supabase
- **Multicast notifications** for efficiency

---

## 🔒 Security

### Implemented

- ✅ JWT token validation via Supabase
- ✅ Rate limiting per IP
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Input validation with express-validator
- ✅ Environment variable protection
- ✅ Supabase RLS for data access
- ✅ Non-root Docker user

### Best Practices

- Never commit `.env` file
- Use service keys for backend only
- Validate all inputs
- Log security events
- Keep dependencies updated

---

## 📝 Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | https://xxx.supabase.co |
| `SUPABASE_SERVICE_KEY` | Service role key | eyJhbG... |
| `FCM_PROJECT_ID` | Firebase project ID | jiffy-prod |
| `FCM_PRIVATE_KEY` | Firebase private key | -----BEGIN... |
| `FCM_CLIENT_EMAIL` | Firebase service account | firebase-adminsdk@... |
| `GIPHY_API_KEY` | GIPHY API key | abc123... |
| `TENOR_API_KEY` | Tenor API key | xyz789... |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment |
| `CORS_ORIGIN` | * | CORS origin |
| `LOG_LEVEL` | info | Logging level |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Rate limit |

---

## 🐛 Troubleshooting

### "Supabase connection failed"
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Verify Supabase project is active
- Check network connectivity

### "FCM notifications not working"
- Verify FCM credentials in `.env`
- Check Firebase project has FCM enabled
- Ensure `FCM_PRIVATE_KEY` has proper line breaks (`\n`)
- Verify FCM tokens exist in Supabase `user_devices` table

### "GIPHY/Tenor API errors"
- Check API keys are valid
- Verify rate limits not exceeded
- Check API service status

---

## 📄 License

MIT License - see [LICENSE](../LICENSE)

---

## 👥 Support

- **Issues:** [GitHub Issues](https://github.com/darshanpania/jiffy/issues)
- **Email:** dev@jiffy.app
- **Documentation:** [Main README](../README.md)

---

**Built with Node.js, Express, and Supabase** ❤️
