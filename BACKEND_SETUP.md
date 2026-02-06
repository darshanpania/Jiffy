# 🚀 JIFFY Backend Complete Setup Guide

**Get the Node.js/Express backend running locally and deploy to Railway**

---

## 📋 Prerequisites

### Required Software
- ✅ **Node.js** 18 or higher ([Download](https://nodejs.org))
- ✅ **npm** 9 or higher (comes with Node.js)
- ✅ **Git** for version control
- ✅ **Docker** (optional, for containerized development)

### Required Accounts
- ✅ **Supabase Account** ([Sign up](https://supabase.com))
- ✅ **Firebase Project** ([Console](https://console.firebase.google.com))
- ✅ **GIPHY Developer Account** ([Register](https://developers.giphy.com))
- ✅ **Tenor API Access** ([Google Cloud](https://console.cloud.google.com))
- ✅ **Railway Account** ([Sign up](https://railway.app))
- ✅ **PostHog Account** ([Sign up](https://posthog.com))

---

## 🔧 Local Development Setup

### Step 1: Navigate to Backend

```bash
cd jiffy/backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- Express web framework
- Supabase JS client
- Firebase Admin SDK (FCM only)
- TypeScript compiler
- All dev dependencies

### Step 3: Create Environment File

```bash
cp .env.example .env
```

### Step 4: Configure Environment Variables

Edit `.env` file with your credentials:

```bash
# ===========================================
# SERVER CONFIGURATION
# ===========================================
NODE_ENV=development
PORT=3000
API_VERSION=v1

# ===========================================
# SUPABASE (Primary Backend)
# ===========================================
# Get from: https://app.supabase.com → Settings → API
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...  # Service role key (KEEP SECRET!)
SUPABASE_ANON_KEY=eyJhbGc...     # Anon key (public)

# ===========================================
# FIREBASE CLOUD MESSAGING (FCM ONLY)
# ===========================================
# Get from: Firebase Console → Project Settings → Service Accounts
# Click "Generate New Private Key"
FCM_PROJECT_ID=your-project-id
FCM_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nMultiline\nKey\nHere\n-----END PRIVATE KEY-----\n"

# ===========================================
# GIF APIS
# ===========================================
# GIPHY: https://developers.giphy.com
GIPHY_API_KEY=your-giphy-api-key

# Tenor: https://console.cloud.google.com
TENOR_API_KEY=your-tenor-api-key

# ===========================================
# ANALYTICS
# ===========================================
# PostHog: https://app.posthog.com
POSTHOG_API_KEY=phc_xxxxxxxxxxxxx
POSTHOG_HOST=https://app.posthog.com

# ===========================================
# SECURITY
# ===========================================
JWT_SECRET=change-this-to-random-string-in-production
CORS_ORIGIN=*  # Change to your domain in production

# ===========================================
# RATE LIMITING
# ===========================================
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # 100 requests per window

# ===========================================
# LOGGING
# ===========================================
LOG_LEVEL=debug  # Use 'info' in production
```

### Step 5: Run Database Migrations

Make sure Supabase database has the schema:

```bash
# Option 1: Via Supabase Dashboard
# Go to SQL Editor → New Query
# Copy contents of ../database/schema.sql → Run

# Option 2: Via backend script (if configured)
npm run migrate
```

### Step 6: Start Development Server

```bash
npm run dev
```

**Server runs on:** `http://localhost:3000`

You should see:
```
🚀 JIFFY Backend Server running on port 3000
📊 Environment: development
🔗 API Base URL: /api/v1
🗄️  Supabase: https://xxxxx.supabase.co
🔔 FCM: Configured
🎨 GIPHY: Configured
🎭 Tenor: Configured
📈 PostHog: Configured
```

### Step 7: Test the API

```bash
# Health check
curl http://localhost:3000/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2026-02-06T16:00:00.000Z",
#   "uptime": 12.34,
#   "environment": "development",
#   "supabase": "connected"
# }
```

---

## ✅ Verify Setup

### Test Checklist

- [ ] Server starts without errors
- [ ] Health endpoint returns "ok"
- [ ] Supabase connection successful
- [ ] No missing environment variables
- [ ] Logs appear in console

### Test API Endpoints

**1. Test Authentication (requires token):**

Get a token from Supabase:
```bash
# Via Supabase Dashboard → Authentication → Users → [User] → Copy JWT
```

Test endpoint:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v1/users/me
```

**2. Test GIF Search:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:3000/api/v1/gifs/search/giphy?q=cat&limit=5"
```

**3. Test FCM Token Registration:**
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"fcmToken":"test-token","deviceType":"android"}' \
     http://localhost:3000/api/v1/auth/register-fcm-token
```

---

## 🐳 Docker Development (Optional)

### Build Docker Image

```bash
docker build -t jiffy-backend .
```

### Run Container

```bash
docker run -p 3000:3000 --env-file .env jiffy-backend
```

### Using Docker Compose

```bash
# Start all services (API + Redis)
docker-compose up

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

---

## 🚀 Railway Deployment

### Option 1: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Set environment variables
railway variables set NODE_ENV=production
railway variables set SUPABASE_URL=https://your-project.supabase.co
railway variables set SUPABASE_SERVICE_KEY=your-service-key
# ... set all other variables from .env

# Deploy!
railway up

# Check status
railway status

# View logs
railway logs

# Open in browser
railway open
```

### Option 2: Deploy via GitHub Integration

**1. Connect Repository:**
- Go to [Railway Dashboard](https://railway.app/dashboard)
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository
- Select `/backend` as root directory

**2. Configure Settings:**
- Build command: `npm run build`
- Start command: `npm start`
- Port: 3000
- Health check: `/health`

**3. Set Environment Variables:**
- Go to Variables tab
- Add all variables from `.env`
- Click "Deploy"

**4. Auto-Deploy:**
- Railway auto-deploys on push to master
- View deployments in Dashboard

---

## 🔧 Development Commands

```bash
# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run typecheck

# Run migrations
npm run migrate

# Seed test data
npm run seed
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Supabase Connection Fails

**Check:**
1. SUPABASE_URL is correct
2. SUPABASE_SERVICE_KEY is valid (not anon key)
3. Supabase project is not paused
4. Internet connection active

**Test connection:**
```bash
curl https://your-project.supabase.co/rest/v1/
```

### Firebase FCM Not Working

**Check:**
1. FCM credentials correct (project ID, private key, email)
2. Private key has `\n` characters preserved
3. Firebase project has Cloud Messaging enabled
4. Service account has proper permissions

**Test:**
```bash
# Send test notification via API
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v1/notifications/test
```

### GIPHY/Tenor API Errors

**Check:**
1. API keys are valid
2. Rate limits not exceeded
3. API endpoints accessible

**Test GIPHY:**
```bash
curl "https://api.giphy.com/v1/gifs/search?api_key=YOUR_KEY&q=test&limit=1"
```

### TypeScript Compilation Errors

```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

---

## 📊 Monitoring in Production

### Railway Dashboard

**Metrics Tab:**
- CPU usage
- Memory usage
- Network I/O
- Request count
- Response times

**Logs Tab:**
- Real-time logs
- Error filtering
- Search functionality

**Deployments Tab:**
- Build logs
- Deploy history
- Rollback options

### PostHog Analytics

**Track:**
- API usage patterns
- Error rates
- Performance metrics
- User behavior

**Dashboard:** https://app.posthog.com

### Supabase Dashboard

**Monitor:**
- Database query performance
- Connection pool usage
- API usage
- Storage metrics

**Dashboard:** https://app.supabase.com

---

## 🔒 Production Security Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to secure random string
- [ ] Set CORS_ORIGIN to your domain only
- [ ] Set NODE_ENV=production
- [ ] Use strong passwords for all services
- [ ] Enable HTTPS (Railway provides this)
- [ ] Review all environment variables
- [ ] Test all API endpoints
- [ ] Verify rate limiting works
- [ ] Check error messages don't leak info
- [ ] Enable production logging
- [ ] Setup monitoring alerts
- [ ] Test backup/recovery

---

## 📈 Performance Tips

### Optimize Response Times

```typescript
// 1. Enable compression
app.use(compression());

// 2. Cache frequently accessed data
cache.set('trending-gifs', gifs, 300);

// 3. Use Supabase indexes
// Already configured in schema.sql

// 4. Limit query results
.limit(100)

// 5. Use pagination
.range(0, 49)
```

### Reduce Memory Usage

```typescript
// 1. Clean up event listeners
process.removeAllListeners('event');

// 2. Use streaming for large files
res.pipe(stream);

// 3. Clear cache periodically
cache.startCleanup(60000);
```

---

## 🎯 Next Steps

### Development
1. ✅ Backend is running locally
2. ✅ Test all API endpoints
3. ✅ Connect Android app to backend
4. ✅ Test end-to-end flows

### Deployment
1. ✅ Configure Railway project
2. ✅ Set all environment variables
3. ✅ Deploy to Railway
4. ✅ Test production endpoints
5. ✅ Monitor metrics

### Go Live
1. ✅ Complete testing
2. ✅ Security audit
3. ✅ Beta testing
4. ✅ Production release

---

## 📚 Additional Resources

### Backend Documentation
- [Backend README](backend/README.md)
- [API Documentation](backend/API.md)
- [Architecture Guide](backend/ARCHITECTURE.md)
- [Deployment Guide](backend/DEPLOYMENT.md)

### External Services
- [Supabase Docs](https://supabase.com/docs)
- [Firebase FCM Docs](https://firebase.google.com/docs/cloud-messaging)
- [Railway Docs](https://docs.railway.app)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## 🆘 Getting Help

**Backend Issues:**
- Check [backend/README.md](backend/README.md)
- Review logs with `npm run dev`
- Search [GitHub Issues](https://github.com/darshanpania/jiffy/issues)

**Can't solve it?**
- Open a [new issue](https://github.com/darshanpania/jiffy/issues/new)
- Tag with `backend` label
- Include error logs and environment details

---

## ✅ Setup Complete!

**Your backend is ready to:**
- 🔐 Authenticate users via Supabase
- 💬 Handle chat messages
- 🎨 Search GIFs from GIPHY and Tenor
- 🔔 Send push notifications via FCM
- 📊 Track analytics with PostHog
- 🚀 Deploy to Railway

**Start the Android app and connect to your backend!**

---

<div align="center">

**Backend powered by Node.js • Express • Supabase • Railway**

[📖 API Docs](backend/API.md) | [🏗️ Architecture](backend/ARCHITECTURE.md) | [🚀 Deploy](backend/DEPLOYMENT.md)

</div>
