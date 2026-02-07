# GIF Integration API Documentation

Complete guide for GIF search, trending, categories, and favorites using GIPHY and Tenor APIs with automatic fallback.

---

## 🎬 **Overview**

JIFFY integrates with both **GIPHY** and **Tenor** (Google) APIs to provide comprehensive GIF functionality:
- ✅ Automatic fallback (GIPHY → Tenor)
- ✅ 10-minute response caching
- ✅ Unified response format
- ✅ Favorites management
- ✅ Strict rate limiting (10 req/min)

---

## 🏗️ **Architecture**

```
Android App
    ↓
    GIF Search Request
    ↓
Backend API
    ↓
┌───────────────────────────┐
│  Try GIPHY First          │
│  ├─ Cache Check (10 min)  │
│  ├─ If cached → Return    │
│  └─ Else → API Call       │
└───────┬───────────────────┘
        │
        ├─ Success → Format & Return
        │
        └─ Error → Fallback ↓
        
┌───────────────────────────┐
│  Try Tenor as Fallback    │
│  ├─ Cache Check (10 min)  │
│  ├─ If cached → Return    │
│  └─ Else → API Call       │
└───────┬───────────────────┘
        │
        ├─ Success → Format & Return (with fallback=true)
        │
        └─ Error → 503 Service Unavailable
```

**Benefits:**
- ✅ High availability (dual providers)
- ✅ Reduced API quota usage (caching)
- ✅ Fast response (cached results)
- ✅ Consistent format (unified)

---

## 📡 **API Endpoints**

### **Base URL**
```
Production: https://your-app.railway.app
Development: http://localhost:3000
```

### **Authentication**
All endpoints require Bearer token:
```http
Authorization: Bearer <jwt-token>
```

### **Rate Limiting**
**Stricter limits for GIF endpoints:**
- **Search & Trending:** 10 requests/minute per user
- **Other endpoints:** 100 requests/15 minutes

---

## 1️⃣ **Search GIFs**

### **GET** `/api/gifs/search`

Search GIFs using GIPHY or Tenor with automatic fallback.

**Query Parameters:**
- `q` (required): Search query (2-100 characters)
- `limit` (optional, default=25, max=50): Results per page
- `offset` (optional, default=0): Pagination offset
- `rating` (optional, default=g): Content rating (g, pg, pg-13, r)
- `provider` (optional): Force specific provider (giphy, tenor)

**Example:**
```http
GET /api/gifs/search?q=happy+cat&limit=10&rating=g
```

**Response (200 OK):**
```json
{
  "gifs": [
    {
      "id": "3o7btPCcdNniyf0ArS",
      "title": "Happy Cat GIF",
      "url": "https://giphy.com/gifs/3o7btPCcdNniyf0ArS",
      "embedUrl": "https://giphy.com/embed/3o7btPCcdNniyf0ArS",
      "source": "giphy",
      "images": {
        "original": {
          "url": "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif",
          "width": 480,
          "height": 270,
          "size": 1234567
        },
        "fixed_height": {
          "url": "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/200.gif",
          "width": 356,
          "height": 200
        },
        "fixed_width": {
          "url": "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/200w.gif",
          "width": 200,
          "height": 113
        },
        "preview": {
          "url": "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy-preview.gif",
          "width": 160,
          "height": 90
        },
        "downsized": {
          "url": "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy-downsized.gif",
          "width": 400,
          "height": 225,
          "size": 500000
        }
      },
      "username": "catgifs",
      "rating": "g",
      "createDate": "2016-08-01T12:00:00Z"
    }
  ],
  "count": 10,
  "query": "happy cat",
  "limit": 10,
  "offset": 0,
  "source": "giphy",
  "cached": true,
  "fallback": false
}
```

**Fallback Response:**
If GIPHY fails and Tenor succeeds:
```json
{
  "source": "tenor",
  "fallback": true,
  ...
}
```

**Error Responses:**
- `400 Bad Request` - Invalid query or parameters
- `401 Unauthorized` - Missing/invalid token
- `429 Too Many Requests` - Rate limit exceeded (10/min)
- `503 Service Unavailable` - Both providers failed

---

## 2️⃣ **Get Trending GIFs**

### **GET** `/api/gifs/trending`

Get currently trending GIFs with automatic fallback.

**Query Parameters:**
- `limit` (optional, default=25, max=50): Results per page
- `offset` (optional, default=0): Pagination offset
- `rating` (optional, default=g): Content rating
- `provider` (optional): Force specific provider

