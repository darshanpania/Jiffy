# 🎬 JIFFY - GIF Messenger

> Express yourself better with GIFs! A modern Android messaging app built with Kotlin, Jetpack Compose, Supabase, and a Node.js backend.

[![Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://developer.android.com)
[![Kotlin](https://img.shields.io/badge/Language-Kotlin-blue.svg)](https://kotlinlang.org)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933.svg)](https://nodejs.org)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E.svg)](https://supabase.com)
[![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E.svg)](https://railway.app)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📱 Overview

JIFFY is a next-generation GIF-powered messaging application that makes conversations more fun and expressive. Built with modern Android development practices and a scalable Node.js backend deployed on Railway.

### ✨ Key Features

- 🔐 **Secure Authentication** - Google and Apple Sign-In via Supabase Auth
- 💬 **Real-Time Messaging** - Instant message delivery using Supabase Realtime
- 🎨 **Dual GIF Sources** - Search and share GIFs from both GIPHY and Tenor
- 👥 **Group Chats** - Create and manage group conversations (up to 100 members)
- 📱 **Social Sharing** - Share GIFs directly to Facebook, Twitter, and Instagram
- 🔔 **Push Notifications** - Firebase Cloud Messaging for instant alerts
- 📊 **Analytics** - PostHog integration for user insights
- 🌐 **Offline Support** - Queue messages when offline, sync when online
- 🎯 **Friend System** - Discover, add, and manage friends
- ⚡ **High Performance** - Built with Jetpack Compose and optimized backend

---

## 🏗️ Architecture

### System Overview

```
┌──────────────────────┐
│   Android App        │
│   (Kotlin/Compose)   │
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    ↓             ↓
┌─────────┐  ┌──────────────┐
│ Backend │  │   Supabase   │
│ Node.js │  │  (Direct)    │
│ Railway │  │  • Realtime  │
│         │  │  • Storage   │
│ • APIs  │  │  • Auth      │
│ • FCM   │  │  • Database  │
└─────────┘  └──────────────┘
```

### Tech Stack

#### **Frontend (Android)**
- **Language:** Kotlin 1.9.22
- **UI:** Jetpack Compose + Material 3
- **Architecture:** Clean Architecture (MVVM)
- **DI:** Hilt
- **Local DB:** Room
- **Image Loading:** Coil (GIF support)
- **Min SDK:** 24 | **Target SDK:** 34

#### **Backend (Node.js)**
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** JavaScript (ES6+)
- **Logging:** Winston
- **Caching:** node-cache
- **Testing:** Jest
- **Deployment:** Railway (Docker)

#### **Services & APIs**
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth (Google & Apple)
- **Real-time:** Supabase Realtime
- **Storage:** Supabase Storage
- **Push Notifications:** Firebase Cloud Messaging (FCM ONLY)
- **Analytics:** PostHog
- **GIF APIs:** GIPHY SDK + Tenor API
- **Deployment:** Railway

---

## 📂 Project Structure

```
jiffy/
├── app/                    # Android app
│   ├── src/main/
│   │   ├── java/com/darshan/jiffy/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   ├── presentation/
│   │   │   └── di/
│   │   └── res/
│   └── build.gradle.kts
│
├── backend/                # Node.js backend
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utilities
│   │   └── server.js      # Main server
│   ├── tests/             # Backend tests
│   ├── scripts/           # Deployment scripts
│   ├── Dockerfile
│   ├── railway.json
│   ├── package.json
│   └── README.md          # Backend docs
│
├── database/
│   └── schema.sql         # Supabase PostgreSQL schema
│
├── .github/
│   ├── workflows/
│   │   └── backend-ci.yml # Backend CI/CD
│   └── ISSUE_TEMPLATE/
│
├── README.md              # This file
├── TECH_STACK.md
├── SETUP.md
├── BACKEND_INTEGRATION.md
└── LICENSE
```

---

## 🚀 Getting Started

### Prerequisites

**For Android Development:**
- Android Studio Hedgehog (2023.1.1+)
- JDK 17+
- Android SDK (API 24-34)

**For Backend Development:**
- Node.js 18+
- npm 9+

**Required Accounts:**
- Supabase account
- Firebase account (FCM)
- GIPHY developer account
- Google Cloud (Tenor API)
- PostHog account
- Railway account

### Quick Start

#### Android App

```bash
# Clone repository
git clone https://github.com/darshanpania/jiffy.git
cd jiffy

# Configure Android
cp local.properties.example local.properties
# Edit local.properties with API keys

# Build
./gradlew assembleDebug
```

#### Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with credentials

# Run development server
npm run dev

# Server starts at http://localhost:3000
```

### Full Setup Guide

See [SETUP.md](SETUP.md) for complete setup instructions.

---

## 🔗 Backend Integration

### When to Use Backend vs Supabase Direct

**Use Backend API:**
- 🎨 GIF search (GIPHY/Tenor) - caching + security
- 🔔 Push notifications (FCM) - token management
- 📊 Analytics aggregation (future)

**Use Supabase Direct:**
- 💬 Real-time messaging - WebSocket efficiency
- 💾 Database CRUD - RLS security
- 📁 File uploads - Direct to Storage
- 🔐 Authentication - OAuth flows

See [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) for details.

---

## 📡 API Endpoints

**Backend provides RESTful API:**

- **Auth:** `/api/auth/*`
- **Users:** `/api/users/*`
- **Chats:** `/api/chats/*`
- **GIFs:** `/api/gifs/*`
- **Notifications:** `/api/notifications/*`

**Full API documentation:** [backend/API.md](backend/API.md)

---

## 🗄️ Database

**Supabase PostgreSQL (12 Tables):**

1. `profiles` - User profiles
2. `friendships` - Friend relationships
3. `friend_requests` - Friend requests
4. `chat_rooms` - Chat metadata
5. `chat_participants` - Chat membership
6. `messages` - All messages
7. `favorite_gifs` - Saved GIFs
8. `user_devices` - FCM tokens
9. `group_settings` - Group config
10. `group_invites` - Group invitations
11. `message_reads` - Read receipts
12. `chat_notification_preferences` - Notification settings

**All protected by Row Level Security (RLS)**

Schema: [database/schema.sql](database/schema.sql)

---

## 🚀 Deployment

### Android App
- **Build:** `./gradlew assembleRelease`
- **Distribution:** Google Play Store
- **Signing:** Configure in `app/build.gradle.kts`

### Backend
- **Platform:** Railway
- **Method:** Docker (Dockerfile)
- **Deploy:** `railway up` or GitHub push
- **URL:** `https://your-app.railway.app`

**Deployment guide:** [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md)

---

## 🧪 Testing

### Android Tests
```bash
# Unit tests
./gradlew test

# UI tests
./gradlew connectedAndroidTest
```

### Backend Tests
```bash
cd backend

# Run tests
npm test

# With coverage
npm test -- --coverage
```

---

## 📚 Documentation

### For Developers
- [README.md](README.md) - This file
- [TECH_STACK.md](TECH_STACK.md) - Complete tech stack
- [SETUP.md](SETUP.md) - Detailed setup guide
- [QUICKSTART.md](QUICKSTART.md) - Quick start (10 min)
- [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) - Backend integration

### Backend Specific
- [backend/README.md](backend/README.md) - Backend overview
- [backend/API.md](backend/API.md) - API documentation
- [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) - Deployment guide
- [backend/ARCHITECTURE.md](backend/ARCHITECTURE.md) - Architecture
- [backend/GETTING_STARTED.md](backend/GETTING_STARTED.md) - Quick start

### Contributing
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- [ROADMAP.md](ROADMAP.md) - Development roadmap

---

## 🎯 Roadmap

### Phase 1: MVP Core (Weeks 1-8) ✅ Planned
- Authentication (Google/Apple)
- User profiles
- Friend system
- One-on-one chat
- GIF integration (GIPHY + Tenor)

### Phase 2: Enhanced Features (Weeks 9-12) ✅ Planned
- Group chats (100 members)
- Social media sharing
- Read receipts
- Enhanced notifications

### Phase 3: Polish & Release (Weeks 13-16) ✅ Planned
- Comprehensive testing
- Load testing
- Security audit
- Beta testing
- Production launch

**Track progress:** [Issue #49 - Master Roadmap](https://github.com/darshanpania/jiffy/issues/49)

---

## 🔐 Security & Privacy

### Security Features
- ✅ Supabase Row Level Security (RLS)
- ✅ JWT authentication
- ✅ OAuth 2.0 (Google/Apple)
- ✅ Encrypted token storage
- ✅ ProGuard/R8 obfuscation
- ✅ HTTPS only
- ✅ Backend rate limiting

### Privacy
- ✅ GDPR compliant
- ✅ No password storage (OAuth only)
- ✅ PostHog privacy-focused
- ✅ No message content in analytics
- ✅ User data control

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/jiffy.git

# Create feature branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m 'feat: add amazing feature'

# Push and create PR
git push origin feature/amazing-feature
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 👥 Team

**Project Lead:** Darshan Pania  
**GitHub:** [@darshanpania](https://github.com/darshanpania)  
**Email:** dev@jiffy.app

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [Railway](https://railway.app) - Deployment platform
- [GIPHY](https://giphy.com) - GIF content
- [Tenor](https://tenor.com) - GIF content
- [PostHog](https://posthog.com) - Analytics
- [Firebase](https://firebase.google.com) - Cloud messaging
- [Jetpack Compose](https://developer.android.com/jetpack/compose) - UI toolkit

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/darshanpania/jiffy/issues)
- **Email:** support@jiffy.app
- **Documentation:** [Wiki](https://github.com/darshanpania/jiffy/wiki)

---

## 🌟 Quick Links

### Android
- [Android Setup](SETUP.md)
- [Quick Start](QUICKSTART.md)
- [Tech Stack](TECH_STACK.md)

### Backend
- [Backend README](backend/README.md)
- [API Docs](backend/API.md)
- [Deploy Guide](backend/DEPLOYMENT.md)
- [Architecture](backend/ARCHITECTURE.md)

### Project
- [Roadmap](ROADMAP.md)
- [All Issues](https://github.com/darshanpania/jiffy/issues)
- [Phase 1 Tracker](https://github.com/darshanpania/jiffy/issues/37)

---

<div align=\"center\">

**Made with ❤️ using Kotlin, Node.js, and Supabase**

[Website](https://jiffy.app) • [Twitter](https://twitter.com/jiffyapp) • [Instagram](https://instagram.com/jiffyapp)

</div>
