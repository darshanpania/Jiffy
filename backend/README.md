# 🚀 JIFFY Backend API

**Node.js/Express backend for JIFFY GIF Messenger**

---

## 📋 Overview

RESTful API backend built with Node.js, Express, and TypeScript. Integrates with Supabase for database and authentication, Firebase Cloud Messaging for push notifications, and GIPHY/Tenor for GIF content.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|--------|
| **Node.js 18+** | Runtime |
| **Express** | Web framework |
| **TypeScript** | Type safety |
| **Supabase** | Database, Auth, Realtime, Storage |
| **Firebase Admin SDK** | FCM push notifications ONLY |
| **GIPHY SDK** | GIF content provider #1 |
| **Tenor API** | GIF content provider #2 |
| **Railway** | Deployment platform |
| **Winston** | Logging |
| **Helmet** | Security headers |
| **Joi** | Validation |

---

## 📂 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration
│   │   ├── supabase.ts      # Supabase client
│   │   └── firebase.ts      # Firebase Admin (FCM only)
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts          # JWT authentication
│   │   ├── errorHandler.ts  # Error handling
│   │   ├── rateLimiter.ts   # Rate limiting
│   │   └── validator.ts     # Request validation
│   ├── routes/              # API routes
│   │   ├── auth.routes.ts   # Authentication endpoints
│   │   ├── user.routes.ts   # User management
│   │   ├── chat.routes.ts   # Chat & messaging
│   │   ├── gif.routes.ts    # GIF search & favorites
│   │   ├── notification.routes.ts  # Push notifications
│   │   └── health.routes.ts # Health check
│   ├── services/            # Business logic
│   │   ├── auth.service.ts  # Auth operations
│   │   ├── user.service.ts  # User operations
│   │   ├── chat.service.ts  # Chat operations
│   │   ├── gif.service.ts   # GIF operations
│   │   └── notification.service.ts  # FCM operations
│   ├── types/               # TypeScript types
│   │   └── index.ts         # Type definitions
│   ├── utils/               # Utilities
│   │   ├── logger.ts        # Winston logger
│   │   ├── response.ts      # Response helpers
│   │   └── cache.ts         # In-memory cache
│   └── server.ts            # Main server file
├── Dockerfile               # Docker configuration
├── railway.json             # Railway deployment config
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── .env.example             # Environment template
└── README.md                # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Supabase account and project
- Firebase project (FCM only)
- GIPHY API key
- Tenor API key

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
```

### Configuration

Edit `.env` file:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key

# Firebase FCM
FCM_PROJECT_ID=your-project-id
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FCM_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# GIF APIs
GIPHY_API_KEY=your-giphy-key
TENOR_API_KEY=your-tenor-key

# Server
PORT=3000
NODE_ENV=development
```

### Development

```bash
# Run in development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

---

## 📡 API Endpoints

### Health
- `GET /health` - Health check (unauthenticated)

### Authentication
- `POST /api/v1/auth/verify` - Verify JWT token
- `POST /api/v1/auth/register-fcm-token` - Register FCM token
- `POST /api/v1/auth/signout` - Sign out user

### Users
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users/:userId` - Get user by ID
- `PUT /api/v1/users/me` - Update current user profile
- `GET /api/v1/users/search?q=query` - Search users
- `GET /api/v1/users/me/friends` - Get friends list
- `PUT /api/v1/users/me/status` - Update online status

### Chats
- `GET /api/v1/chats` - Get all chats
- `POST /api/v1/chats/direct` - Create/get direct chat
- `POST /api/v1/chats/group` - Create group chat
- `GET /api/v1/chats/:chatId/messages` - Get messages
- `POST /api/v1/chats/:chatId/messages` - Send message
- `PUT /api/v1/chats/:chatId/read` - Mark as read
- `POST /api/v1/chats/:chatId/members` - Add group member
- `DELETE /api/v1/chats/:chatId/members/:userId` - Remove member

### GIFs
- `GET /api/v1/gifs/search/giphy?q=query` - Search GIPHY
- `GET /api/v1/gifs/search/tenor?q=query` - Search Tenor
- `GET /api/v1/gifs/trending/giphy` - Trending from GIPHY
- `GET /api/v1/gifs/trending/tenor` - Trending from Tenor
- `POST /api/v1/gifs/favorites` - Save favorite GIF
- `GET /api/v1/gifs/favorites` - Get favorite GIFs

### Notifications
- `POST /api/v1/notifications/send` - Send push notification
- `POST /api/v1/notifications/test` - Send test notification

---

## 🔐 Authentication

All API endpoints (except `/health`) require authentication.

**Header:**
```
Authorization: Bearer <supabase-jwt-token>
```

**Example:**
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
     https://api.jiffy.app/api/v1/users/me
```

---

## 🐳 Docker Deployment

### Build Docker image

```bash
docker build -t jiffy-backend .
```

### Run Docker container

```bash
docker run -p 3000:3000 --env-file .env jiffy-backend
```

---

## 🚂 Railway Deployment

### Setup

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize project:
   ```bash
   railway init
   ```

4. Set environment variables:
   ```bash
   railway variables set SUPABASE_URL=your-url
   railway variables set SUPABASE_SERVICE_KEY=your-key
   # ... set all other variables
   ```

5. Deploy:
   ```bash
   railway up
   ```

### Automatic Deployment

Railway automatically deploys on git push to master branch.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test -- --coverage
```

---

## 📊 Monitoring

### Logs

Logs are written to:
- Console (always)
- `logs/error.log` (errors only, production)
- `logs/combined.log` (all logs, production)

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
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

## 🔒 Security

### Features
- ✅ Helmet for security headers
- ✅ CORS configuration
- ✅ Rate limiting (100 requests/15 min)
- ✅ JWT authentication via Supabase
- ✅ Input validation with Joi
- ✅ SQL injection prevention (Supabase RLS)
- ✅ Environment variable protection

### Best Practices
- Never commit `.env` file
- Use service role key only on backend
- Validate all inputs
- Rate limit API endpoints
- Log security events

---

## 🚨 Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## 📚 Resources

- [Express Documentation](https://expressjs.com/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [GIPHY API](https://developers.giphy.com/docs/api/)
- [Tenor API](https://developers.google.com/tenor)
- [Railway Docs](https://docs.railway.app/)

---

## 🤝 Contributing

See [../CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

---

## 📄 License

MIT License - see [../LICENSE](../LICENSE)

---

**Built with ❤️ for JIFFY**