# 🚂 JIFFY Backend Deployment Guide

**Deploy Node.js/Express backend to Railway with Supabase**

---

## 📊 Overview

This guide covers deploying the JIFFY backend API to Railway, a modern deployment platform with excellent support for Node.js applications.

---

## ✅ Prerequisites

- [x] Railway account ([sign up](https://railway.app))
- [x] GitHub repository with backend code
- [x] Supabase project configured
- [x] Firebase project (FCM only)
- [x] API keys (GIPHY, Tenor, PostHog)

---

## 🚀 Quick Deploy (5 Minutes)

### Option 1: Deploy via Railway CLI

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Navigate to backend directory
cd backend

# 4. Initialize Railway project
railway init

# 5. Link to existing project or create new
railway link

# 6. Set environment variables (see below)
railway variables set SUPABASE_URL=your-url
# ... set all variables

# 7. Deploy!
railway up

# 8. Open in browser
railway open
```

### Option 2: Deploy via GitHub Integration

1. **Connect GitHub:**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `darshanpania/jiffy`
   - Set root directory to `/backend`

2. **Configure Build:**
   - Railway auto-detects Dockerfile
   - Build command: `npm run build`
   - Start command: `npm start`

3. **Set Environment Variables** (see section below)

4. **Deploy:**
   - Railway deploys automatically on push to master

---

## 🔑 Environment Variables

### Required Variables on Railway

Set these in Railway Dashboard → Variables:

```bash
# Server
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Firebase Cloud Messaging (FCM ONLY)
FCM_PROJECT_ID=your-firebase-project-id
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nMultiline\nPrivate\nKey\n-----END PRIVATE KEY-----\n"
FCM_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# GIF APIs
GIPHY_API_KEY=your-giphy-api-key
TENOR_API_KEY=your-tenor-api-key

# PostHog
POSTHOG_API_KEY=phc_your-posthog-key
POSTHOG_HOST=https://app.posthog.com

# Security
JWT_SECRET=your-secure-random-string-change-in-production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://jiffy.app,https://www.jiffy.app

# Logging
LOG_LEVEL=info
```

### Getting Firebase Private Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Project Settings → Service Accounts
3. Click "Generate New Private Key"
4. Download JSON file
5. Extract values:
   - `FCM_PROJECT_ID` = `project_id`
   - `FCM_PRIVATE_KEY` = `private_key` (keep \n characters)
   - `FCM_CLIENT_EMAIL` = `client_email`

---

## 📜 Railway Configuration

### railway.json

Already configured in `backend/railway.json`:

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "numReplicas": 1,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 10,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### Dockerfile

Already configured with:
- ✅ Multi-stage build (optimized)
- ✅ Non-root user (security)
- ✅ Health check
- ✅ Dumb-init for signal handling
- ✅ Alpine Linux (small image)

---

## 🔍 Verify Deployment

### 1. Check Health Endpoint

```bash
curl https://your-app.railway.app/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-06T15:00:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "supabase": "connected"
}
```

### 2. Test API Endpoint

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-app.railway.app/api/v1/users/me
```

### 3. Check Logs

```bash
# Via Railway CLI
railway logs

# Via Railway Dashboard
# Go to Deployments → View Logs
```

---

## 📊 Monitoring

### Railway Built-in Monitoring

1. **Deployments Tab:**
   - Build status
   - Deploy logs
   - Crash reports

2. **Metrics Tab:**
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

3. **Logs Tab:**
   - Real-time logs
   - Error logs
   - Custom log filters

### Custom Monitoring

**PostHog Integration:**
- Track API usage
- Monitor error rates
- Performance metrics

**Winston Logs:**
- Structured logging
- Error tracking
- Request logging

---

## 🔄 CI/CD Pipeline

### Automatic Deployment

Railway automatically deploys on:
- Push to `master` branch
- Pull request merge
- Manual trigger

### GitHub Actions

Configured in `.github/workflows/backend-ci.yml`:

1. **On Push/PR:**
   - Lint code
   - Type check
   - Run tests
   - Build TypeScript
   - Build Docker image

2. **On Master:**
   - All above + deployment

---

## 🐛 Troubleshooting

### Build Fails

**Check logs:**
```bash
railway logs --build
```

**Common issues:**
- Missing environment variables
- TypeScript compilation errors
- Docker build errors

**Solution:**
```bash
# Rebuild locally
npm run build

# Fix errors, then redeploy
git push origin master
```

### App Crashes

**Check logs:**
```bash
railway logs
```

**Common causes:**
- Supabase connection failed
- Missing API keys
- Port already in use

**Solution:**
- Verify all environment variables
- Check Supabase project status
- Review error logs

### Health Check Fails

**Check endpoint:**
```bash
curl https://your-app.railway.app/health
```

**If fails:**
1. Check if app is running
2. Verify PORT environment variable
3. Check Supabase connection
4. Review deployment logs

---

## 🔧 Maintenance

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Test locally
npm test

# Deploy
git add package.json package-lock.json
git commit -m "chore: update dependencies"
git push
```

### Database Migrations

```bash
# Run migrations
npm run migrate

# Or manually in Supabase Dashboard
# SQL Editor → Run schema.sql
```

### Backup Strategy

**Supabase Backups:**
- Automatic daily backups (Supabase Pro)
- Point-in-time recovery
- Manual backups via Dashboard

**Code Backups:**
- Git repository (GitHub)
- Railway automatic backups

---

## 🔒 Security Checklist

### Pre-Deployment

- [ ] All secrets in environment variables
- [ ] No hardcoded API keys
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Helmet security headers active
- [ ] Input validation on all endpoints
- [ ] HTTPS enforced (Railway default)
- [ ] Non-root Docker user

### Post-Deployment

- [ ] Test all API endpoints
- [ ] Verify authentication works
- [ ] Check FCM notifications
- [ ] Test rate limiting
- [ ] Monitor error logs
- [ ] Review security headers

---

## 💰 Cost Estimation

### Railway Pricing

**Hobby Plan:**
- Free tier: $5 credit/month
- Good for development/testing

**Pro Plan ($20/month):**
- Unlimited projects
- Team collaboration
- Custom domains
- Higher resource limits

**Estimated Costs for JIFFY:**
- Backend API: ~$5-10/month
- PostgreSQL (if separate): ~$5/month
- Total: ~$15/month (small scale)

### Optimization Tips

1. **Use caching** - Reduce Supabase queries
2. **Optimize images** - Compress GIF thumbnails
3. **Connection pooling** - Reuse database connections
4. **CDN for assets** - Use Supabase Storage CDN

---

## ⚡ Performance Optimization

### Backend Performance

```typescript
// Enable compression
app.use(compression());

// Database connection pooling
// Configured in Supabase

// Cache frequently accessed data
import cache from './utils/cache';
cache.set('trending-gifs', gifs, 300); // 5 min cache
```

### Query Optimization

- Use Supabase RLS for security
- Add database indexes (already in schema.sql)
- Limit query results
- Use pagination

---

## 📄 Additional Documentation

- [API Documentation](API.md)
- [Main README](README.md)
- [Database Schema](../database/schema.sql)
- [Project README](../README.md)

---

## 📞 Support

**Issues:** [GitHub Issues](https://github.com/darshanpania/jiffy/issues)  
**Email:** dev@jiffy.app

---

**Deployed with ❤️ on Railway**