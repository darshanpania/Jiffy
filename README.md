# 🎬 JIFFY - GIF Messenger

> Express yourself better with GIFs! A modern messaging app with Android client and Node.js backend.

[![Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://developer.android.com)
[![Kotlin](https://img.shields.io/badge/Language-Kotlin-blue.svg)](https://kotlinlang.org)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933.svg)](https://nodejs.org)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E.svg)](https://supabase.com)
[![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E.svg)](https://railway.app)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📱 Overview

JIFFY is a next-generation GIF-powered messaging application with a **modern Android client** and **Node.js/Express backend**. Built with Kotlin, Jetpack Compose, Supabase, and deployed on Railway for scalability.

### ✨ Key Features

- 🔐 **Secure Authentication** - Google and Apple Sign-In via Supabase Auth
- 💬 **Real-Time Messaging** - Instant delivery using Supabase Realtime
- 🎨 **Dual GIF Sources** - Search from both GIPHY and Tenor
- 👥 **Group Chats** - Create groups with up to 100 members
- 📱 **Social Sharing** - Share to Facebook, Twitter, and Instagram
- 🔔 **Push Notifications** - Firebase Cloud Messaging integration
- 📊 **Analytics** - PostHog for user insights
- 🌐 **Backend API** - Node.js/Express on Railway
- ⚡ **High Performance** - Optimized for speed and reliability

---

## 🏗️ Tech Stack

### Frontend (Android)
- **Language:** Kotlin 1.9.22
- **UI:** Jetpack Compose with Material 3
- **Architecture:** Clean Architecture (MVVM)
- **DI:** Hilt
- **Local DB:** Room
- **Image Loading:** Coil (GIF support)
- **Min SDK:** 24 | **Target SDK:** 34

### Backend (Node.js)
- **Runtime:** Node.js 18+
- **Framework:** Express + TypeScript
- **Architecture:** Layered (Routes → Services → DB)
- **Deployment:** Railway with Docker
- **Logging:** Winston
- **Validation:** Joi

### Backend & Services
- **Database:** Supabase PostgreSQL (12 tables with RLS)
- **Authentication:** Supabase Auth (OAuth - Google/Apple only)
- **Real-time:** Supabase Realtime (WebSocket)
- **Storage:** Supabase Storage (CDN)
- **Push Notifications:** Firebase Cloud Messaging (FCM ONLY)
- **Analytics:** PostHog
- **Deployment:** Railway

### APIs & Integrations
- **GIF Sources:** GIPHY SDK + Tenor API
- **Social Media:** Facebook, Twitter, Instagram SDKs
- **Networking:** Retrofit (Android) + Axios (Backend)

---

## 📂 Project Structure

```
jiffy/
├── app/                          # Android application
│   ├── src/main/java/com/darshan/jiffy/
│   │   ├── data/                # Data layer
│   │   ├── domain/              # Business logic
│   │   ├── presentation/        # UI (Compose)
│   │   └── di/                  # Dependency injection
│   └── build.gradle.kts
│
├── backend/                      # Node.js/Express API
│   ├── src/
│   │   ├── config/              # Supabase, Firebase config
│   │   ├── middleware/          # Auth, validation, rate limiting
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Business logic
│   │   ├── types/               # TypeScript types
│   │   ├── utils/               # Logger, helpers
│   │   └── server.ts            # Main entry point
│   ├── Dockerfile               # Docker configuration
│   ├── railway.json             # Railway config
│   └── package.json             # Dependencies
│
├── database/                     # Database schema
│   └── schema.sql               # Complete PostgreSQL schema
│
└── docs/                         # Documentation
    ├── SETUP.md                 # Setup guide
    ├── QUICKSTART.md            # Quick start
    ├── TECH_STACK.md            # Technology details
    └── ROADMAP.md               # Development roadmap
```

---

## 🚀 Getting Started

### Quick Start (10 Minutes)

**1. Clone Repository:**
```bash
git clone https://github.com/darshanpania/jiffy.git
cd jiffy
```

**2. Setup Android App:**
```bash
# Copy config template
cp local.properties.example local.properties

# Edit with your API keys
# Then open in Android Studio
```

**3. Setup Backend:**
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit with your credentials
# Then start server
npm run dev
```

**4. Setup Supabase:**
- Create project at [Supabase](https://supabase.com)
- Run `database/schema.sql` in SQL Editor
- Copy URL and keys to configs

**5. Run!**
- Android: Open in Android Studio → Run
- Backend: `npm run dev` (runs on http://localhost:3000)

📖 **Detailed Guide:** See [SETUP.md](SETUP.md)

---

## 🌐 Backend API

### Base URL
- **Development:** `http://localhost:3000`
- **Production:** `https://your-app.railway.app`

### Key Endpoints

```http
# Health Check
GET /health

# Authentication
POST /api/v1/auth/verify
POST /api/v1/auth/register-fcm-token

# Users
GET  /api/v1/users/me
PUT  /api/v1/users/me
GET  /api/v1/users/search?q=query

# Chats
GET  /api/v1/chats
POST /api/v1/chats/direct
POST /api/v1/chats/:chatId/messages
GET  /api/v1/chats/:chatId/messages

# GIFs
GET  /api/v1/gifs/search/giphy?q=cat
GET  /api/v1/gifs/search/tenor?q=dog
GET  /api/v1/gifs/trending/giphy
POST /api/v1/gifs/favorites

# Friends
POST /api/v1/friends/requests
GET  /api/v1/friends/requests/pending
PUT  /api/v1/friends/requests/:id/accept

# Notifications
POST /api/v1/notifications/test
```

📖 **Full API Docs:** [backend/API.md](backend/API.md)

---

## 🗄️ Database (Supabase PostgreSQL)

### Tables (12 total)

**Phase 1:**
1. `profiles` - User data
2. `friendships` - Friend relationships
3. `friend_requests` - Friend requests
4. `chat_rooms` - Chat metadata
5. `chat_participants` - Chat members
6. `messages` - All messages
7. `favorite_gifs` - Saved GIFs
8. `user_devices` - FCM tokens

**Phase 2:**
9. `group_settings` - Group config
10. `group_invites` - Group invites
11. `message_reads` - Read receipts
12. `chat_notification_preferences` - Notification prefs

**All protected by Row Level Security (RLS)**

---

## 🔐 Security

### Authentication
- Supabase Auth with Google/Apple OAuth
- JWT token validation
- No password storage

### Data Security
- Row Level Security on all tables
- HTTPS/TLS encryption
- Secure token storage
- API key protection

### Backend Security
- Helmet security headers
- CORS configuration
- Rate limiting
- Input validation
- Error sanitization

---

## 📊 Analytics (PostHog)

### Tracked Events
- Authentication flows
- Message activity
- GIF usage
- Friend interactions
- API requests
- Error occurrences

### Privacy
- No message content tracked
- User IDs hashed
- GDPR compliant
- Opt-out available

---

## 🧪 Testing

### Android Tests
```bash
./gradlew test                    # Unit tests
./gradlew connectedAndroidTest    # UI tests
```

### Backend Tests
```bash
cd backend
npm test                          # All tests
npm run test:watch                # Watch mode
```

### Target Coverage
- Android: 80%+
- Backend: 85%+

---

## 🚢 Deployment

### Backend (Railway)

```bash
cd backend
railway login
railway init
railway up
```

See: [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md)

### Android (Google Play)

1. Generate signed AAB
2. Upload to Play Console
3. Follow release process

---

## 📚 Documentation

### For Developers
- [📖 README](README.md) - This file
- [⚡ Quick Start](QUICKSTART.md) - Get running fast
- [🔧 Setup Guide](SETUP.md) - Detailed setup
- [🛠️ Tech Stack](TECH_STACK.md) - Technology details
- [🗺️ Roadmap](ROADMAP.md) - Development plan
- [🤝 Contributing](CONTRIBUTING.md) - How to contribute

### For Backend
- [🌐 Backend README](backend/README.md) - Backend overview
- [📡 API Docs](backend/API.md) - API reference
- [🏗️ Architecture](backend/ARCHITECTURE.md) - System design
- [🚀 Deployment](backend/DEPLOYMENT.md) - Deploy guide

### For Database
- [🗄️ Schema](database/schema.sql) - Complete schema
- [📊 ERD](docs/database-erd.png) - Entity relationship diagram (TBD)

---

## 🎯 Project Goals

### Technical Excellence
- ✅ Modern tech stack (Kotlin, Compose, Supabase, Node.js)
- ✅ Clean architecture
- ✅ 80%+ test coverage
- ✅ High performance
- ✅ Security-first approach

### User Experience
- ✅ Intuitive Material 3 UI
- ✅ Fast real-time messaging
- ✅ Seamless GIF integration
- ✅ Reliable notifications
- ✅ Smooth animations

### Business Goals
- ✅ 1,000+ downloads Week 1
- ✅ 4.0+ star rating
- ✅ 40%+ D1 retention
- ✅ Scalable infrastructure
- ✅ Clear growth path

---

## 📈 Current Status

| Component | Status |
|-----------|--------|
| **Android App** | 🟡 In Development |
| **Backend API** | 🟢 Ready |
| **Database** | 🟢 Schema Complete |
| **Deployment** | 🟢 Railway Configured |
| **Documentation** | 🟢 Comprehensive |
| **Tests** | 🟡 In Progress |

---

## 📞 Support & Community

- **Issues:** [GitHub Issues](https://github.com/darshanpania/jiffy/issues)
- **Discussions:** [GitHub Discussions](https://github.com/darshanpania/jiffy/discussions)
- **Email:** dev@jiffy.app
- **Twitter:** [@jiffyapp](https://twitter.com/jiffyapp)

---

## 🎉 Quick Links

- [🚀 Get Started](QUICKSTART.md)
- [📋 View Issues](https://github.com/darshanpania/jiffy/issues)
- [📊 Phase 1 Tracker](https://github.com/darshanpania/jiffy/issues/37)
- [🗺️ Master Roadmap](https://github.com/darshanpania/jiffy/issues/49)

---

<div align="center">

**Made with ❤️ using Kotlin • Supabase • Node.js • Jetpack Compose**

**[⭐ Star this repo](https://github.com/darshanpania/jiffy) | [👀 Watch updates](https://github.com/darshanpania/jiffy/subscription) | [🍴 Fork it](https://github.com/darshanpania/jiffy/fork)**

</div>
