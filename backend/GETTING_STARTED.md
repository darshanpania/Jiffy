# 🚀 Backend Getting Started Guide

Quick guide to set up and run the JIFFY backend locally.

---

## ⚡ Quick Start (5 Minutes)

### 1. Install Node.js

Download and install Node.js 18+ from [nodejs.org](https://nodejs.org)

Verify installation:
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
vim .env
```

**Required variables:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `FCM_PROJECT_ID` and other FCM credentials
- `GIPHY_API_KEY`
- `TENOR_API_KEY`

### 4. Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

### 5. Test Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  \"status\": \"healthy\",
  \"timestamp\": \"...\",
  \"uptime\": 5
}
```

✅ **You're ready to develop!**

---

## 🔑 Getting API Keys

### Supabase

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Settings → API
4. Copy:
   - **URL:** `SUPABASE_URL`
   - **anon key:** `SUPABASE_ANON_KEY`
   - **service_role key:** `SUPABASE_SERVICE_KEY` ⚠️

### Firebase (FCM)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project
3. Project Settings → Service Accounts
4. Generate new private key
5. Download JSON file
6. Extract values to .env

### GIPHY

1. Go to [developers.giphy.com](https://developers.giphy.com)
2. Create an App (choose SDK)
3. Copy API Key

### Tenor

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Tenor API
3. Create API Key
4. Copy key

---

## 📝 Development Workflow

### Start Server
```bash
npm run dev
```

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

### Fix Linting Issues
```bash
npm run lint:fix
```

---

## 🧪 Testing APIs

### Using cURL

```bash
# Health check
curl http://localhost:3000/health

# Search GIFs (requires auth)
TOKEN=\"your-supabase-jwt-token\"
curl -X GET \"http://localhost:3000/api/gifs/search?q=cat&source=giphy\" \\
  -H \"Authorization: Bearer $TOKEN\"
```

### Using Postman

1. Import collection: `postman/JIFFY_API.postman_collection.json`
2. Set `baseUrl` variable to `http://localhost:3000`
3. Set `token` variable to your Supabase JWT token
4. Test endpoints

---

## 🔍 Common Tasks

### View Logs

Logs are in `logs/` directory:
```bash
# View all logs
tail -f logs/all.log

# View errors only
tail -f logs/error.log
```

### Test Supabase Connection

```bash
# In Node.js REPL
node
> const supabase = require('./src/config/supabase')
> supabase.from('profiles').select('id').limit(1).then(console.log)
```

### Test FCM

```bash
# Send test notification (requires auth)
curl -X POST \"http://localhost:3000/api/notifications/test\" \\
  -H \"Authorization: Bearer $TOKEN\"
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

### Supabase Connection Failed

- Check `SUPABASE_URL` is correct
- Verify `SUPABASE_SERVICE_KEY` is the service role key (not anon)
- Ensure Supabase project is active

### FCM Not Working

- Verify all FCM variables in .env
- Check `FCM_PRIVATE_KEY` has proper `\\n` characters
- Ensure Firebase project has FCM enabled

### Module Not Found

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

1. Read [API.md](API.md) for endpoint documentation
2. Check [DEPLOYMENT.md](DEPLOYMENT.md) for Railway deployment
3. Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design

---

## ✅ Verification Checklist

Before deploying, ensure:

- [ ] All tests passing: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] Health endpoint works
- [ ] Supabase connection successful
- [ ] FCM notifications sending
- [ ] GIPHY API responding
- [ ] Tenor API responding
- [ ] Environment variables documented
- [ ] Docker builds successfully
- [ ] Railway configuration correct

---

**Happy Coding! 💻**
