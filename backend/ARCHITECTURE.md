# 🏗️ JIFFY Backend Architecture

**Comprehensive guide to the backend system design and architecture**

---

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Android App (Client)                  │
│         Kotlin + Jetpack Compose + Supabase SDK         │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ HTTPS/WSS
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Railway Load Balancer (SSL/TLS)            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│           JIFFY Backend API (Node.js/Express)           │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Routes Layer                         │  │
│  │  /auth  /users  /chats  /gifs  /notifications    │  │
│  └───────────────┬───────────────────────────────────┘  │
│                  │                                       │
│  ┌───────────────▼───────────────────────────────────┐  │
│  │           Middleware Layer                        │  │
│  │  Auth • Validation • Rate Limit • Analytics      │  │
│  └───────────────┬───────────────────────────────────┘  │
│                  │                                       │
│  ┌───────────────▼───────────────────────────────────┐  │
│  │            Service Layer                          │  │
│  │  AuthService • UserService • ChatService         │  │
│  │  GifService • NotificationService                │  │
│  └───────────────┬───────────────────────────────────┘  │
└──────────────────┼───────────────────────────────────────┘
                   │
         ┌─────────┴─────────┬──────────────┬────────────┐
         ▼                   ▼              ▼            ▼
┌────────────────┐  ┌──────────────┐  ┌─────────┐  ┌────────┐
│   Supabase     │  │   Firebase   │  │  GIPHY  │  │ Tenor  │
│   PostgreSQL   │  │     FCM      │  │   API   │  │  API   │
│   Auth/Storage │  │  (Push Only) │  └─────────┘  └────────┘
│   Realtime     │  └──────────────┘
└────────────────┘
         │
         ▼
┌────────────────┐
│    PostHog     │
│   Analytics    │
└────────────────┘
```

---

## 🎯 Architecture Patterns

### Layered Architecture

**1. Routes Layer (API Endpoints)**
- HTTP request handling
- Route definitions
- Request/response formatting
- Delegates to service layer

**2. Middleware Layer**
- Authentication (JWT validation)
- Authorization (user permissions)
- Input validation (Joi schemas)
- Rate limiting
- Error handling
- Analytics tracking

**3. Service Layer (Business Logic)**
- Core business logic
- Database operations via Supabase
- External API calls (GIPHY, Tenor, FCM)
- Data transformation
- Error handling

**4. Integration Layer**
- Supabase client
- Firebase Admin SDK
- External APIs
- Logging (Winston)

---

## 📂 Directory Structure

```
backend/
├── src/
│   ├── config/                    # Configuration
│   │   ├── supabase.ts           # Supabase client setup
│   │   └── firebase.ts           # Firebase FCM setup
│   │
│   ├── middleware/                # Express middleware
│   │   ├── auth.ts               # JWT authentication
│   │   ├── errorHandler.ts       # Global error handler
│   │   ├── notFoundHandler.ts    # 404 handler
│   │   ├── rateLimiter.ts        # Rate limiting
│   │   ├── validator.ts          # Request validation
│   │   └── analytics.middleware.ts # PostHog tracking
│   │
│   ├── routes/                    # API routes
│   │   ├── auth.routes.ts        # POST /auth/verify
│   │   ├── user.routes.ts        # GET/PUT /users
│   │   ├── chat.routes.ts        # GET/POST /chats
│   │   ├── gif.routes.ts         # GET /gifs/search
│   │   ├── friend.routes.ts      # POST /friends/requests
│   │   ├── notification.routes.ts # POST /notifications
│   │   └── health.routes.ts      # GET /health
│   │
│   ├── services/                  # Business logic
│   │   ├── auth.service.ts       # Supabase Auth
│   │   ├── user.service.ts       # User CRUD
│   │   ├── chat.service.ts       # Messaging logic
│   │   ├── gif.service.ts        # GIPHY/Tenor
│   │   ├── friend.service.ts     # Friend system
│   │   ├── notification.service.ts # FCM push
│   │   └── analytics.service.ts  # PostHog
│   │
│   ├── types/                     # TypeScript types
│   │   └── index.ts              # Type definitions
│   │
│   ├── utils/                     # Utilities
│   │   ├── logger.ts             # Winston logger
│   │   ├── response.ts           # Response helpers
│   │   ├── cache.ts              # In-memory cache
│   │   └── validators.ts         # Custom validators
│   │
│   └── server.ts                  # Main entry point
│
├── scripts/                       # Deployment scripts
│   ├── deploy.sh                 # Railway deployment
│   ├── migrate.js                # Database migrations
│   └── seed.js                   # Test data seeding
│
├── logs/                          # Log files (production)
├── Dockerfile                     # Docker configuration
├── docker-compose.yml             # Local Docker setup
├── railway.json                   # Railway config
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── .env.example                   # Environment template
└── README.md                      # Documentation
```

---

## 🔄 Request Flow

### Example: Send Message

```
1. Client Request
   POST /api/v1/chats/abc-123/messages
   Authorization: Bearer <token>
   Body: { chatId: "abc-123", content: "Hello!", type: "TEXT" }
   
   ↓

