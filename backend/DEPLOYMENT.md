# 🚀 JIFFY Backend Deployment Guide

Comprehensive guide to deploy JIFFY backend to Railway.

---

## 📋 Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub repository connected to Railway
- All environment variables ready
- Supabase project configured
- Firebase project setup (FCM)

---

## 📦 Railway Deployment

### Option 1: Deploy via Railway Dashboard

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `darshanpania/jiffy` repository
   - Select `backend` as root directory

2. **Configure Service**
   - Railway auto-detects Dockerfile
   - Set root directory to `backend`
   - Configure port to `3000`

3. **Add Environment Variables**
   Go to Variables tab and add:
   ```
   SUPABASE_URL
   SUPABASE_SERVICE_KEY
   SUPABASE_ANON_KEY
   FCM_PROJECT_ID
   FCM_PRIVATE_KEY
   FCM_CLIENT_EMAIL
   FCM_CLIENT_ID
   GIPHY_API_KEY
   TENOR_API_KEY
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Check deployment logs

5. **Get URL**
   - Railway provides a URL: `https://your-app.railway.app`
   - Test health endpoint: `https://your-app.railway.app/health`

### Option 2: Deploy via Railway CLI

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login:**
```bash
railway login
```

3. **Initialize:**
```bash
cd backend
railway init
```

4. **Link to project:**
```bash
railway link
```

5. **Set variables:**
```bash
# Set all environment variables
railway variables set SUPABASE_URL=https://your-project.supabase.co
railway variables set SUPABASE_SERVICE_KEY=your-key
# ... set all other variables
```

6. **Deploy:**
```bash
railway up
```

7. **Check status:**
```bash
railway status
```

8. **View logs:**
```bash
railway logs
```

---

## 🔧 Environment Variables Setup

### Required Variables

**Supabase:**
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
SUPABASE_ANON_KEY=eyJhbGc...
```

**Firebase (FCM):**
```bash
FCM_PROJECT_ID=jiffy-prod
FCM_PRIVATE_KEY_ID=abc123...
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----"
FCM_CLIENT_EMAIL=firebase-adminsdk@jiffy-prod.iam.gserviceaccount.com
FCM_CLIENT_ID=123456789...
```

**APIs:**
```bash
GIPHY_API_KEY=your-giphy-key
TENOR_API_KEY=your-tenor-key
```

**Server:**
```bash
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*
LOG_LEVEL=info
```

### Getting Firebase Credentials

1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download JSON file
4. Extract values:
   - `project_id` → `FCM_PROJECT_ID`
   - `private_key_id` → `FCM_PRIVATE_KEY_ID`
   - `private_key` → `FCM_PRIVATE_KEY` (keep \n as \\n)
   - `client_email` → `FCM_CLIENT_EMAIL`
   - `client_id` → `FCM_CLIENT_ID`

---

## ✅ Verify Deployment

### 1. Health Check
```bash
curl https://your-app.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-06T15:00:00.000Z",
  "uptime": 123,
  "environment": "production",
  "version": "1.0.0"
}
```

### 2. Test API Endpoint
```bash
curl -X GET "https://your-app.railway.app/api/users/search?q=test" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Check Logs
```bash
railway logs --tail 100
```

---

## 📊 Monitoring

### Railway Dashboard

- **Metrics:** CPU, Memory, Network usage
- **Logs:** Real-time application logs
- **Deployments:** History of all deployments
- **Health:** Service health status

### Custom Monitoring

Add monitoring endpoints:
```javascript
app.get('/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
  });
});
```

---

## 🔄 Updating Deployment

### Via Git Push

```bash
# Commit changes
git add .
git commit -m "feat: update backend"
git push origin master

# Railway auto-deploys on push
```

### Via Railway CLI

```bash
cd backend
railway up
```

---

## 🐛 Troubleshooting

### Build Fails

**Check Dockerfile:**
```bash
# Test build locally
docker build -t jiffy-backend .
```

**View build logs:**
```bash
railway logs --deployment
```

### Health Check Fails

**Test locally:**
```bash
docker run -p 3000:3000 jiffy-backend
curl http://localhost:3000/health
```

### Environment Variables Missing

```bash
# List all variables
railway variables

# Add missing variable
railway variables set KEY=value
```

### High Memory Usage

- Check for memory leaks
- Review caching strategy
- Monitor with Railway metrics
- Consider increasing resources

---

## 🛡️ Security

### Production Checklist

- [ ] All secrets in environment variables (not code)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Helmet security headers active
- [ ] HTTPS enforced by Railway
- [ ] Logs don't contain sensitive data
- [ ] Dependencies up to date
- [ ] Non-root Docker user

---

## 💰 Cost Optimization

### Railway Pricing

- **Free Tier:** $5 credit/month
- **Hobby Plan:** $5/month base
- **Usage-based:** CPU, memory, network

### Optimization Tips

1. **Caching:** Reduce API calls to GIPHY/Tenor
2. **Compression:** Enabled for smaller responses
3. **Efficient Queries:** Optimize Supabase queries
4. **Resource Limits:** Set appropriate container limits
5. **Auto-scaling:** Configure based on load

---

## 🔗 Integration with Android App

### Update Android App

In Android `local.properties`:
```properties
BACKEND_API_URL=https://your-app.railway.app
```

In Android code:
```kotlin
val BACKEND_URL = BuildConfig.BACKEND_API_URL

// Use for API calls
val response = client.get("$BACKEND_URL/api/gifs/search")
```

---

## ⬆️ Scaling

### Horizontal Scaling

Update `railway.json`:
```json
{
  "deploy": {
    "numReplicas": 3
  }
}
```

### Vertical Scaling

Increase resources in Railway dashboard:
- CPU: 0.5 vCPU → 1 vCPU
- Memory: 512 MB → 1 GB

---

## 📝 Logs & Debugging

### View Logs

```bash
# Real-time logs
railway logs --tail

# Last 100 lines
railway logs --tail 100

# Filter by level
railway logs | grep ERROR
```

### Log Files

Logs stored in:
- `logs/error.log` - Errors only
- `logs/all.log` - All logs

---

## 🔄 Rollback

### Rollback to Previous Deployment

```bash
# List deployments
railway deployments

# Rollback to specific deployment
railway rollback <deployment-id>
```

---

## ✅ Post-Deployment Checklist

- [ ] Health endpoint returns 200
- [ ] All environment variables set
- [ ] Supabase connection working
- [ ] FCM sending notifications
- [ ] GIPHY API responding
- [ ] Tenor API responding
- [ ] Rate limiting active
- [ ] Logs being written
- [ ] HTTPS working
- [ ] CORS configured
- [ ] Android app can connect
- [ ] Test all critical endpoints

---

## 📞 Support

**Issues?**
- Check [Railway Status](https://railway.app/status)
- Review [Railway Docs](https://docs.railway.app)
- Open [GitHub Issue](https://github.com/darshanpania/jiffy/issues)

---

**Deployed with Railway 🚄 | Powered by Supabase ⚡**