**Example:**
```http
GET /api/gifs/trending?limit=20
```

**Response (200 OK):**
```json
{
  "gifs": [
    {
      "id": "trending-gif-id",
      "title": "Trending GIF",
      "url": "https://giphy.com/gifs/...",
      "source": "giphy",
      "images": { ... },
      "rating": "g"
    }
  ],
  "count": 20,
  "limit": 20,
  "offset": 0,
  "source": "giphy",
  "cached": false
}
```

---

## 3️⃣ **Get Categories**

### **GET** `/api/gifs/categories`

Get GIF categories for browsing. Prefers Tenor (better categories API).

**Query Parameters:**
- `provider` (optional): Force specific provider

**Response (200 OK):**
```json
{
  "categories": [
    {
      "name": "Reactions",
      "searchTerm": "reactions",
      "image": "https://media.tenor.com/images/..."
    },
    {
      "name": "Animals",
      "searchTerm": "animals cute"
    },
    {
      "name": "Funny",
      "searchTerm": "funny humor"
    }
  ],
  "count": 12,
  "source": "tenor",
  "cached": true
}
```

**GIPHY Categories (fallback):**
```json
{
  "categories": [
    { "name": "Reactions", "searchTerm": "reactions" },
    { "name": "Entertainment", "searchTerm": "entertainment" },
    { "name": "Sports", "searchTerm": "sports" },
    { "name": "Animals", "searchTerm": "animals cute" },
    { "name": "Food & Drink", "searchTerm": "food drink" },
    { "name": "Gaming", "searchTerm": "gaming" },
    { "name": "Funny", "searchTerm": "funny humor" },
    { "name": "Love & Romance", "searchTerm": "love romance" },
    { "name": "Celebration", "searchTerm": "party celebration" },
    { "name": "Music", "searchTerm": "music dance" },
    { "name": "Nature", "searchTerm": "nature beautiful" },
    { "name": "Movies & TV", "searchTerm": "movies tv shows" }
  ],
  "source": "giphy"
}
```

---

## 4️⃣ **Save Favorite**

### **POST** `/api/gifs/favorites`

Save GIF to user's favorites in Supabase.

**Request:**
```json
{
  "gifId": "3o7btPCcdNniyf0ArS",
  "gifUrl": "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif",
  "title": "Happy Cat GIF",
  "source": "giphy",
  "previewUrl": "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/200.gif"
}
```

**Fields:**
- `gifId` (required): GIF ID from provider
- `gifUrl` (required): Full GIF URL
- `title` (optional, max 200 chars): GIF title/description
- `source` (optional, default=giphy): Provider source
- `previewUrl` (optional): Thumbnail/preview URL

**Response (201 Created):**
```json
{
  "message": "GIF added to favorites",
  "favorite": {
    "id": "fav-uuid",
    "gif_id": "3o7btPCcdNniyf0ArS",
    "gif_url": "https://...",
    "title": "Happy Cat GIF",
    "source": "giphy",
    "preview_url": "https://...",
    "created_at": "2026-02-07T10:00:00Z"
  }
}
```

**Error Responses:**
- `409 Conflict` - GIF already in favorites
- `400 Bad Request` - Invalid data

---

## 5️⃣ **Get Favorites**

### **GET** `/api/gifs/favorites`

Get user's saved favorite GIFs.

**Query Parameters:**
- `limit` (optional, default=50, max=100): Results per page
- `offset` (optional, default=0): Pagination offset

**Response (200 OK):**
```json
{
  "favorites": [
    {
      "id": "fav-uuid",
      "user_id": "user-uuid",
      "gif_id": "abc123",
      "gif_url": "https://media.giphy.com/media/abc123/giphy.gif",
      "title": "Funny Reaction GIF",
      "source": "giphy",
      "preview_url": "https://media.giphy.com/media/abc123/200.gif",
      "created_at": "2026-02-07T09:00:00Z"
    }
  ],
  "count": 15,
  "total": 45,
  "limit": 50,
  "offset": 0
}
```

---

## 6️⃣ **Delete Favorite**

### **DELETE** `/api/gifs/favorites/:favoriteId`

Remove GIF from user's favorites.

**Response (200 OK):**
```json
{
  "message": "Favorite removed successfully",
  "favoriteId": "fav-uuid"
}
```

**Authorization:**
- Only deletes if favorite belongs to authenticated user
- Returns success even if favorite doesn't exist (idempotent)

