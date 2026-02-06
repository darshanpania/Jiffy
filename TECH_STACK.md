# 🛠️ JIFFY Technology Stack

Complete overview of all technologies, frameworks, and services used in JIFFY.

---

## 📱 Frontend (Android)

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **Kotlin** | 1.9.22 | Primary programming language |
| **Jetpack Compose** | 2024.01.00 | Modern declarative UI framework |
| **Material Design 3** | Latest | UI design system |
| **Android SDK** | Min 24, Target 34 | Platform APIs |
| **Gradle** | 8.2 | Build system |

### Architecture & Patterns
| Component | Implementation |
|-----------|----------------|
| **Architecture** | Clean Architecture (MVVM) |
| **Dependency Injection** | Hilt |
| **Navigation** | Jetpack Navigation Compose |
| **State Management** | StateFlow, LiveData |
| **Coroutines** | kotlinx.coroutines |
| **Serialization** | kotlinx.serialization |

### Local Storage
| Technology | Purpose |
|------------|---------|
| **Room Database** | Local SQLite database with coroutines support |
| **DataStore** | Key-value storage (replacing SharedPreferences) |
| **EncryptedSharedPreferences** | Secure storage for sensitive data |

### Networking
| Library | Version | Purpose |
|---------|---------|---------|
| **Retrofit** | 2.9.0 | REST API client |
| **OkHttp** | 4.12.0 | HTTP client with interceptors |
| **Ktor Client** | 2.3.7 | HTTP client for Supabase |

### Image Loading
| Library | Purpose |
|---------|---------|
| **Coil** | Modern image loading for Compose with GIF support |
| **Glide** | Alternative image loading with advanced caching |

---

## ☁️ Backend & Services

### Supabase (Primary Backend)
| Service | Purpose | Features Used |
|---------|---------|---------------|
| **Supabase Auth** | User authentication | • Google OAuth<br>• Apple Sign-In<br>• JWT tokens<br>• Session management |
| **Supabase PostgreSQL** | Primary database | • Relational data<br>• Full-text search<br>• Row Level Security<br>• Triggers & functions |
| **Supabase Realtime** | Real-time features | • Live message updates<br>• Typing indicators<br>• Presence (online status)<br>• Broadcast channels |
| **Supabase Storage** | File storage | • User avatars<br>• Shared images<br>• Media files |

**SDK:** `supabase-kt 2.0.3`

**Why Supabase?**
- Open-source Firebase alternative
- PostgreSQL power with real-time capabilities
- Built-in authentication
- Excellent Kotlin support
- Self-hostable (Railway deployment)

### Firebase (Push Notifications ONLY)
| Service | Purpose | Why? |
|---------|---------|------|
| **Firebase Cloud Messaging (FCM)** | Push notifications | Industry standard for Android push notifications |

**SDK:** `firebase-messaging-ktx`

**Note:** Firebase is used ONLY for push notifications. All other features (auth, database, storage) use Supabase.

---

## 📊 Analytics & Monitoring

### PostHog
**Purpose:** Product analytics and user behavior tracking

**Features Used:**
- Event tracking
- User identification
- Feature flags (future)
- Session recording (optional)
- Funnels and retention analysis

**Why PostHog?**
- Privacy-focused (EU-friendly)
- Open-source
- Powerful analytics without complexity
- Better than Firebase Analytics for product insights

**SDK:** `posthog-android 3.1.5`

---

## 🖼️ GIF Integration

### GIPHY
**Purpose:** GIF search and content provider #1

**Integration:**
- Official GIPHY SDK for Android
- Trending GIFs
- Search functionality
- Category browsing
- GIF preview and sharing

**SDK:** `giphy-sdk-ui 2.3.11`

**API Key Required:** Yes (free tier available)

### Tenor (by Google)
**Purpose:** GIF search and content provider #2

**Integration:**
- REST API via Retrofit
- Featured/trending GIFs
- Search with filters
- Category support
- High-quality GIFs

**API:** REST API
**API Key Required:** Yes (Google Cloud project)

**Why Two GIF Providers?**
- More content variety
- Fallback if one service is down
- Different GIF styles and categories
- Better user experience

---

## 🚀 Deployment & Infrastructure

### Railway
**Purpose:** Backend deployment platform

**What's Deployed:**
- Supabase self-hosted instance (optional)
- API middleware/gateway (if needed)
- Background jobs
- WebSocket server (if custom needed)

**Why Railway?**
- Easy deployment from GitHub
- Good free tier
- Supports Docker
- Built-in PostgreSQL
- Environment variable management

---

## 🔗 Social Media Integration

### Facebook
**SDK:** `facebook-android-sdk 16.3.0`
**Features:**
- Share GIFs to timeline
- Share to Facebook Messenger
- Authentication (future)

### Twitter
**Integration:** Twitter API via OAuth
**Features:**
- Tweet GIFs
- Share with caption
- Direct message sharing (future)

### Instagram
**Integration:** Instagram Graph API
**Features:**
- Share GIFs to stories
- Share to feed (limitations apply)
- Direct messaging (future)

---

## 🧪 Testing

### Testing Frameworks
| Framework | Purpose |
|-----------|---------|
| **JUnit 4** | Unit testing |
| **Mockito Kotlin** | Mocking dependencies |
| **Turbine** | Testing Kotlin Flows |
| **Compose UI Test** | UI testing for Jetpack Compose |
| **Espresso** | Android UI testing |

