# 🔗 JIFFY Backend Integration Guide

**How the Android app integrates with the Node.js backend**

---

## 📊 System Architecture

```
┌──────────────────────────────────────────────────────┐
│             Android App (Kotlin)                      │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │  Presentation Layer (Jetpack Compose)          │  │
│  │  • UI Components                                │  │
│  │  • ViewModels                                   │  │
│  └────────────────────────────────────────────────┘  │
│                       ↓                               │
│  ┌────────────────────────────────────────────────┐  │
│  │  Domain Layer                                   │  │
│  │  • Use Cases                                    │  │
│  │  • Business Logic                               │  │
│  └────────────────────────────────────────────────┘  │
│                       ↓                               │
│  ┌────────────────────────────────────────────────┐  │
│  │  Data Layer                                     │  │
│  │  • Repositories                                 │  │
│  │  • API Services (Retrofit)                      │  │
│  │  • Room Database (Cache)                        │  │
│  │  • Supabase Client (Direct)                     │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                       ↓
         ┌─────────────┴─────────────┐
         ↓                           ↓
┌─────────────────┐        ┌─────────────────────┐
│  JIFFY Backend  │        │  Supabase Direct    │
│  (Node.js/      │        │  (from Android)     │
│   Express)      │        │                     │
│                 │        │  • Realtime (WS)    │
│  • REST API     │        │  • Storage Upload   │
│  • FCM Relay    │        │  • Auth Verify      │
│  • GIF Proxy    │        │                     │
└─────────────────┘        └─────────────────────┘
         ↓                           ↓
    ┌────┴────┬──────────────────────┴─────┐
    ↓         ↓                            ↓
┌────────┐ ┌────────┐              ┌──────────────┐
│Firebase│ │ GIPHY  │              │   Supabase   │
│  FCM   │ │ Tenor  │              │  PostgreSQL  │
└────────┘ └────────┘              └──────────────┘
```

---

## 🎯 When to Use Backend vs Direct Supabase

### Use Backend API For:

✅ **GIF Operations**
- Search GIFs (GIPHY/Tenor)
- Get trending GIFs
- Proxy GIF requests
- Cache GIF results

✅ **Push Notifications**
- Send FCM notifications
- Manage FCM tokens
- Notification preferences

✅ **Complex Operations**
- Multi-step workflows
- Rate limiting enforcement
- Business logic processing

### Use Supabase Directly For:

✅ **Real-time Features**
- Message subscriptions (Realtime channels)
- Typing indicators (Broadcast)
- Online presence (Presence)

✅ **Database Operations**
- CRUD on profiles, messages, chats
- Friend requests
- Message reads
- (Protected by RLS policies)

✅ **File Uploads**
- Avatar uploads (Supabase Storage)
- Group photos
- Shared images

✅ **Authentication**
- Sign in with Google/Apple
- Session management
- Token refresh

---

## 📱 Android App Configuration

### 1. Add Backend URL

**local.properties:**
```properties
BACKEND_API_URL=https://your-app.railway.app
```

**build.gradle.kts:**
```kotlin
android {
    defaultConfig {
        buildConfigField(\"String\", \"BACKEND_URL\", 
            \"\\\"${project.properties[\"BACKEND_API_URL\"] ?: \"http://localhost:3000\"}\\\"\")
    }
}
```

### 2. Create Retrofit Service

**ApiService.kt:**
```kotlin
interface JiffyBackendApi {
    @GET(\"gifs/search\")
    suspend fun searchGifs(
        @Query(\"q\") query: String,
        @Query(\"source\") source: String = \"giphy\",
        @Query(\"limit\") limit: Int = 25
    ): GifSearchResponse
    
    @GET(\"gifs/trending\")
    suspend fun getTrendingGifs(
        @Query(\"source\") source: String = \"giphy\",
        @Query(\"limit\") limit: Int = 25
    ): GifSearchResponse
    
    @POST(\"users/fcm-token\")
    suspend fun updateFcmToken(
        @Body request: FcmTokenRequest
    ): MessageResponse
    
    @POST(\"chats/{chatId}/messages\")
    suspend fun sendMessage(
        @Path(\"chatId\") chatId: String,
        @Body message: SendMessageRequest
    ): Message
}
```

### 3. Add Auth Interceptor

**AuthInterceptor.kt:**
```kotlin
class AuthInterceptor(
    private val tokenProvider: () -> String?
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = tokenProvider()
        
        val request = if (token != null) {
            chain.request()
                .newBuilder()
                .addHeader(\"Authorization\", \"Bearer $token\")
                .build()
        } else {
            chain.request()
        }
        
        return chain.proceed(request)
    }
}
```