---

## 📊 **Unified GIF Format**

Both GIPHY and Tenor responses are normalized to this format:

```typescript
interface UnifiedGif {
  id: string;                    // Provider GIF ID
  title: string;                 // GIF title/description
  url: string;                   // Provider page URL
  embedUrl: string;              // Embed URL
  source: 'giphy' | 'tenor';    // Provider name
  images: {
    original: {                  // Full quality
      url: string;
      width: number;
      height: number;
      size: number;
    };
    fixed_height: {              // Fixed height (200px)
      url: string;
      width: number;
      height: number;
    };
    fixed_width: {               // Fixed width (200px)
      url: string;
      width: number;
      height: number;
    };
    preview: {                   // Small preview
      url: string;
      width: number;
      height: number;
    };
    downsized: {                 // Smaller file size
      url: string;
      width: number;
      height: number;
      size: number;
    };
  };
  username: string;              // Creator username
  rating: string;                // Content rating
  createDate: string;            // Creation timestamp
  trendingDatetime?: string;     // Trending timestamp (if applicable)
  tags?: string[];               // Tags (Tenor only)
}
```

---

## ⚡ **Caching Strategy**

### **Cache Configuration:**
- **TTL:** 10 minutes (600 seconds)
- **Storage:** In-memory (node-cache)
- **Scope:** Per provider (GIPHY & Tenor separate)

### **Cache Keys:**
```javascript
// Search
"search:{query}:{limit}:{offset}:{rating}"

// Trending
"trending:{limit}:{offset}:{rating}"

// Categories
"categories"

// GIF by ID
"gif:{gifId}"
```

### **Cache Behavior:**

**First Request:**
```
Client → Backend → External API → Format → Cache → Response
Time: ~500-1000ms
```

**Subsequent Requests (within 10 min):**
```
Client → Backend → Cache → Response
Time: ~10-50ms (50-100x faster!)
```

### **Cache Stats Endpoint:**
```http
GET /api/gifs/stats
```

Response:
```json
{
  "giphy": {
    "configured": true,
    "cache": {
      "keys": 42,
      "hits": 156,
      "misses": 23,
      "ksize": 42,
      "vsize": 1024000
    }
  },
  "tenor": {
    "configured": true,
    "cache": {
      "keys": 18,
      "hits": 67,
      "misses": 12
    }
  }
}
```

---

## 🔄 **Automatic Fallback**

### **Fallback Priority:**

**For Search & Trending:**
1. Try GIPHY first (primary)
2. If GIPHY fails → Try Tenor
3. If both fail → 503 error

**For Categories:**
1. Try Tenor first (better categories API)
2. If Tenor fails → Try GIPHY (predefined list)
3. If both fail → 503 error

### **Fallback Detection:**

Response includes `fallback` field:
```json
{
  "source": "tenor",
  "fallback": true,  // ← Indicates GIPHY failed
  "gifs": [...]
}
```

### **Fallback Scenarios:**

| Scenario | Result |
|----------|--------|
| GIPHY configured & working | Use GIPHY |
| GIPHY fails, Tenor working | Use Tenor (fallback=true) |
| GIPHY not configured | Use Tenor directly |
| Both fail | 503 Service Unavailable |
| Neither configured | 503 Service Unavailable |

---

## 🔒 **Rate Limiting**

### **GIF-Specific Limits:**

**Search & Trending:**
- **Limit:** 10 requests per minute per user
- **Scope:** Per authenticated user (via userId)
- **Reason:** External API quota management

**Other Endpoints:**
- **Limit:** 100 requests per 15 minutes
- **Scope:** Global rate limit

### **Rate Limit Headers:**

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1707307260
```

### **Rate Limit Response (429):**

```json
{
  "error": "Too Many Requests",
  "message": "GIF API rate limit exceeded. Please wait before making more requests."
}
```

**Best Practice:** Implement client-side debouncing (300ms) for search.

---

## 📱 **Android Integration**

### **Retrofit Interface**

```kotlin
interface GifApi {
    @GET("gifs/search")
    suspend fun searchGifs(
        @Query("q") query: String,
        @Query("limit") limit: Int = 25,
        @Query("offset") offset: Int = 0,
        @Query("rating") rating: String = "g"
    ): GifSearchResponse
    
    @GET("gifs/trending")
    suspend fun getTrending(
        @Query("limit") limit: Int = 25,
        @Query("offset") offset: Int = 0
    ): GifSearchResponse
    