2. Middleware Stack
   → Analytics Middleware (track request)
   → Rate Limiter (check limits)
   → Authenticator (verify JWT token via Supabase)
   → Validator (validate request body)
   
   ↓

3. Route Handler (chat.routes.ts)
   → Extract data from request
   → Call ChatService.sendMessage()
   
   ↓

4. Service Layer (chat.service.ts)
   → Validate chat permissions
   → Insert message in Supabase PostgreSQL
   → Get chat participants
   → Call NotificationService.sendMessageNotification()
   
   ↓

5. Notification Service
   → Get FCM tokens from Supabase
   → Check mute preferences
   → Send push via Firebase Admin SDK
   
   ↓

6. Response
   {
     "success": true,
     "data": { message }
   }
```

---

## 🗄️ Data Flow

### Supabase Integration

**Primary Data Source:**
- All data stored in Supabase PostgreSQL
- Row Level Security (RLS) enforced
- Real-time subscriptions handled by Android app
- Backend uses service role for admin operations

**Data Operations:**

```typescript
// Create (INSERT)
const { data, error } = await supabaseAdmin
  .from('messages')
  .insert({ ... })
  .select()
  .single();

// Read (SELECT)
const { data, error } = await supabaseAdmin
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Update
const { data, error } = await supabaseAdmin
  .from('profiles')
  .update({ ... })
  .eq('id', userId);

// Delete
const { error } = await supabaseAdmin
  .from('friendships')
  .delete()
  .eq('id', friendshipId);

// RPC (Stored Procedures)
const { data, error } = await supabaseAdmin
  .rpc('get_user_chats', { p_user_id: userId });
```

---

## 🔐 Security Architecture

### Authentication Flow

```
1. User signs in via Android app
   → Supabase Auth (Google/Apple OAuth)
   → Returns JWT access token
   
2. Android app includes token in requests
   → Authorization: Bearer <jwt-token>
   
3. Backend validates token
   → Calls supabaseAdmin.auth.getUser(token)
   → Verifies signature and expiration
   → Extracts user ID
   
4. User ID used for all operations
   → Passed to services
   → Used in Supabase queries
   → Logged for analytics
```

### Security Layers

**1. Network Security:**
- ✅ HTTPS only (Railway SSL)
- ✅ CORS configured
- ✅ Helmet security headers

**2. Authentication:**
- ✅ JWT token validation
- ✅ Supabase Auth integration
- ✅ Token expiration checks

**3. Authorization:**
- ✅ Supabase Row Level Security (RLS)
- ✅ User context in all queries
- ✅ PostgreSQL policies enforced

**4. Input Validation:**
- ✅ Joi schema validation
- ✅ Type checking (TypeScript)
- ✅ SQL injection prevention (Supabase)

**5. Rate Limiting:**
- ✅ IP-based rate limiting
- ✅ Endpoint-specific limits
- ✅ Prevents abuse

---

## 📡 External Integrations

### Supabase (Primary Backend)

**Used For:**
- ✅ User authentication (JWT)
- ✅ PostgreSQL database (all data)
- ✅ Real-time subscriptions (Android handles)
- ✅ File storage (avatars, media)

**Backend Role:**
- Admin operations (service role key)
- Send messages on behalf of users
- Manage notifications
- Analytics queries

### Firebase Admin SDK

**Used For:**
- ✅ Firebase Cloud Messaging (FCM) ONLY

**NOT Used For:**
- ❌ Authentication (Supabase handles)
- ❌ Database (Supabase PostgreSQL)
- ❌ Storage (Supabase Storage)

**Backend Role:**
- Send push notifications
- Manage FCM tokens
- Handle delivery reports

### GIPHY API

**Used For:**
- GIF search
- Trending GIFs
- GIF metadata

**Rate Limits:**
- 42 requests/hour (free tier)
- Cached in backend for 5 minutes

### Tenor API

**Used For:**
- GIF search
- Featured GIFs
- Alternative to GIPHY

**Rate Limits:**
- More generous (varies by tier)
- Used as fallback

### PostHog

**Used For:**
- API usage analytics
- Error tracking
- Performance monitoring

---

## 🚀 Performance Optimizations

### Caching Strategy

**In-Memory Cache:**
```typescript
// Cache trending GIFs for 5 minutes
cache.set('trending-giphy', gifs, 300);

