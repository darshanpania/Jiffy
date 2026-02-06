# 🏗️ JIFFY Backend Architecture

**Node.js/Express backend architecture for JIFFY GIF Messenger**

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Android App (Kotlin)                     │
│                   Jetpack Compose UI                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS/REST API
                         │ WebSocket (Supabase Realtime)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              JIFFY Backend (Node.js/Express)                 │
│                    Deployed on Railway                       │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  API Gateway Layer                    │   │
│  │  • Express.js routing                                 │   │
│  │  • Authentication middleware (JWT)                    │   │
│  │  • Rate limiting                                      │   │
│  │  • Request validation                                 │   │
│  │  • Error handling                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Controller Layer                     │   │
│  │  • AuthController                                     │   │
│  │  • UserController                                     │   │
│  │  • ChatController                                     │   │
│  │  • GifController                                      │   │
│  │  • NotificationController                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Service Layer                       │   │
│  │  • GiphyService (GIPHY API)                           │   │
│  │  • TenorService (Tenor API)                           │   │
│  │  • NotificationService (FCM)                          │   │
│  │  • CacheService (node-cache)                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                         │
                         ├─────────────────┬──────────────────┐
                         ▼                 ▼                  ▼
┌──────────────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│   Supabase on Railway    │  │  Firebase FCM   │  │  External APIs   │
│                          │  │  (Push Only)    │  │                  │
│  • PostgreSQL Database   │  │                 │  │  • GIPHY API     │
│  • Auth (Google/Apple)   │  │  • Send Push    │  │  • Tenor API     │
│  • Realtime (WebSocket)  │  │  • Manage Tokens│  │                  │
│  • Storage (CDN)         │  │                 │  │                  │
│  • Row Level Security    │  └─────────────────┘  └──────────────────┘
└──────────────────────────┘
```

Complete architecture details with request flows, security layers, caching strategy, error handling, logging, monitoring, and scalability considerations.

**See full documentation in the file.**
