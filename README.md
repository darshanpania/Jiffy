# 🎬 JIFFY - GIF Messenger

> Express yourself better with GIFs! A modern Android messaging app built with Kotlin, Jetpack Compose, and Supabase.

[![Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://developer.android.com)
[![Kotlin](https://img.shields.io/badge/Language-Kotlin-blue.svg)](https://kotlinlang.org)
[![Jetpack Compose](https://img.shields.io/badge/UI-Jetpack%20Compose-4285F4.svg)](https://developer.android.com/jetpack/compose)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E.svg)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📱 Overview

JIFFY is a next-generation GIF-powered messaging application that makes conversations more fun and expressive. Built with modern Android development practices, JIFFY offers real-time messaging, seamless GIF integration from multiple sources, group chats, and social media sharing.

### ✨ Key Features

- 🔐 **Secure Authentication** - Google and Apple Sign-In via Supabase Auth
- 💬 **Real-Time Messaging** - Instant message delivery using Supabase Realtime
- 🎨 **Dual GIF Sources** - Search and share GIFs from both GIPHY and Tenor
- 👥 **Group Chats** - Create and manage group conversations
- 📱 **Social Sharing** - Share GIFs directly to Facebook, Twitter, and Instagram
- 🔔 **Push Notifications** - Firebase Cloud Messaging for instant alerts
- 📊 **Analytics** - PostHog integration for user insights
- 🌐 **Offline Support** - Queue messages when offline, sync when online
- 🎯 **Friend System** - Discover, add, and manage friends
- ⚡ **High Performance** - Built with Jetpack Compose and modern architecture

---

## 🏗️ Tech Stack

### Frontend (Android)
- **Language:** Kotlin 1.9.22
- **UI Framework:** Jetpack Compose with Material 3
- **Architecture:** Clean Architecture (MVVM)
- **Dependency Injection:** Hilt
- **Navigation:** Jetpack Navigation Compose
- **Image Loading:** Coil (GIF support)
- **Local Database:** Room
- **Coroutines:** Kotlinx Coroutines
- **Min SDK:** 24 (Android 7.0)
- **Target SDK:** 34 (Android 14)

### Backend & Services
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth (Google & Apple Sign-In only)
- **Real-time:** Supabase Realtime
- **Storage:** Supabase Storage (avatars, media)
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Deployment:** Railway
- **Analytics:** PostHog

### APIs & Integrations
- **GIF Sources:** 
  - GIPHY SDK
  - Tenor API (Google)
- **Social Media:**
  - Facebook SDK
  - Twitter API
  - Instagram API
- **Networking:** Retrofit + OkHttp

---

## 📂 Project Structure

```
jiffy/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/darshan/jiffy/
│   │   │   │   ├── data/
│   │   │   │   │   ├── local/           # Room database
│   │   │   │   │   ├── remote/          # API services
│   │   │   │   │   ├── repository/      # Repository implementations
│   │   │   │   │   └── service/         # FCM service
│   │   │   │   ├── di/                  # Hilt dependency injection
│   │   │   │   ├── domain/
│   │   │   │   │   ├── model/           # Business models
│   │   │   │   │   ├── repository/      # Repository interfaces
│   │   │   │   │   └── usecase/         # Use cases
│   │   │   │   ├── presentation/
│   │   │   │   │   ├── auth/            # Authentication screens
│   │   │   │   │   ├── chat/            # Chat screens
│   │   │   │   │   ├── friends/         # Friends management
│   │   │   │   │   ├── group/           # Group chat
│   │   │   │   │   ├── profile/         # User profile
│   │   │   │   │   ├── gif/             # GIF picker
│   │   │   │   │   ├── navigation/      # Navigation
│   │   │   │   │   └── theme/           # Compose theme
│   │   │   │   └── JiffyApplication.kt
│   │   │   └── res/                     # Resources
│   │   └── test/                        # Unit tests
│   └── build.gradle.kts
├── gradle/
├── build.gradle.kts
├── settings.gradle.kts
├── local.properties.example             # Configuration template
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Android Studio** Hedgehog (2023.1.1) or newer
- **JDK** 17 or higher
- **Kotlin** 1.9.22+
- **Gradle** 8.2+
- **Android SDK** API 34
- **Supabase Account** - [Sign up](https://supabase.com)
- **Firebase Project** - [Console](https://console.firebase.google.com)
- **GIPHY API Key** - [Developers Portal](https://developers.giphy.com)
- **Tenor API Key** - [Google Cloud Console](https://console.cloud.google.com)
- **PostHog Account** - [Sign up](https://posthog.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/darshanpania/jiffy.git
   cd jiffy
   ```

2. **Create `local.properties` file**
   ```bash
   cp local.properties.example local.properties
   ```

3. **Configure API Keys in `local.properties`**
   ```properties
   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   
   # Google Sign-In
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   
   # API Keys
   GIPHY_API_KEY=your-giphy-api-key
   TENOR_API_KEY=your-tenor-api-key
   POSTHOG_API_KEY=phc_your-posthog-key
   
   # Social Media (Optional)
   FACEBOOK_APP_ID=your-facebook-app-id
   TWITTER_API_KEY=your-twitter-api-key
   ```

4. **Setup Supabase Database**

   Run the following SQL in your Supabase SQL Editor:
   
   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
       id UUID REFERENCES auth.users PRIMARY KEY,
       email TEXT UNIQUE NOT NULL,
       display_name TEXT NOT NULL,
       photo_url TEXT,
       bio TEXT,
       phone_number TEXT,
       created_at TIMESTAMPTZ DEFAULT NOW(),
       updated_at TIMESTAMPTZ DEFAULT NOW(),
       is_online BOOLEAN DEFAULT FALSE,
       last_seen TIMESTAMPTZ
   );
   
   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   
   -- Create policies
   CREATE POLICY "Public profiles are viewable by everyone"
   ON profiles FOR SELECT USING (true);
   
   CREATE POLICY "Users can update own profile"
   ON profiles FOR UPDATE USING (auth.uid() = id);
   ```
   
   See [database/schema.sql](database/schema.sql) for complete schema.

5. **Setup Firebase Cloud Messaging**
   
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Add your Android app to the project
   - Download `google-services.json`
   - Place it in `app/` directory
   - Enable Cloud Messaging in Firebase Console

6. **Build and Run**
   ```bash
   ./gradlew assembleDebug
   ```
   
   Or open in Android Studio and click Run ▶️

---

## 🎯 Core Features

### 1. Authentication
- **Google Sign-In** - One-tap authentication via Supabase Auth
- **Apple Sign-In** - Secure login for Apple users
- **Session Management** - Automatic token refresh
- **Offline Mode** - Cached authentication state

### 2. Messaging
- **Real-Time Chat** - Powered by Supabase Realtime
- **One-on-One** - Private conversations
- **Group Chat** - Up to 100 members per group
- **Message Types** - Text, GIFs, and images
- **Typing Indicators** - See when someone is typing
- **Read Receipts** - Message delivery and read status
- **Offline Queue** - Messages sync when connection restored

### 3. GIF Integration
- **Dual Sources** - GIPHY and Tenor integration
- **Search** - Find the perfect GIF by keyword
- **Trending** - Popular GIFs updated daily
- **Categories** - Browse by emotion/category
- **Favorites** - Save favorite GIFs to Supabase
- **Quick Send** - One-tap GIF sending

### 4. Friend System
- **User Search** - Find friends by name or email
- **Friend Requests** - Send, accept, or decline requests
- **Online Status** - See who's online in real-time
- **Mutual Friends** - Discover mutual connections

### 5. Social Sharing
- **Facebook** - Share GIFs to timeline
- **Twitter** - Tweet GIFs directly
- **Instagram** - Share to stories
- **Copy Link** - Share anywhere

### 6. Push Notifications
- **Message Alerts** - FCM for instant notifications
- **Friend Requests** - Get notified of new requests
- **Group Updates** - Stay informed about group activity
- **Customizable** - Mute specific chats or users

---

## 🗄️ Database Schema

### Supabase PostgreSQL Tables

**profiles** - User profile information
```sql
id              UUID PRIMARY KEY (references auth.users)
email           TEXT UNIQUE NOT NULL
display_name    TEXT NOT NULL
photo_url       TEXT
bio             TEXT
is_online       BOOLEAN DEFAULT FALSE
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

**messages** - Chat messages
```sql
id              UUID PRIMARY KEY
chat_id         UUID NOT NULL
sender_id       UUID REFERENCES auth.users
content         TEXT NOT NULL
type            TEXT (TEXT, GIF, IMAGE)
status          TEXT (SENDING, SENT, DELIVERED, READ)
created_at      TIMESTAMPTZ
```

**chat_rooms** - Chat room metadata
```sql
id              UUID PRIMARY KEY
type            TEXT (DIRECT, GROUP)
name            TEXT
created_by      UUID REFERENCES auth.users
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

**chat_participants** - Chat membership
```sql
chat_id         UUID REFERENCES chat_rooms
user_id         UUID REFERENCES auth.users
role            TEXT (MEMBER, ADMIN)
joined_at       TIMESTAMPTZ
unread_count    INT DEFAULT 0
```

**friendships** - Friend relationships
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users
friend_id       UUID REFERENCES auth.users
created_at      TIMESTAMPTZ
```

**friend_requests** - Friend request management
```sql
id              UUID PRIMARY KEY
sender_id       UUID REFERENCES auth.users
receiver_id     UUID REFERENCES auth.users
status          TEXT (PENDING, ACCEPTED, DECLINED)
created_at      TIMESTAMPTZ
```

**favorite_gifs** - Saved GIFs
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users
gif_url         TEXT NOT NULL
gif_source      TEXT (GIPHY, TENOR)
title           TEXT
thumbnail_url   TEXT
created_at      TIMESTAMPTZ
```

See complete schema with RLS policies: [database/schema.sql](database/schema.sql)

---

## 🔐 Security & Privacy

### Authentication Security
- ✅ OAuth 2.0 via Supabase Auth
- ✅ JWT token-based authentication
- ✅ Automatic token refresh
- ✅ Secure token storage (EncryptedSharedPreferences)
- ✅ Google and Apple Sign-In only (no password storage)

### Data Security
- ✅ Row Level Security (RLS) on all Supabase tables
- ✅ End-to-end message encryption (planned)
- ✅ HTTPS/TLS for all network requests
- ✅ ProGuard/R8 code obfuscation in release builds
- ✅ No sensitive data in logs (production)

### Privacy
- ✅ GDPR compliant
- ✅ Clear privacy policy
- ✅ User data deletion on request
- ✅ No data selling or third-party sharing
- ✅ PostHog analytics - privacy-focused

---

## 📊 Analytics & Monitoring

### PostHog Events
- User authentication (sign in, sign out)
- Message sending/receiving
- GIF searches and selections
- Friend requests and acceptances
- Group chat creation
- Social media shares
- Feature usage patterns

### Performance Monitoring
- Supabase PostgreSQL query performance
- API response times (GIPHY, Tenor)
- App startup time
- Message delivery latency
- Crash reporting (LeakCanary in debug)

---

## 🧪 Testing

### Unit Tests
```bash
./gradlew test
```

### Instrumented Tests
```bash
./gradlew connectedAndroidTest
```

### Test Coverage
- Repository layer: 85%+
- ViewModel layer: 80%+
- Use case layer: 90%+
- Overall target: 80%+

---

## 🚢 Deployment

### Railway Backend Deployment

1. **Create Railway Project**
   ```bash
   railway login
   railway init
   ```

2. **Configure Environment Variables**
   ```bash
   railway variables set SUPABASE_URL=your-url
   railway variables set SUPABASE_SERVICE_KEY=your-key
   ```

3. **Deploy**
   ```bash
   railway up
   ```

### Android App Release

1. **Generate Release Build**
   ```bash
   ./gradlew assembleRelease
   ```

2. **Sign APK/AAB**
   - Configure signing in `app/build.gradle.kts`
   - Use Android Studio's Generate Signed Bundle/APK

3. **Upload to Google Play Console**
   - Internal testing → Closed testing → Production

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow [Kotlin Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html)
- Use [ktlint](https://github.com/pinterest/ktlint) for linting
- Write meaningful commit messages

---

## 📝 Roadmap

### Phase 1: MVP (Weeks 1-8) ✅
- [x] Project setup and architecture
- [x] Supabase authentication (Google/Apple)
- [x] User profile management
- [x] Friend system (discovery, requests)
- [x] One-on-one chat with Supabase Realtime
- [x] GIPHY and Tenor integration

### Phase 2: Enhanced Features (Weeks 9-12) 🚧
- [ ] Group chat functionality
- [ ] Read receipts and message status
- [ ] Social media sharing (Facebook, Twitter, Instagram)
- [ ] Push notifications with FCM
- [ ] Online/offline presence
- [ ] Message reactions

### Phase 3: Polish & Launch (Weeks 13-16) 📅
- [ ] Comprehensive testing suite
- [ ] Performance optimization
- [ ] Security audit
- [ ] Beta testing program
- [ ] Play Store optimization
- [ ] Production release

### Future Enhancements
- [ ] Voice messages
- [ ] Video calls
- [ ] Message encryption (E2E)
- [ ] Stickers and emojis
- [ ] Themes and customization
- [ ] Multi-device sync
- [ ] Desktop/Web versions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Project Lead:** Darshan Pania  
**GitHub:** [@darshanpania](https://github.com/darshanpania)

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [GIPHY](https://giphy.com) - GIF content provider
- [Tenor](https://tenor.com) - GIF content provider
- [PostHog](https://posthog.com) - Analytics platform
- [Firebase](https://firebase.google.com) - Cloud messaging
- [Railway](https://railway.app) - Deployment platform
- [Jetpack Compose](https://developer.android.com/jetpack/compose) - Modern UI toolkit

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/darshanpania/jiffy/issues)
- **Email:** support@jiffy.app
- **Documentation:** [Wiki](https://github.com/darshanpania/jiffy/wiki)

---

## 📱 Screenshots

*Coming soon...*

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=darshanpania/jiffy&type=Date)](https://star-history.com/#darshanpania/jiffy&Date)

---

<div align="center">

**Made with ❤️ and Kotlin**

[Website](https://jiffy.app) • [Twitter](https://twitter.com/jiffyapp) • [Instagram](https://instagram.com/jiffyapp)

</div>