// Cache user profiles for 1 minute
cache.set(`profile-${userId}`, profile, 60);
```

**Supabase Caching:**
- PostgreSQL query result caching
- Connection pooling
- Index optimization

### Database Optimization

**Indexes (in schema.sql):**
- Messages by chat_id and created_at
- Profiles by display_name
- Friend requests by sender/receiver
- Full-text search on profiles

**Query Optimization:**
- Use `select()` to specify columns
- Implement pagination
- Use RPC for complex queries
- Avoid N+1 queries

### API Response Optimization

**Compression:**
```typescript
app.use(compression()); // Gzip responses
```

**Pagination:**
```typescript
// Return only needed data
.range(offset, offset + limit - 1)
```

**Efficient Queries:**
```typescript
// Select only needed columns
.select('id, display_name, photo_url')
```

---

## 📊 Monitoring & Logging

### Winston Logger

**Log Levels:**
- `error` - Errors and exceptions
- `warn` - Warnings
- `info` - Important events
- `debug` - Detailed debugging

**Log Outputs:**
- Console (all environments)
- `logs/error.log` (production)
- `logs/combined.log` (production)

**Example:**
```typescript
logger.info('Message sent', { chatId, userId });
logger.error('Database error', { error, query });
```

### PostHog Analytics

**Backend Events:**
- API requests
- Errors
- FCM notifications sent
- GIF API calls
- Performance metrics

---

## 🔄 Scalability

### Horizontal Scaling

**Railway Supports:**
- Multiple replicas
- Load balancing
- Auto-scaling (Pro plan)

**Stateless Design:**
- No server-side sessions
- JWT tokens (stateless auth)
- Database for all state
- Can scale to N instances

### Database Scaling

**Supabase PostgreSQL:**
- Connection pooling (built-in)
- Read replicas (Pro tier)
- Automatic backups
- Point-in-time recovery

**Optimization:**
- Indexes on all foreign keys
- Materialized views (if needed)
- Query result caching
- Connection limit management

### Caching Layer

**Current: In-Memory**
- Simple Map-based cache
- Per-instance caching
- Good for small scale

**Future: Redis**
- Shared cache across instances
- Pub/Sub for real-time
- Session storage
- Rate limit storage

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// Service tests
describe('ChatService', () => {
  it('should send message successfully', async () => {
    const message = await chatService.sendMessage({
      chatId: 'test-chat',
      senderId: 'user-1',
      content: 'Hello',
      type: 'TEXT',
    });
    
    expect(message).toBeDefined();
    expect(message.content).toBe('Hello');
  });
});
```

### Integration Tests

```typescript
// API endpoint tests
describe('POST /api/v1/chats/:chatId/messages', () => {
  it('should send message with valid token', async () => {
    const response = await request(app)
      .post('/api/v1/chats/test-chat/messages')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        chatId: 'test-chat',
        content: 'Test message',
        type: 'TEXT',
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ All secrets in `.env` (never committed)
- ✅ Validated on startup
- ✅ Different configs for dev/prod

### 2. Authentication
- ✅ JWT validation on all protected routes
- ✅ Supabase Auth integration
- ✅ Token expiration checks
- ✅ Service role key protected

### 3. Input Validation
- ✅ Joi schemas for all inputs
- ✅ Type safety with TypeScript
- ✅ SQL injection prevention (Supabase)
- ✅ XSS prevention

### 4. Rate Limiting
- ✅ Global: 100 req/15 min
- ✅ Strict (GIF): 10 req/min
- ✅ IP-based tracking
- ✅ Configurable limits

### 5. Error Handling
- ✅ No sensitive data in errors
- ✅ Generic error messages to client
- ✅ Detailed logs server-side
- ✅ Stack traces only in dev

---

## 📈 Performance Metrics

### Target Benchmarks

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Response Time** | < 100ms | Morgan logs |
| **Database Query** | < 50ms | Supabase Dashboard |
| **FCM Delivery** | < 200ms | FCM response time |
| **GIF API** | < 500ms | Axios timing |
| **Memory Usage** | < 512MB | Railway metrics |
| **CPU Usage** | < 50% | Railway metrics |

### Monitoring Tools

- **Railway Dashboard** - Server metrics
- **Supabase Dashboard** - Database performance
- **PostHog** - API usage analytics
- **Winston Logs** - Error tracking

---

## 🔮 Future Enhancements

### Phase 4: Advanced Features

**Redis Integration:**
```typescript
// Shared cache across instances
import Redis from 'redis';