### 4. Setup Retrofit

**NetworkModule.kt (Hilt):**
```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: AuthInterceptor
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) 
                    HttpLoggingInterceptor.Level.BODY 
                else 
                    HttpLoggingInterceptor.Level.NONE
            })
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }
    
    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(\"${BuildConfig.BACKEND_URL}/api/\")
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    @Provides
    @Singleton
    fun provideJiffyApi(retrofit: Retrofit): JiffyBackendApi {
        return retrofit.create(JiffyBackendApi::class.java)
    }
}
```

---

## 🔄 Hybrid Architecture Pattern

### Example: Send Message

**Uses BOTH Backend and Supabase Direct:**

```kotlin
class ChatRepository @Inject constructor(
    private val supabase: SupabaseClient,
    private val backendApi: JiffyBackendApi
) {
    // Option 1: Direct to Supabase (faster, real-time)
    suspend fun sendMessageDirect(chatId: String, content: String): Result<Message> {
        return try {
            val message = supabase.from(\"messages\")
                .insert(mapOf(
                    \"chat_id\" to chatId,
                    \"sender_id\" to supabase.auth.currentUserOrNull()?.id,
                    \"content\" to content,
                    \"type\" to \"TEXT\",
                    \"status\" to \"SENT\"
                ))
                .decodeSingle<Message>()
            
            Result.success(message)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Option 2: Via Backend (for notifications)
    suspend fun sendMessageViaBackend(chatId: String, content: String): Result<Message> {
        return try {
            val response = backendApi.sendMessage(
                chatId,
                SendMessageRequest(content, \"TEXT\")
            )
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Hybrid: Direct insert + backend notification
    suspend fun sendMessage(chatId: String, content: String): Result<Message> {
        return try {
            // 1. Insert directly to Supabase (fast)
            val message = sendMessageDirect(chatId, content).getOrThrow()
            
            // 2. Backend triggers FCM asynchronously
            // (happens via Supabase trigger or webhook)
            
            Result.success(message)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

---

## 📡 Real-time via Supabase (Not Backend)

**Android app connects directly to Supabase Realtime:**

```kotlin
class RealtimeRepository @Inject constructor(
    private val supabase: SupabaseClient
) {
    // Subscribe to messages (direct WebSocket to Supabase)
    fun subscribeToMessages(chatId: String): Flow<Message> = callbackFlow {
        val channel = supabase.realtime.createChannel(\"chat:$chatId\")
        
        channel.on(
            SupabaseEvent.PostgresChange(
                schema = \"public\",
                table = \"messages\",
                filter = \"chat_id=eq.$chatId\"
            )
        ) { payload ->
            when (payload) {
                is SupabaseEvent.PostgresChange.Insert -> {
                    val message = payload.decodeRecord<Message>()
                    trySend(message)
                }
            }
        }
        
        channel.subscribe()
        awaitClose { channel.unsubscribe() }
    }
}
```

**Backend is NOT used for real-time** - Supabase handles this natively.

---

## 🎨 GIF Integration Pattern

### Search GIFs via Backend

```kotlin
class GifRepository @Inject constructor(
    private val backendApi: JiffyBackendApi
) {
    suspend fun searchGifs(
        query: String,
        source: GifSource
    ): Result<List<GifItem>> {
        return try {
            val response = backendApi.searchGifs(
                query = query,
                source = source.name.lowercase(),
                limit = 25
            )
            
            Result.success(response.results)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

**Why via backend?**
- ✅ Centralized API key management
- ✅ Caching reduces API costs
- ✅ Rate limiting protection
- ✅ Consistent response format

---

## 🔔 FCM Token Management

### Register FCM Token

```kotlin
class FcmRepository @Inject constructor(
    private val backendApi: JiffyBackendApi
) {
    suspend fun updateFcmToken(token: String) {
        try {
            backendApi.updateFcmToken(
                FcmTokenRequest(
                    token = token,
                    deviceType = \"android\"
                )
            )
            
            Timber.d(\"FCM token updated on backend\")
        } catch (e: Exception) {
            Timber.e(e, \"Failed to update FCM token\")
        }
    }
}
```

### FCM Service

```kotlin
@AndroidEntryPoint
class JiffyFirebaseMessagingService : FirebaseMessagingService() {
    
    @Inject
    lateinit var fcmRepository: FcmRepository
    
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        
        // Update token on backend
        lifecycleScope.launch {
            fcmRepository.updateFcmToken(token)
        }
    }
}
```

---

## 🔐 Authentication Flow

### Complete Auth Flow

```
1. User taps \"Sign in with Google\" in Android app
   ↓
2. Supabase Auth handles OAuth
   ↓
3. Supabase returns JWT + refresh token
   ↓
4. Android stores tokens securely
   ↓
5. Android includes JWT in ALL API requests:
   - Backend API: Authorization: Bearer <jwt>
   - Supabase direct: Client configured with token
   ↓
6. Backend validates JWT with Supabase on each request
   ↓
7. Supabase RLS uses JWT to enforce permissions
```

---

## 📊 Data Flow Patterns

### Pattern 1: Direct to Supabase
**Use for:** CRUD operations, real-time subscriptions

```kotlin
// Example: Update profile
suspend fun updateProfile(name: String) {
    supabase.from(\"profiles\")
        .update(mapOf(\"display_name\" to name))
        .eq(\"id\", userId)
        .execute()
}
```

### Pattern 2: Via Backend API
**Use for:** GIF search, sending notifications

```kotlin
// Example: Search GIFs
suspend fun searchGifs(query: String) {
    backendApi.searchGifs(query, \"giphy\", 25)
}
```

### Pattern 3: Hybrid
**Use for:** Complex operations with side effects

```kotlin
// Example: Send message
suspend fun sendMessage(chatId: String, content: String) {
    // 1. Insert via Supabase (fast, real-time)
    val message = supabase.from(\"messages\")
        .insert(...)
        .decodeSingle<Message>()
    
    // 2. Supabase trigger calls backend webhook
    // 3. Backend sends FCM notifications
    
    return message
}
```

---

## 🌐 Network Configuration

### Retrofit Setup

**Base URLs:**
- Backend API: `https://your-app.railway.app/api/`
- Supabase: `https://your-project.supabase.co`

**Timeouts:**
- Connect: 30 seconds
- Read: 30 seconds
- Write: 30 seconds

**Interceptors:**
1. Auth Interceptor (adds JWT)
2. Logging Interceptor (debug builds)
3. Retry Interceptor (network errors)

---

## 🔄 Offline Support

### Offline Strategy

```kotlin
class HybridRepository @Inject constructor(
    private val supabase: SupabaseClient,
    private val backendApi: JiffyBackendApi,
    private val roomDb: JiffyDatabase
) {
    suspend fun sendMessage(chatId: String, content: String): Result<Message> {
        return try {
            if (isOnline()) {
                // Send to Supabase
                val message = supabase.from(\"messages\")
                    .insert(...)
                    .decodeSingle<Message>()
                
                // Cache in Room
                roomDb.messageDao().insert(message.toEntity())
                
                Result.success(message)
            } else {
                // Queue in Room
                val localMessage = Message.createLocal(chatId, content)
                roomDb.messageDao().insert(localMessage.toEntity())
                
                // Will sync when online
                Result.success(localMessage)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

---

## 📚 API Integration Examples

### Example 1: User Search

**Android:**
```kotlin
suspend fun searchUsers(query: String): List<UserProfile> {
    return backendApi.searchUsers(query).results
}
```

**Backend returns:**
```json
{
  \"results\": [...],
  \"count\": 10
}
```

### Example 2: Get Chat Messages

**Android (Direct to Supabase):**
```kotlin
suspend fun getMessages(chatId: String): List<Message> {
    return supabase.from(\"messages\")
        .select()
        .eq(\"chat_id\", chatId)
        .order(\"created_at\", ascending = false)
        .limit(50)
        .decodeList<Message>()
}
```

**Or via Backend:**
```kotlin
suspend fun getMessages(chatId: String): List<Message> {
    return backendApi.getMessages(chatId).messages
}
```

### Example 3: Search GIFs (Backend Only)

**Android:**
```kotlin
suspend fun searchGiphy(query: String): List<GifItem> {
    return backendApi.searchGifs(
        q = query,
        source = \"giphy\",
        limit = 25
    ).results
}
```

**Backend handles:**
- API key management
- Caching
- Rate limiting
- Response mapping

---

## 🔔 Push Notification Flow

### Complete Flow

**1. Android Registers Token:**
```kotlin
FirebaseMessaging.getInstance().token.addOnSuccessListener { token ->
    lifecycleScope.launch {
        backendApi.updateFcmToken(FcmTokenRequest(token, \"android\"))
    }
}
```

**2. Backend Stores in Supabase:**
```javascript
await supabase.from('user_devices')
    .upsert({ user_id, fcm_token, device_type: 'android' })
```

**3. Message Sent (triggers notification):**
```javascript
// In ChatController after message insert
await NotificationService.sendMessageNotifications(chatId, senderId, message);
```

**4. Backend Gets Tokens:**
```javascript
const { data: devices } = await supabase
    .from('user_devices')
    .select('fcm_token')
    .eq('user_id', recipientId)
```

**5. Backend Sends via FCM:**
```javascript
await admin.messaging().sendEachForMulticast({
    notification: { title, body },
    data: { chat_id, sender_id, ... },
    tokens: [...]
})
```

**6. Android Receives:**
```kotlin
class JiffyFirebaseMessagingService : FirebaseMessagingService() {
    override fun onMessageReceived(message: RemoteMessage) {
        // Show notification
        showNotification(message.notification?.title, ...)
    }
}
```

---

## ⚡ Performance Optimization

### 1. Caching Strategy

**Backend caches:**
- GIF search results (10 min)
- Trending GIFs (10 min)
- Categories (1 hour)

**Android caches:**
- User profiles (Room)
- Messages (Room)
- Friends list (Room)
- GIF images (Coil)

### 2. Request Batching

**Don't:**
```kotlin
// Bad: Multiple requests
messages.forEach { message ->
    markAsRead(message.id)
}
```

**Do:**
```kotlin
// Good: Single batch request
markMultipleAsRead(messageIds)
```

### 3. Parallel Requests

**Use coroutines:**
```kotlin
val (messages, profile, friends) = coroutineScope {
    awaitAll(
        async { getMessages(chatId) },
        async { getProfile(userId) },
        async { getFriends() }
    )
}
```

---

## 🛠️ Development Tips

### Local Development

**Run backend locally:**
```bash
cd backend
npm run dev  # Runs on http://localhost:3000
```

**Point Android to localhost:**
```properties
# local.properties
BACKEND_API_URL=http://10.0.2.2:3000  # Android emulator
# or
BACKEND_API_URL=http://192.168.1.x:3000  # Physical device
```

### Debugging

**Backend logs:**
```bash
tail -f backend/logs/all.log
```

**Android network:**
- Use Android Studio Network Profiler
- Enable logging interceptor
- Check Logcat for API errors

---

## 🧪 Testing Integration

### Mock Backend in Tests

```kotlin
class FakeBackendApi : JiffyBackendApi {
    override suspend fun searchGifs(...) = GifSearchResponse(
        results = listOf(mockGif),
        count = 1
    )
}

@Test
fun `searchGifs returns results`() = runTest {
    val repository = GifRepository(FakeBackendApi())
    val results = repository.searchGifs(\"cat\", GifSource.GIPHY)
    
    assertTrue(results.isSuccess)
    assertEquals(1, results.getOrNull()?.size)
}
```

---

## 📊 Monitoring Integration

### Android Reports to PostHog

```kotlin
postHog.capture(\"backend_api_called\", properties = mapOf(
    \"endpoint\" to \"/gifs/search\",
    \"response_time_ms\" to responseTime,
    \"success\" to success
))
```

### Backend Reports Errors

```javascript
logger.error('API error:', {
    endpoint: req.url,
    error: error.message,
    userId: req.userId
});
```

---

## 🎯 Best Practices

### 1. Error Handling

**Always handle backend errors:**
```kotlin
suspend fun searchGifs(query: String): Result<List<GifItem>> {
    return try {
        val response = backendApi.searchGifs(query)
        Result.success(response.results)
    } catch (e: HttpException) {
        // Backend returned error
        Result.failure(Exception(\"Search failed: ${e.message}\"))
    } catch (e: IOException) {
        // Network error
        Result.failure(Exception(\"Network error\"))
    } catch (e: Exception) {
        // Other errors
        Result.failure(e)
    }
}
```

### 2. Token Management

**Refresh tokens automatically:**
```kotlin
class TokenInterceptor : Interceptor {
    override fun intercept(chain: Chain): Response {
        val response = chain.proceed(request)
        
        if (response.code == 401) {
            // Token expired - refresh
            val newToken = refreshToken()
            // Retry with new token
        }
        
        return response
    }
}
```

### 3. Fallback Strategy

**Have fallbacks:**
```kotlin
suspend fun searchGifs(query: String): List<GifItem> {
    return try {
        // Try GIPHY via backend
        backendApi.searchGifs(query, \"giphy\").results
    } catch (e: Exception) {
        // Fallback to Tenor
        backendApi.searchGifs(query, \"tenor\").results
    } ?: emptyList()
}
```

---

## 📞 Support

**Integration questions?**
- Backend docs: [backend/README.md](backend/README.md)
- API docs: [backend/API.md](backend/API.md)
- GitHub: [Open Issue](https://github.com/darshanpania/jiffy/issues)

---

**Last Updated:** February 6, 2026
