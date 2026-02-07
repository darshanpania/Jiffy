# User Management API Documentation

Complete guide for user management endpoints including profiles, search, presence, and friends.

---

## 📡 **API Endpoints**

### **Base URL**
```
Production: https://your-app.railway.app
Development: http://localhost:3000
```

### **Authentication**
All endpoints require Bearer token authentication:
```http
Authorization: Bearer <jwt-token>
```

---

## 1️⃣ **Get User Profile**

### **GET** `/api/users/profile/:userId`

Get any user's public profile by their ID.

**Parameters:**
- `userId` (path, UUID) - User ID to fetch

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "display_name": "John Doe",
  "photo_url": "https://example.supabase.co/storage/v1/object/public/avatars/user.jpg",
  "bio": "Love sharing GIFs! 🎬",
  "phone_number": "+1234567890",
  "is_online": true,
  "last_seen": "2026-02-07T09:30:00Z",
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-02-06T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid UUID format
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - User not found

---

## 2️⃣ **Update Profile**

### **PUT** `/api/users/profile`

Update current authenticated user's profile.

**Request Body:**
```json
{
  "displayName": "Jane Doe Updated",
  "bio": "GIF enthusiast and cat lover 🐱",
  "photoUrl": "https://example.com/new-photo.jpg",
  "phoneNumber": "+1234567890"
}
```

**All fields are optional. Only include fields you want to update.**

**Validation Rules:**
- `displayName`: 3-30 characters, alphanumeric + spaces, hyphens, underscores, dots
- `bio`: Max 150 characters
- `photoUrl`: Valid URL format
- `phoneNumber`: E.164 format (e.g., +1234567890)

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "Jane Doe Updated",
    "bio": "GIF enthusiast and cat lover 🐱",
    "photo_url": "https://example.com/new-photo.jpg",
    "phone_number": "+1234567890",
    "updated_at": "2026-02-07T09:35:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
  ```json
  {
    "error": "Bad Request",
    "message": "Validation failed",
    "details": [
      {
        "field": "displayName",
        "message": "Display name must be 3-30 characters",
        "value": "AB"
      }
    ]
  }
  ```

---

## 3️⃣ **Search Users**

### **GET** `/api/users/search`

Search for users using full-text search on display name and email.

**Query Parameters:**
- `q` (required): Search query (2-100 characters)
- `limit` (optional, default=20, max=100): Results per page
- `offset` (optional, default=0): Pagination offset

**Example:**
```http
GET /api/users/search?q=john&limit=10&offset=0
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": "uuid-1",
      "email": "john.doe@example.com",
      "display_name": "John Doe",
      "photo_url": "https://...",
      "bio": "Love GIFs!",
      "is_online": true,
      "last_seen": "2026-02-07T09:00:00Z"
    },
    {
      "id": "uuid-2",
      "email": "johnny@example.com",
      "display_name": "Johnny Smith",
      "photo_url": "https://...",
      "bio": null,
      "is_online": false,
      "last_seen": "2026-02-06T20:00:00Z"
    }
  ],
  "count": 2,
  "total": 15,
  "offset": 0,
  "limit": 10,
  "query": "john"
}
```

**Error Responses:**
- `400 Bad Request` - Query too short, limit exceeded, or missing query

---

## 4️⃣ **Update Presence**

### **POST** `/api/users/presence`

Update user's online/offline status and last seen timestamp.

**Request Body:**
```json
{
  "isOnline": true
}
```

**Response (200 OK):**
```json
{
  "message": "Presence updated",
  "isOnline": true,
  "lastSeen": "2026-02-07T09:40:00Z"
}
```

**Use Cases:**
- App launched → `isOnline: true`
- App backgrounded → `isOnline: false`
- Periodic heartbeat (every 30s when active)

---

## 5️⃣ **Get Friends List**

### **GET** `/api/users/friends`

Get current user's friends list with their profiles.

**Query Parameters:**
- `limit` (optional, default=100, max=100): Results per page
- `offset` (optional, default=0): Pagination offset

**Response (200 OK):**
```json
{
  "friends": [
    {
      "id": "uuid",
      "email": "alice@example.com",
      "display_name": "Alice Johnson",
      "photo_url": "https://...",
      "bio": "GIF collector",
      "is_online": true,
      "last_seen": "2026-02-07T09:30:00Z"
    },
    {
      "id": "uuid",
      "email": "bob@example.com",
      "display_name": "Bob Smith",
      "photo_url": "https://...",
      "bio": "Love memes",
      "is_online": false,
      "last_seen": "2026-02-06T20:00:00Z"
    }
  ],
  "count": 2,
  "total": 15,
  "offset": 0,
  "limit": 100
}
```

---

## 6️⃣ **Update FCM Token**

### **POST** `/api/users/fcm-token`

Register or update FCM token for push notifications.