### Quality Tools
| Tool | Purpose |
|------|---------|
| **ktlint** | Kotlin linting |
| **Detekt** | Static code analysis |
| **LeakCanary** | Memory leak detection (debug builds) |
| **Android Lint** | Android-specific linting |

---

## 📦 Key Dependencies

### Complete Dependency List

```kotlin
// Supabase
implementation("io.github.jan-tennert.supabase:postgrest-kt:2.0.3")
implementation("io.github.jan-tennert.supabase:gotrue-kt:2.0.3")
implementation("io.github.jan-tennert.supabase:realtime-kt:2.0.3")
implementation("io.github.jan-tennert.supabase:storage-kt:2.0.3")

// Firebase (FCM Only)
implementation(platform("com.google.firebase:firebase-bom:32.7.1"))
implementation("com.google.firebase:firebase-messaging-ktx")

// Authentication
implementation("com.google.android.gms:play-services-auth:20.7.0")

// PostHog
implementation("com.posthog:posthog-android:3.1.5")

// GIF Integration
implementation("com.giphy.sdk:ui:2.3.11")

// Jetpack Compose
implementation(platform("androidx.compose:compose-bom:2024.01.00"))
implementation("androidx.compose.ui:ui")
implementation("androidx.compose.material3:material3")
implementation("androidx.navigation:navigation-compose:2.7.6")

// Hilt
implementation("com.google.dagger:hilt-android:2.50")
kapt("com.google.dagger:hilt-android-compiler:2.50")

// Room
implementation("androidx.room:room-runtime:2.6.1")
implementation("androidx.room:room-ktx:2.6.1")
kapt("androidx.room:room-compiler:2.6.1")

// Networking
implementation("com.squareup.retrofit2:retrofit:2.9.0")
implementation("com.squareup.retrofit2:converter-gson:2.9.0")
implementation("com.squareup.okhttp3:okhttp:4.12.0")

// Image Loading
implementation("io.coil-kt:coil-compose:2.5.0")
implementation("io.coil-kt:coil-gif:2.5.0")

// Utilities
implementation("com.jakewharton.timber:timber:5.0.1")
```

---

## 🔐 Security & Privacy

### Security Measures
- ✅ **Supabase RLS** - Row Level Security on all tables
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **HTTPS Only** - All network requests encrypted
- ✅ **ProGuard/R8** - Code obfuscation in release builds
- ✅ **Encrypted Storage** - Sensitive data encrypted locally
- ✅ **Certificate Pinning** - Prevent MITM attacks (planned)

### Privacy Compliance
- ✅ **GDPR Compliant** - User data control and deletion
- ✅ **PostHog** - Privacy-focused analytics
- ✅ **No Password Storage** - OAuth only (Google/Apple)
- ✅ **Transparent Data Usage** - Clear privacy policy

---

## 📈 Performance Optimizations

### App Performance
- **Jetpack Compose** - Efficient UI rendering
- **Coil** - Advanced image caching with memory management
- **Room** - Local database caching for offline support
- **Coroutines** - Efficient async operations
- **Paging 3** - Efficient data loading (planned)

### Backend Performance
- **Supabase Connection Pooling** - Efficient database connections
- **PostgreSQL Indexes** - Fast queries
- **Realtime Subscriptions** - WebSocket for live updates
- **CDN** - Fast avatar and media delivery via Supabase Storage

---

## 🔮 Future Technologies

### Planned Additions
- **Jetpack CameraX** - In-app camera for image messages
- **ExoPlayer** - Video message support
- **WorkManager** - Background message sync
- **Biometric Auth** - Fingerprint/Face unlock
- **ML Kit** - GIF recommendations
- **WebRTC** - Voice/video calls

---

## 📚 Learning Resources

### Official Documentation
- [Kotlin Docs](https://kotlinlang.org/docs/home.html)
- [Jetpack Compose](https://developer.android.com/jetpack/compose)
- [Supabase Docs](https://supabase.com/docs)
- [Firebase FCM](https://firebase.google.com/docs/cloud-messaging)
- [PostHog Docs](https://posthog.com/docs)
- [GIPHY API](https://developers.giphy.com/docs/api/)
- [Tenor API](https://developers.google.com/tenor)

### Community
- [Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)
- [Android Dev Discord](https://discord.gg/android-dev)
- [Supabase Discord](https://discord.supabase.com)

---

## 📊 Comparison: Why This Stack?

### Supabase vs Firebase
| Feature | Supabase ✅ | Firebase |
|---------|-------------|----------|
| **Open Source** | Yes | No |
| **Database** | PostgreSQL (relational) | NoSQL (Firestore) |
| **Real-time** | Built-in | Firestore listeners |
| **Self-hostable** | Yes (Railway) | No |
| **Cost** | More predictable | Can scale unexpectedly |
| **SQL Support** | Full SQL power | Limited queries |

### PostHog vs Firebase Analytics
| Feature | PostHog ✅ | Firebase Analytics |
|---------|------------|-------------------|
| **Open Source** | Yes | No |
| **Privacy** | GDPR-friendly | Google-owned data |
| **Features** | Product analytics focus | Marketing focus |
| **Self-hostable** | Yes | No |
| **Cost** | Generous free tier | Limited free tier |

---

**Last Updated:** February 6, 2026  
**Maintained By:** Darshan Pania