    @GET("gifs/categories")
    suspend fun getCategories(): CategoriesResponse
    
    @POST("gifs/favorites")
    suspend fun saveFavorite(
        @Body request: SaveFavoriteRequest
    ): SaveFavoriteResponse
    
    @GET("gifs/favorites")
    suspend fun getFavorites(
        @Query("limit") limit: Int = 50,
        @Query("offset") offset: Int = 0
    ): FavoritesResponse
    
    @DELETE("gifs/favorites/{favoriteId}")
    suspend fun deleteFavorite(
        @Path("favoriteId") favoriteId: String
    ): MessageResponse
}
```

### **Data Models**

```kotlin
data class Gif(
    val id: String,
    val title: String,
    val url: String,
    val embedUrl: String,
    val source: String, // "giphy" or "tenor"
    val images: GifImages,
    val username: String?,
    val rating: String,
    val createDate: String?
)

data class GifImages(
    val original: GifImage,
    @SerializedName("fixed_height") val fixedHeight: GifImage,
    @SerializedName("fixed_width") val fixedWidth: GifImage,
    val preview: GifImage,
    val downsized: GifImage
)

data class GifImage(
    val url: String,
    val width: Int,
    val height: Int,
    val size: Int = 0
)

data class GifSearchResponse(
    val gifs: List<Gif>,
    val count: Int,
    val query: String? = null,
    val limit: Int,
    val offset: Int,
    val source: String,
    val cached: Boolean,
    val fallback: Boolean = false
)

data class Category(
    val name: String,
    val searchTerm: String,
    val image: String? = null
)

data class CategoriesResponse(
    val categories: List<Category>,
    val count: Int,
    val source: String,
    val cached: Boolean
)

data class SaveFavoriteRequest(
    val gifId: String,
    val gifUrl: String,
    val title: String? = null,
    val source: String = "giphy",
    val previewUrl: String? = null
)

data class Favorite(
    val id: String,
    @SerializedName("user_id") val userId: String,
    @SerializedName("gif_id") val gifId: String,
    @SerializedName("gif_url") val gifUrl: String,
    val title: String?,
    val source: String,
    @SerializedName("preview_url") val previewUrl: String?,
    @SerializedName("created_at") val createdAt: String
)

data class FavoritesResponse(
    val favorites: List<Favorite>,
    val count: Int,
    val total: Int,
    val limit: Int,
    val offset: Int
)