**Request Body:**
```json
{
  "fcmToken": "fcm-device-token-string-here",
  "deviceType": "android",
  "notificationEnabled": true
}
```

**Fields:**
- `fcmToken` (required): FCM registration token from Firebase
- `deviceType` (optional, default="android"): "android", "ios", or "web"
- `notificationEnabled` (optional, default=true): Enable/disable notifications

**Response (200 OK):**
```json
{
  "message": "FCM token updated successfully",
  "deviceType": "android",
  "notificationEnabled": true,
  "updatedAt": "2026-02-07T09:45:00Z"
}
```

---

## 7️⃣ **Get Current User**

### **GET** `/api/users/me`

Get current authenticated user's full profile.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoUrl": "https://...",
  "bio": "Love GIFs!",
  "phoneNumber": "+1234567890",
  "isOnline": true,
  "lastSeen": "2026-02-07T09:00:00Z",
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-02-06T12:00:00Z"
}
```

---

## 🔒 **Error Handling**

### **Common Error Responses**

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid authorization header"
}
```

**400 Bad Request:**
```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    {
      "field": "displayName",
      "message": "Display name must be 3-30 characters",
      "value": "AB"
    }
  ]
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "User profile not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "Failed to update profile"
}
```

---

## 📱 **Android Integration**

### **Retrofit Interface**

```kotlin
interface UserApi {
    @GET("users/profile/{userId}")
    suspend fun getUserProfile(
        @Path("userId") userId: String
    ): UserProfile
    
    @PUT("users/profile")
    suspend fun updateProfile(
        @Body request: UpdateProfileRequest
    ): UpdateProfileResponse
    
    @GET("users/search")
    suspend fun searchUsers(
        @Query("q") query: String,
        @Query("limit") limit: Int = 20,
        @Query("offset") offset: Int = 0
    ): UserSearchResponse
    
    @POST("users/presence")
    suspend fun updatePresence(
        @Body request: PresenceRequest
    ): MessageResponse
    
    @GET("users/friends")
    suspend fun getFriends(
        @Query("limit") limit: Int = 100,
        @Query("offset") offset: Int = 0
    ): FriendsResponse
    
    @POST("users/fcm-token")
    suspend fun updateFcmToken(
        @Body request: FcmTokenRequest
    ): MessageResponse
    
    @GET("users/me")
    suspend fun getCurrentUser(): UserProfile
}
```

### **Data Classes**

```kotlin
data class UserProfile(
    val id: String,
    val email: String,
    @SerializedName("display_name") val displayName: String,
    @SerializedName("photo_url") val photoUrl: String?,
    val bio: String?,
    @SerializedName("phone_number") val phoneNumber: String?,
    @SerializedName("is_online") val isOnline: Boolean,
    @SerializedName("last_seen") val lastSeen: String?,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

data class UpdateProfileRequest(
    val displayName: String? = null,
    val bio: String? = null,
    val photoUrl: String? = null,
    val phoneNumber: String? = null
)

data class UpdateProfileResponse(
    val message: String,
    val profile: UserProfile
)

data class UserSearchResponse(
    val results: List<UserProfile>,
    val count: Int,
    val total: Int,
    val query: String
)

data class PresenceRequest(
    val isOnline: Boolean
)

data class FcmTokenRequest(
    val fcmToken: String,
    val deviceType: String = "android",
    val notificationEnabled: Boolean = true
)

data class FriendsResponse(
    val friends: List<UserProfile>,
    val count: Int,
    val total: Int
)

data class MessageResponse(
    val message: String
)
```

### **Repository Implementation**

```kotlin
class UserRepository @Inject constructor(
    private val userApi: UserApi,
    private val ioDispatcher: CoroutineDispatcher
) {
    suspend fun getProfile(userId: String): Result<UserProfile> {
        return withContext(ioDispatcher) {
            try {
                val profile = userApi.getUserProfile(userId)
                Result.success(profile)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun updateProfile(
        displayName: String? = null,
        bio: String? = null,
        photoUrl: String? = null,
        phoneNumber: String? = null
    ): Result<UserProfile> {
        return withContext(ioDispatcher) {
            try {
                val request = UpdateProfileRequest(
                    displayName, bio, photoUrl, phoneNumber
                )
                val response = userApi.updateProfile(request)
                Result.success(response.profile)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun searchUsers(query: String): Result<List<UserProfile>> {
        return withContext(ioDispatcher) {
            try {
                val response = userApi.searchUsers(query, limit = 20)
                Result.success(response.results)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun updateOnlineStatus(isOnline: Boolean) {
        withContext(ioDispatcher) {
            try {
                userApi.updatePresence(PresenceRequest(isOnline))
            } catch (e: Exception) {
                Timber.e(e, "Failed to update presence")
            }
        }
    }
    
    suspend fun getFriends(): Result<List<UserProfile>> {
        return withContext(ioDispatcher) {
            try {
                val response = userApi.getFriends()
                Result.success(response.friends)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun registerFcmToken(token: String) {
        withContext(ioDispatcher) {
            try {
                val request = FcmTokenRequest(token, "android", true)
                userApi.updateFcmToken(request)
                Timber.d("FCM token registered")
            } catch (e: Exception) {
                Timber.e(e, "Failed to register FCM token")
            }
        }
    }
}
```