const redis = Redis.createClient({
  url: process.env.REDIS_URL,
});

// Cache with Redis
await redis.set('key', JSON.stringify(data), { EX: 300 });
```

**WebSocket Server:**
```typescript
// For real-time features beyond Supabase
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ server });
wss.on('connection', handleConnection);
```

**Message Queue:**
```typescript
// For background jobs (Bull or BullMQ)
import Bull from 'bull';

const notificationQueue = new Bull('notifications', {
  redis: process.env.REDIS_URL,
});
```

---

## 📚 Technology Decisions

### Why Node.js/Express?

| Reason | Benefit |
|--------|---------|
| **Fast development** | Quick API creation |
| **Large ecosystem** | Many packages available |
| **TypeScript support** | Type safety |
| **Async by nature** | Good for I/O operations |
| **Railway support** | Easy deployment |

### Why Not Use Supabase Edge Functions?

**We chose Express because:**
- More control over middleware
- Better TypeScript integration
- Familiar Express patterns
- Easier local development
- More flexible for complex logic

**Supabase Realtime:**
- Still used for real-time features
- Android app subscribes directly
- Backend sends data, client receives

---

## 🛠️ Development Workflow

### Local Development

```bash
# 1. Setup
npm install
cp .env.example .env

# 2. Run Supabase locally (optional)
supabase start

# 3. Run backend
npm run dev

# 4. Test endpoints
curl http://localhost:3000/health
```

### Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage
```

### Building

```bash
# Compile TypeScript
npm run build

# Run production build
npm start
```

---

## 📞 API Versioning

### Current: v1

All endpoints prefixed with `/api/v1`

### Future Versions

When breaking changes needed:
- Create `/api/v2` routes
- Maintain v1 for backward compatibility
- Deprecate v1 with timeline
- Migrate users gradually

---

## 🎯 Design Principles

### 1. Separation of Concerns
- Routes handle HTTP
- Services handle business logic
- Config handles setup
- Clear boundaries

### 2. Single Responsibility
- Each service has one purpose
- Each function does one thing
- Modular and testable

### 3. DRY (Don't Repeat Yourself)
- Shared utilities
- Reusable middleware
- Common types

### 4. Error Handling
- Centralized error handler
- Consistent error format
- Proper logging

### 5. Security First
- Authentication required by default
- Input validation always
- Least privilege principle
- No secrets in code

---

## 📖 API Design Philosophy

### RESTful Principles

**Resource-Based URLs:**
```
✅ GET /api/v1/users/:id
✅ POST /api/v1/chats/:chatId/messages
❌ GET /api/v1/getUserById?id=123
```

**HTTP Methods:**
- `GET` - Retrieve data
- `POST` - Create resource
- `PUT` - Update resource (full)
- `PATCH` - Update resource (partial)
- `DELETE` - Remove resource

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

---

## 🔗 Integration Points

### Android App ↔ Backend

**What Android Does:**
- Supabase Auth (sign in)
- Supabase Realtime (live updates)
- Direct Supabase queries (with RLS)
- API calls for complex operations

**What Backend Does:**
- Send FCM notifications
- Proxy GIF searches (rate limiting)
- Complex database operations
- Admin operations

### Backend ↔ Supabase

**Service Role Operations:**
- Admin queries (bypass RLS)
- System operations
- Analytics queries
- Notification triggers

---

## 📚 Additional Resources

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Production Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Railway Documentation](https://docs.railway.app/)

---

**Architecture designed for:** Scalability • Performance • Security • Maintainability

**Last Updated:** February 6, 2026