data class SaveFavoriteResponse(
    val message: String,
    val favorite: Favorite
)
```

### **Repository Implementation**

```kotlin
@Singleton
class GifRepository @Inject constructor(
    private val gifApi: GifApi,
    private val ioDispatcher: CoroutineDispatcher
) {
    
    // Cache for search results
    private val searchCache = LruCache<String, List<Gif>>(50)
    
    suspend fun searchGifs(
        query: String,
        limit: Int = 25
    ): Result<List<Gif>> = withContext(ioDispatcher) {
        try {
            // Check local cache first
            val cacheKey = "search:$query:$limit"
            searchCache.get(cacheKey)?.let {
                return@withContext Result.success(it)
            }
            
            val response = gifApi.searchGifs(query, limit)
            
            // Cache results
            searchCache.put(cacheKey, response.gifs)
            
            Timber.d("GIF search: $query → ${response.count} results from ${response.source}")
            
            Result.success(response.gifs)
        } catch (e: HttpException) {
            when (e.code()) {
                429 -> Result.failure(Exception("Rate limit exceeded. Please wait."))
                503 -> Result.failure(Exception("GIF service unavailable"))
                else -> Result.failure(Exception("Search failed: ${e.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getTrending(limit: Int = 25): Result<List<Gif>> {
        return withContext(ioDispatcher) {
            try {
                val response = gifApi.getTrending(limit)
                Result.success(response.gifs)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun getCategories(): Result<List<Category>> {
        return withContext(ioDispatcher) {
            try {
                val response = gifApi.getCategories()
                Result.success(response.categories)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun saveFavorite(gif: Gif): Result<Favorite> {
        return withContext(ioDispatcher) {
            try {
                val request = SaveFavoriteRequest(
                    gifId = gif.id,
                    gifUrl = gif.images.original.url,
                    title = gif.title,
                    source = gif.source,
                    previewUrl = gif.images.preview.url
                )
                val response = gifApi.saveFavorite(request)
                Result.success(response.favorite)
            } catch (e: HttpException) {
                when (e.code()) {
                    409 -> Result.failure(Exception("GIF already in favorites"))
                    else -> Result.failure(Exception("Failed to save: ${e.message()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun getFavorites(): Result<List<Favorite>> {
        return withContext(ioDispatcher) {
            try {
                val response = gifApi.getFavorites()
                Result.success(response.favorites)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun deleteFavorite(favoriteId: String): Result<Unit> {
        return withContext(ioDispatcher) {
            try {
                gifApi.deleteFavorite(favoriteId)
                Result.success(Unit)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
}
```

### **ViewModel with Debouncing**

```kotlin
@HiltViewModel
class GifSearchViewModel @Inject constructor(
    private val gifRepository: GifRepository
) : ViewModel() {
    
    private val _searchResults = MutableStateFlow<List<Gif>>(emptyList())
    val searchResults = _searchResults.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()
    
    private val _searchQuery = MutableStateFlow("")
    val searchQuery = _searchQuery.asStateFlow()
    
    init {
        // Setup debounced search
        viewModelScope.launch {
            searchQuery
                .debounce(300) // Wait 300ms after typing stops
                .filter { it.length >= 2 }
                .distinctUntilChanged()
                .collect { query ->
                    performSearch(query)
                }
        }
    }
    
    fun updateQuery(query: String) {
        _searchQuery.value = query
    }
    
    private suspend fun performSearch(query: String) {
        _isLoading.value = true
        
        gifRepository.searchGifs(query).onSuccess { gifs ->
            _searchResults.value = gifs
        }.onFailure { error ->
            Timber.e(error, "GIF search failed")
            // Show error to user
        }
        
        _isLoading.value = false
    }
    
    fun saveFavorite(gif: Gif) {
        viewModelScope.launch {
            gifRepository.saveFavorite(gif).onSuccess {
                // Show success message
            }.onFailure { error ->
                if (error.message?.contains("already") == true) {
                    // Already favorited
                } else {
                    // Show error
                }
            }
        }
    }
}
```

### **Usage in Composable**

```kotlin
@Composable
fun GifSearchScreen(
    viewModel: GifSearchViewModel = hiltViewModel()
) {
    val searchResults by viewModel.searchResults.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val query by viewModel.searchQuery.collectAsState()
    
    Column {
        SearchBar(
            query = query,
            onQueryChange = { viewModel.updateQuery(it) },
            placeholder = "Search GIFs..."
        )
        
        if (isLoading) {
            CircularProgressIndicator()
        }
        
        LazyVerticalGrid(
            columns = GridCells.Fixed(2)
        ) {
            items(searchResults) { gif ->
                GifItem(
                    gif = gif,
                    onGifClick = { selectedGif ->
                        // Send in chat or show details
                    },
                    onFavorite = {
                        viewModel.saveFavorite(gif)
                    }
                )
            }
        }
    }
}
```

### **GIF Loading with Coil**

```kotlin
@Composable
fun GifItem(gif: Gif, onGifClick: () -> Unit, onFavorite: () -> Unit) {
    Card(
        modifier = Modifier
            .padding(4.dp)
            .clickable(onClick = onGifClick)
    ) {
        Box {
            AsyncImage(
                model = ImageRequest.Builder(LocalContext.current)
                    .data(gif.images.fixedWidth.url)
                    .crossfade(true)
                    .build(),
                contentDescription = gif.title,
                modifier = Modifier.fillMaxWidth()
            )
            
            IconButton(
                onClick = onFavorite,
                modifier = Modifier.align(Alignment.TopEnd)
            ) {
                Icon(Icons.Default.Favorite, "Add to favorites")
            }
        }
    }
}
```

---

## 🔗 **Environment Variables**

Add to `.env`:

```bash
# GIPHY API (get from https://developers.giphy.com)
GIPHY_API_KEY=your_giphy_api_key_here

# Tenor API (get from https://developers.google.com/tenor)
TENOR_API_KEY=your_tenor_api_key_here
```

**Getting API Keys:**

**GIPHY:**
1. Go to https://developers.giphy.com
2. Create account & app
3. Copy API key
4. Free tier: 42 requests/hour, 1000/day

**Tenor:**
1. Go to https://console.cloud.google.com
2. Enable Tenor API
3. Create credentials
4. Copy API key
5. Free tier: Generous limits

---

## 🧪 **Testing Examples**

### **cURL Commands:**

```bash
# Search GIFs
curl "http://localhost:3000/api/gifs/search?q=happy&limit=10" \
  -H "Authorization: Bearer TOKEN"

# Get trending
curl http://localhost:3000/api/gifs/trending \
  -H "Authorization: Bearer TOKEN"

# Get categories
curl http://localhost:3000/api/gifs/categories \
  -H "Authorization: Bearer TOKEN"

# Save favorite
curl -X POST http://localhost:3000/api/gifs/favorites \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gifId": "abc123",
    "gifUrl": "https://media.giphy.com/media/abc123/giphy.gif",
    "title": "Funny GIF",
    "source": "giphy"
  }'

# Get favorites
curl http://localhost:3000/api/gifs/favorites \
  -H "Authorization: Bearer TOKEN"

# Delete favorite
curl -X DELETE http://localhost:3000/api/gifs/favorites/FAV_UUID \
  -H "Authorization: Bearer TOKEN"

# Get cache stats
curl http://localhost:3000/api/gifs/stats \
  -H "Authorization: Bearer TOKEN"
```

---

## ⚙️ **Configuration**

### **Recommended Settings:**

```javascript
// In backend/src/services/giphy.service.js
cache: new NodeCache({ 
  stdTTL: 600,        // 10 minutes
  checkperiod: 120,   // Check every 2 minutes
  useClones: false    // Better performance
})
```

### **API Limits:**

**GIPHY Free Tier:**
- 42 requests/hour
- 1,000 requests/day
- 1,000,000 requests/month

**Tenor Free Tier:**
- Much higher limits
- Better for production

**With Caching (10 min TTL):**
- Effective reduction: ~90%
- 1,000 requests/day → Supports ~10,000 users/day!

---

## 🎯 **Best Practices**

### **1. Client-Side Debouncing:**

```kotlin
val searchQuery = MutableStateFlow("")

searchQuery
    .debounce(300) // Wait 300ms after typing stops
    .distinctUntilChanged()
    .collect { query ->
        if (query.length >= 2) {
            gifRepository.searchGifs(query)
        }
    }
```

### **2. Image Loading:**

Use appropriate image size:
```kotlin
// For grid view: use fixed_width (smaller, faster)
gif.images.fixedWidth.url

// For full screen: use original (high quality)
gif.images.original.url

// For list preview: use preview (smallest, fastest)
gif.images.preview.url
```

### **3. Error Handling:**

```kotlin
try {
    val gifs = gifApi.searchGifs("happy")
} catch (e: HttpException) {
    when (e.code()) {
        429 -> showMessage("Too many requests. Please wait.")
        503 -> showMessage("GIF service temporarily unavailable")
        else -> showMessage("Search failed")
    }
}
```

### **4. Caching Strategy:**

```kotlin
// Double caching: Backend + Android
class GifRepository {
    private val cache = LruCache<String, List<Gif>>(100)
    
    suspend fun searchGifs(query: String): List<Gif> {
        // Check local cache (instant)
        cache.get(query)?.let { return it }
        
        // Check backend cache (10-50ms if cached)
        // Or external API (500-1000ms if not)
        val gifs = gifApi.searchGifs(query).gifs
        
        // Cache locally
        cache.put(query, gifs)
        
        return gifs
    }
}
```

---

## 🔗 **Integration with Messaging**

### **Sending GIF in Chat:**

```kotlin
// User selects GIF from search
val selectedGif: Gif = ...

// Send as message
chatRepository.sendMessage(
    chatId = chatId,
    content = selectedGif.images.original.url, // Full GIF URL
    type = "GIF"
)
```

**Backend handles:**
- Stores GIF URL in message content
- Sets message type = "GIF"
- Triggers realtime broadcast
- Sends FCM with "🎬 Sent a GIF" preview

**Android displays:**
```kotlin
when (message.type) {
    "TEXT" -> Text(message.content)
    "GIF" -> AsyncImage(url = message.content)
    "IMAGE" -> AsyncImage(url = message.content)
}
```

---

## 🔗 **Related Documentation**

- [Chat & Messaging API](./CHAT_MESSAGING_API.md)
- [User Management API](./USER_MANAGEMENT_API.md)
- [Backend Setup](../GETTING_STARTED.md)
- [GIPHY API Docs](https://developers.giphy.com/docs/api/)
- [Tenor API Docs](https://developers.google.com/tenor)

---

**GIF Integration is production-ready! 🎬**