### **ViewModel Usage**

```kotlin
@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    private val _profile = MutableStateFlow<UserProfile?>(null)
    val profile: StateFlow<UserProfile?> = _profile.asStateFlow()
    
    fun loadProfile(userId: String) {
        viewModelScope.launch {
            userRepository.getProfile(userId).onSuccess { profile ->
                _profile.value = profile
            }.onFailure { error ->
                // Handle error
            }
        }
    }
    
    fun updateProfile(displayName: String?, bio: String?) {
        viewModelScope.launch {
            userRepository.updateProfile(
                displayName = displayName,
                bio = bio
            ).onSuccess { updatedProfile ->
                _profile.value = updatedProfile
            }.onFailure { error ->
                // Handle error
            }
        }
    }
    
    fun searchUsers(query: String) {
        viewModelScope.launch {
            userRepository.searchUsers(query).onSuccess { users ->
                // Update UI with results
            }
        }
    }
}
```

### **Lifecycle Integration**

```kotlin
class MainActivity : AppCompatActivity() {
    
    @Inject
    lateinit var userRepository: UserRepository
    
    override fun onResume() {
        super.onResume()
        // Set online status
        lifecycleScope.launch {
            userRepository.updateOnlineStatus(true)
        }
    }
    
    override fun onPause() {
        super.onPause()
        // Set offline status
        lifecycleScope.launch {
            userRepository.updateOnlineStatus(false)
        }
    }
}
```

---

## 🔄 **Presence Management Strategy**

### **Recommended Approach:**

1. **App Launch:**
   ```kotlin
   userRepository.updateOnlineStatus(true)
   ```

2. **App Background:**
   ```kotlin
   userRepository.updateOnlineStatus(false)
   ```

3. **Periodic Heartbeat (optional):**
   ```kotlin
   // Every 30 seconds when app is active
   workManager.enqueue(
       PeriodicWorkRequestBuilder<PresenceWorker>(
           30, TimeUnit.SECONDS
       ).build()
   )
   ```

4. **Network Reconnect:**
   ```kotlin
   // When network reconnects
   userRepository.updateOnlineStatus(true)
   ```

---

## 🔍 **Search Best Practices**

### **Debouncing:**

```kotlin
val searchQuery = MutableStateFlow("")

searchQuery
    .debounce(300) // Wait 300ms after typing stops
    .filter { it.length >= 2 }
    .distinctUntilChanged()
    .flatMapLatest { query ->
        userRepository.searchUsers(query)
    }
    .collect { result ->
        // Update UI with results
    }
```

### **Caching:**

Consider caching search results for better performance:

```kotlin
private val searchCache = LruCache<String, List<UserProfile>>(20)

suspend fun searchWithCache(query: String): List<UserProfile> {
    searchCache.get(query)?.let { return it }
    
    return userRepository.searchUsers(query).getOrElse { emptyList() }
        .also { results ->
            searchCache.put(query, results)
        }
}
```

---

## ⚡ **Performance Tips**

1. **Profile Photos:** Use Coil/Glide with proper caching
2. **Search:** Debounce input, minimum 2 characters
3. **Friends List:** Cache locally, refresh on pull-to-refresh
4. **Presence:** Batch updates, avoid excessive API calls
5. **FCM Token:** Register once per app install, update on change

---

## 🧪 **Testing Examples**

### **Postman/cURL:**

```bash
# Get profile
curl -X GET "http://localhost:3000/api/users/profile/USER_UUID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update profile
curl -X PUT "http://localhost:3000/api/users/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "New Name",
    "bio": "Updated bio"
  }'

# Search users
curl -X GET "http://localhost:3000/api/users/search?q=john&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update presence
curl -X POST "http://localhost:3000/api/users/presence" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isOnline": true}'

# Get friends
curl -X GET "http://localhost:3000/api/users/friends" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update FCM token
curl -X POST "http://localhost:3000/api/users/fcm-token" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "your-fcm-token",
    "deviceType": "android"
  }'
```

---

## 📊 **Rate Limiting**

All endpoints are subject to rate limiting:
- **Default:** 100 requests per 15 minutes per IP
- **Auth endpoints:** 5 requests per minute

Rate limit headers in response:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1707235200
```

---

## 🔗 **Related Documentation**

- [Authentication API](./AUTH_API.md)
- [Backend Setup Guide](../GETTING_STARTED.md)
- [Android Integration](../../BACKEND_INTEGRATION.md)
- [API Reference](../API.md)

---

**User Management APIs are production-ready! 👥**
