# Chat & Messaging API Documentation

Complete guide for chat and messaging endpoints including direct chats, group chats, messages, and real-time integration.

---

## 🏗️ **Architecture Overview**

### **Real-time Messaging Flow**

```
┌─────────────┐
│ Android App │
└──────┬──────┘
       │
       ├─ 1. Subscribe to Supabase Realtime (WebSocket)
       │     channel: `chat:${chatId}`
       │
       ├─ 2. Send message via Backend API
       │     POST /api/chats/:id/messages
       │
       ↓
┌──────────────┐
│ Backend API  │
└──────┬───────┘
       │
       ├─ 3. Insert message in PostgreSQL
       │
       ├─ 4. Supabase automatically broadcasts via Realtime
       │
       └─ 5. Send FCM to offline users
       
┌──────────────┐
│  Supabase    │
│  - PostgreSQL│
│  - Realtime  │
└──────┬───────┘
       │
       └─ 6. Broadcast to all WebSocket subscribers
       
Android receives message via:
- WebSocket (if online) < 100ms
- FCM (if offline) < 500ms
```

**Key Points:**
- ✅ Android subscribes directly to Supabase Realtime
- ✅ Backend inserts messages in PostgreSQL
- ✅ Supabase broadcasts automatically
- ✅ Backend sends FCM for offline users
- ✅ No WebSocket server needed in backend!

---

## 📡 **API Endpoints (14 Total)**

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

---

## 1️⃣ **Get User Chats**

### **GET** `/api/chats`

Get all chats for current user with last message preview.

**Response (200 OK):**
```json
{
  "chats": [
    {
      "chat_id": "uuid",
      "chat_type": "DIRECT",
      "chat_name": "Alice Johnson",
      "chat_photo": "https://...",
      "chat_description": null,
      "unread_count": 3,
      "last_message_id": "uuid",
      "last_message_content": "Hey! Check this out 😄",
      "last_message_type": "TEXT",
      "last_message_time": "2026-02-07T10:30:00Z",
      "last_message_sender_id": "uuid",
      "last_message_sender_name": "Alice Johnson",
      "updated_at": "2026-02-07T10:30:00Z"
    },
    {
      "chat_id": "uuid",
      "chat_type": "GROUP",
      "chat_name": "Team GIFs",
      "chat_photo": "https://...",
      "chat_description": "Our team's GIF collection",
      "unread_count": 0,
      "last_message_content": "🎉 Great job!",
      "last_message_type": "TEXT",
      "last_message_time": "2026-02-07T09:00:00Z",
      "last_message_sender_name": "Bob Smith",
      "updated_at": "2026-02-07T09:00:00Z"
    }
  ],
  "count": 2
}
```

---

## 2️⃣ **Create/Get Direct Chat**

### **POST** `/api/chats/direct`

Get existing or create new direct chat with another user.

**Request:**
```json
{
  "otherUserId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200 OK or 201 Created):**
```json
{
  "chatId": "chat-uuid",
  "created": false,
  "message": "Chat retrieved successfully"
}
```

If new chat created: `created: true` and status `201`.

---

## 3️⃣ **Create Group Chat**

### **POST** `/api/chats/group`

Create new group chat with multiple members.

**Request:**
```json
{
  "name": "Team GIFs",
  "memberIds": ["uuid1", "uuid2", "uuid3"],
  "description": "Our awesome GIF sharing group",
  "photoUrl": "https://example.com/group.jpg"
}
```

**Validation:**
- `name`: 3-50 characters, required
- `memberIds`: Array of 1-100 UUIDs, required
- `description`: max 200 characters, optional
- `photoUrl`: valid URL, optional

**Response (201 Created):**
```json
{
  "groupId": "uuid",
  "message": "Group created successfully",
  "group": {
    "id": "uuid",
    "type": "GROUP",
    "name": "Team GIFs",
    "description": "Our awesome GIF sharing group",
    "photo_url": "https://...",
    "created_by": "uuid-creator",
    "created_at": "2026-02-07T10:00:00Z",
    "members_count": 4
  }
}
```

**Side Effects:**
- FCM notifications sent to all added members
- Creator added as ADMIN role
- Other members added as MEMBER role

---

## 4️⃣ **Get Chat Info**

### **GET** `/api/chats/:chatId/info`

Get chat details and metadata.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "type": "GROUP",
  "name": "Team GIFs",
  "description": "Our team's GIF collection",
  "photo_url": "https://...",
  "created_by": "uuid",
  "created_at": "2026-02-07T10:00:00Z",
  "updated_at": "2026-02-07T10:30:00Z",
  "member_count": 5,
  "user_role": "ADMIN"
}
```

---

## 5️⃣ **Get Messages**

### **GET** `/api/chats/:chatId/messages`

Get messages in chat with pagination.

**Query Parameters:**
- `limit` (int, default=50, max=100): Messages per page
- `offset` (int, default=0): Pagination offset
- `before` (ISO 8601, optional): Get messages before timestamp

**Example:**
```http
GET /api/chats/abc-123/messages?limit=50&offset=0
GET /api/chats/abc-123/messages?before=2026-02-07T10:00:00Z&limit=20
```

**Response (200 OK):**
```json
{
  "messages": [
    {
      "id": "uuid",
      "chat_id": "uuid",
      "sender_id": "uuid",
      "content": "Hello! How are you?",
      "type": "TEXT",
      "status": "READ",
      "is_edited": false,
      "created_at": "2026-02-07T10:25:00Z",
      "updated_at": "2026-02-07T10:25:00Z",
      "reply_to": null,
      "sender": {
        "id": "uuid",
        "display_name": "John Doe",
        "photo_url": "https://..."
      }
    },
    {
      "id": "uuid",
      "chat_id": "uuid",
      "sender_id": "uuid",
      "content": "https://media.giphy.com/media/abc123/giphy.gif",
      "type": "GIF",
      "status": "DELIVERED",
      "is_edited": false,
      "created_at": "2026-02-07T10:20:00Z",
      "reply_to": "uuid-of-previous-message",
      "sender": {
        "id": "uuid",
        "display_name": "Alice Smith",
        "photo_url": "https://..."
      }
    }
  ],
  "count": 2,
  "total": 150,
  "limit": 50,
  "offset": 0,
  "hasMore": true
}
```

---

## 6️⃣ **Send Message**

### **POST** `/api/chats/:chatId/messages`

Send message in chat. Triggers Supabase Realtime and FCM notifications.

**Request:**
```json
{
  "content": "Hey! Check out this GIF 🎬",
  "type": "TEXT",
  "replyTo": "uuid-optional"
}
```

**Message Types:**
- `TEXT` - Regular text message
- `GIF` - GIF URL (from GIPHY/Tenor)
- `IMAGE` - Image URL
- `VIDEO` - Video URL (future)
- `AUDIO` - Audio URL (future)
- `FILE` - File URL (future)

**For GIF messages:**
```json
{
  "content": "https://media.giphy.com/media/abc123/giphy.gif",
  "type": "GIF"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "chat_id": "uuid",
  "sender_id": "uuid",
  "content": "Hey! Check out this GIF 🎬",
  "type": "TEXT",
  "status": "SENT",
  "is_edited": false,
  "created_at": "2026-02-07T10:40:00Z",
  "updated_at": "2026-02-07T10:40:00Z",
  "reply_to": "uuid",
  "sender": {
    "id": "uuid",
    "display_name": "John Doe",
    "photo_url": "https://..."
  }
}
```

**What Happens:**
1. Message inserted in PostgreSQL
2. Supabase Realtime broadcasts to online users (< 100ms)
3. Backend sends FCM to offline users (< 500ms)
4. Unread counts incremented for recipients
5. Chat's updated_at timestamp updated

---

## 7️⃣ **Edit Message**

### **PUT** `/api/chats/:chatId/messages/:messageId`

Edit message content (only your own messages).

**Request:**
```json
{
  "content": "Updated message content"
}
```

**Response (200 OK):**
```json
{
  "message": "Message updated successfully",
  "data": {
    "id": "uuid",
    "content": "Updated message content",
    "is_edited": true,
    "updated_at": "2026-02-07T10:45:00Z"
  }
}
```

**Authorization:**
- Can only edit your own messages
- Returns 403 if not message owner

---

## 8️⃣ **Delete Message**

### **DELETE** `/api/chats/:chatId/messages/:messageId`

Delete message (soft delete - content replaced).

**Response (200 OK):**
```json
{
  "message": "Message deleted successfully",
  "messageId": "uuid"
}
```

**Implementation:**
- Soft delete (content → "This message was deleted")
- Type changed to "DELETED"
- Original message preserved in database
- Returns 403 if not message owner

---

## 9️⃣ **Mark Messages as Read**

### **POST** `/api/chats/:chatId/read`

Mark all messages in chat as read for current user.

**Response (200 OK):**
```json
{
  "message": "Messages marked as read",
  "chatId": "uuid"
}
```

**What Happens:**
1. All unread messages → status "READ"
2. Unread count → 0
3. last_read_at updated
4. Read receipts visible to senders

---

## 🔟 **Get Group Members**

### **GET** `/api/chats/:chatId/members`

Get all members in group chat with profiles.

**Response (200 OK):**
```json
{
  "members": [
    {
      "id": "participant-uuid",
      "role": "ADMIN",
      "joined_at": "2026-02-07T10:00:00Z",
      "user": {
        "id": "uuid",
        "email": "alice@example.com",
        "display_name": "Alice Johnson",
        "photo_url": "https://...",
        "is_online": true,
        "last_seen": "2026-02-07T10:30:00Z"
      }
    },
    {
      "id": "participant-uuid",
      "role": "MEMBER",
      "joined_at": "2026-02-07T10:01:00Z",
      "user": {
        "id": "uuid",
        "display_name": "Bob Smith",
        "is_online": false
      }
    }
  ],
  "count": 2
}
```

---

## 1️⃣1️⃣ **Add Group Member**

### **POST** `/api/chats/:chatId/members`

Add new member to group chat (admin only).

**Request:**
```json
{
  "userId": "uuid-of-user-to-add"
}
```

**Response (201 Created):**
```json
{
  "message": "Member added successfully",
  "userId": "uuid"
}
```

**Authorization:**
- Only ADMINs can add members
- Returns 403 if not admin
- Returns 409 if user already member

**Side Effects:**
- FCM notification sent to new member
- User added with MEMBER role

---

## 1️⃣2️⃣ **Remove Group Member**

### **DELETE** `/api/chats/:chatId/members/:userId`

Remove member from group (admin only).

**Response (200 OK):**
```json
{
  "message": "Member removed successfully",
  "userId": "uuid"
}
```

**Authorization:**
- Only ADMINs can remove members
- Cannot remove yourself (use leave endpoint)

---

## 1️⃣3️⃣ **Leave Group**

### **POST** `/api/chats/:chatId/leave`

Leave group chat (any member).

**Response (200 OK):**
```json
{
  "message": "Left group successfully",
  "chatId": "uuid"
}
```

**Notes:**
- Only works for GROUP chats
- Returns 400 for DIRECT chats

---

## 1️⃣4️⃣ **Update Member Role**

### **PUT** `/api/chats/:chatId/members/:userId/role`

Promote member to admin or demote admin to member.

**Request:**
```json
{
  "role": "ADMIN"
}
```

**Roles:**
- `MEMBER` - Regular member
- `ADMIN` - Group administrator

**Response (200 OK):**
```json
{
  "message": "Role updated successfully",
  "userId": "uuid",
  "role": "ADMIN"
}
```

**Authorization:**
- Only ADMINs can change roles

---

## 1️⃣5️⃣ **Update Chat Metadata**

### **PUT** `/api/chats/:chatId`

Update group name, photo, or description (admin only).

**Request:**
```json
{
  "name": "Updated Group Name",
  "description": "New description",
  "photoUrl": "https://example.com/new-photo.jpg"
}
```

**All fields optional.**

**Response (200 OK):**
```json
{
  "message": "Chat updated successfully",
  "chat": {
    "id": "uuid",
    "name": "Updated Group Name",
    "description": "New description",
    "photo_url": "https://...",
    "updated_at": "2026-02-07T10:50:00Z"
  }
}
```

---

## 🔄 **Supabase Realtime Integration**

### **Android Subscription**

```kotlin
// In ChatViewModel or Repository
suspend fun subscribeToChat(chatId: String) {
    val channel = supabase.channel("chat:$chatId")
    
    // Subscribe to new messages
    channel.onPostgresChanges(
        event = ChangeEvent.INSERT,
        schema = "public",
        table = "messages",
        filter = "chat_id=eq.$chatId"
    ) { change ->
        val newMessage = change.decodeRecord<Message>()
        // Add to UI
        _messages.value += newMessage
    }
    
    // Subscribe to message updates (edits, deletes)
    channel.onPostgresChanges(
        event = ChangeEvent.UPDATE,
        schema = "public",
        table = "messages",
        filter = "chat_id=eq.$chatId"
    ) { change ->
        val updatedMessage = change.decodeRecord<Message>()
        // Update in UI
        _messages.value = _messages.value.map {
            if (it.id == updatedMessage.id) updatedMessage else it
        }
    }
    
    channel.subscribe()
}
```

### **Unsubscribe**

```kotlin
override fun onCleared() {
    super.onCleared()
    supabase.removeChannel("chat:$chatId")
}
```

---

## 🔔 **Notification Payloads**

### **Message Notification**

```json
{
  "notification": {
    "title": "Alice Johnson",
    "body": "Hey! Check this out 😄"
  },
  "data": {
    "type": "message",
    "chat_id": "uuid",
    "sender_id": "uuid",
    "sender_name": "Alice Johnson",
    "sender_avatar": "https://...",
    "message_id": "uuid",
    "message_type": "TEXT",
    "message_preview": "Hey! Check this out",
    "timestamp": "1707307200000"
  },
  "android": {
    "priority": "high",
    "notification": {
      "sound": "default",
      "channelId": "messages",
      "color": "#6200EE"
    }
  }
}
```

### **Group Invite Notification**

```json
{
  "notification": {
    "title": "Group Invitation",
    "body": "Alice added you to Team GIFs"
  },
  "data": {
    "type": "group_invite",
    "group_id": "uuid",
    "group_name": "Team GIFs",
    "inviter_id": "uuid",
    "inviter_name": "Alice Johnson",
    "timestamp": "1707307200000"
  }
}
```

---

## 📱 **Android Integration**

### **Retrofit Interface**

```kotlin
interface ChatApi {
    @GET("chats")
    suspend fun getUserChats(): ChatsResponse
    
    @POST("chats/direct")
    suspend fun createDirectChat(
        @Body request: DirectChatRequest
    ): DirectChatResponse
    
    @POST("chats/group")
    suspend fun createGroup(
        @Body request: CreateGroupRequest
    ): CreateGroupResponse
    
    @GET("chats/{chatId}/info")
    suspend fun getChatInfo(
        @Path("chatId") chatId: String
    ): ChatInfo
    
    @PUT("chats/{chatId}")
    suspend fun updateChat(
        @Path("chatId") chatId: String,
        @Body request: UpdateChatRequest
    ): UpdateChatResponse
    
    @GET("chats/{chatId}/messages")
    suspend fun getMessages(
        @Path("chatId") chatId: String,
        @Query("limit") limit: Int = 50,
        @Query("offset") offset: Int = 0,
        @Query("before") before: String? = null
    ): MessagesResponse
    
    @POST("chats/{chatId}/messages")
    suspend fun sendMessage(
        @Path("chatId") chatId: String,
        @Body request: SendMessageRequest
    ): Message
    
    @PUT("chats/{chatId}/messages/{messageId}")
    suspend fun editMessage(
        @Path("chatId") chatId: String,
        @Path("messageId") messageId: String,
        @Body request: EditMessageRequest
    ): MessageResponse
    
    @DELETE("chats/{chatId}/messages/{messageId}")
    suspend fun deleteMessage(
        @Path("chatId") chatId: String,
        @Path("messageId") messageId: String
    ): MessageResponse
    
    @POST("chats/{chatId}/read")
    suspend fun markAsRead(
        @Path("chatId") chatId: String
    ): MessageResponse
    
    @GET("chats/{chatId}/members")
    suspend fun getMembers(
        @Path("chatId") chatId: String
    ): MembersResponse
    
    @POST("chats/{chatId}/members")
    suspend fun addMember(
        @Path("chatId") chatId: String,
        @Body request: AddMemberRequest
    ): MessageResponse
    
    @DELETE("chats/{chatId}/members/{userId}")
    suspend fun removeMember(
        @Path("chatId") chatId: String,
        @Path("userId") userId: String
    ): MessageResponse
    
    @POST("chats/{chatId}/leave")
    suspend fun leaveGroup(
        @Path("chatId") chatId: String
    ): MessageResponse
    
    @PUT("chats/{chatId}/members/{userId}/role")
    suspend fun updateMemberRole(
        @Path("chatId") chatId: String,
        @Path("userId") userId: String,
        @Body request: UpdateRoleRequest
    ): MessageResponse
}
```

### **Data Models**

```kotlin
data class Chat(
    @SerializedName("chat_id") val chatId: String,
    @SerializedName("chat_type") val chatType: String,
    @SerializedName("chat_name") val chatName: String?,
    @SerializedName("chat_photo") val chatPhoto: String?,
    @SerializedName("chat_description") val chatDescription: String?,
    @SerializedName("unread_count") val unreadCount: Int,
    @SerializedName("last_message_content") val lastMessageContent: String?,
    @SerializedName("last_message_type") val lastMessageType: String?,
    @SerializedName("last_message_time") val lastMessageTime: String?,
    @SerializedName("last_message_sender_name") val lastMessageSenderName: String?,
    @SerializedName("updated_at") val updatedAt: String
)

data class Message(
    val id: String,
    @SerializedName("chat_id") val chatId: String,
    @SerializedName("sender_id") val senderId: String,
    val content: String,
    val type: String,
    val status: String,
    @SerializedName("is_edited") val isEdited: Boolean,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String,
    @SerializedName("reply_to") val replyTo: String?,
    val sender: UserProfile
)

data class SendMessageRequest(
    val content: String,
    val type: String = "TEXT",
    val replyTo: String? = null
)

data class CreateGroupRequest(
    val name: String,
    val memberIds: List<String>,
    val description: String? = null,
    val photoUrl: String? = null
)
```

### **Repository Implementation**

```kotlin
class ChatRepository @Inject constructor(
    private val chatApi: ChatApi,
    private val supabase: SupabaseClient,
    private val ioDispatcher: CoroutineDispatcher
) {
    
    suspend fun getUserChats(): Result<List<Chat>> = withContext(ioDispatcher) {
        try {
            val response = chatApi.getUserChats()
            Result.success(response.chats)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createDirectChat(otherUserId: String): Result<String> {
        return try {
            val response = chatApi.createDirectChat(
                DirectChatRequest(otherUserId)
            )
            Result.success(response.chatId)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun sendMessage(
        chatId: String,
        content: String,
        type: String = "TEXT",
        replyTo: String? = null
    ): Result<Message> = withContext(ioDispatcher) {
        try {
            val request = SendMessageRequest(content, type, replyTo)
            val message = chatApi.sendMessage(chatId, request)
            Result.success(message)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun subscribeToChat(chatId: String, onMessage: (Message) -> Unit) {
        val channel = supabase.channel("chat:$chatId")
        
        channel.onPostgresChanges(
            event = ChangeEvent.INSERT,
            schema = "public",
            table = "messages",
            filter = "chat_id=eq.$chatId"
        ) { change ->
            val message = change.decodeRecord<Message>()
            onMessage(message)
        }
        
        channel.subscribe()
    }
    
    suspend fun markAsRead(chatId: String) {
        try {
            chatApi.markAsRead(chatId)
        } catch (e: Exception) {
            Timber.e(e, "Failed to mark as read")
        }
    }
}
```

### **ViewModel Example**

```kotlin
@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatRepository: ChatRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    private val chatId: String = savedStateHandle["chatId"]!!
    
    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages: StateFlow<List<Message>> = _messages.asStateFlow()
    
    init {
        loadMessages()
        subscribeToRealtime()
    }
    
    private fun loadMessages() {
        viewModelScope.launch {
            chatRepository.getMessages(chatId).onSuccess { response ->
                _messages.value = response.messages.reversed()
            }
        }
    }
    
    private fun subscribeToRealtime() {
        viewModelScope.launch {
            chatRepository.subscribeToChat(chatId) { newMessage ->
                _messages.value += newMessage
                
                // Mark as read if chat is active
                if (lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED)) {
                    markAsRead()
                }
            }
        }
    }
    
    fun sendMessage(content: String, type: String = "TEXT") {
        viewModelScope.launch {
            chatRepository.sendMessage(chatId, content, type)
                .onSuccess { message ->
                    // Message will appear via realtime
                }
                .onFailure { error ->
                    // Handle error
                }
        }
    }
    
    fun markAsRead() {
        viewModelScope.launch {
            chatRepository.markAsRead(chatId)
        }
    }
}
```

---

## 🔒 **Authorization Matrix**

| Endpoint | Direct Chat | Group Member | Group Admin |
|----------|-------------|--------------|-------------|
| Get chats | ✅ | ✅ | ✅ |
| Create direct | ✅ | ✅ | ✅ |
| Create group | ✅ | ✅ | ✅ |
| Get info | ✅ | ✅ | ✅ |
| Get messages | ✅ | ✅ | ✅ |
| Send message | ✅ | ✅ | ✅ |
| Edit own message | ✅ | ✅ | ✅ |
| Delete own message | ✅ | ✅ | ✅ |
| Mark as read | ✅ | ✅ | ✅ |
| Get members | N/A | ✅ | ✅ |
| Add member | N/A | ❌ | ✅ |
| Remove member | N/A | ❌ | ✅ |
| Update role | N/A | ❌ | ✅ |
| Update chat | N/A | ❌ | ✅ |
| Leave group | N/A | ✅ | ✅ |

---

## ⚡ **Performance Considerations**

### **Pagination:**
Always use pagination for messages:
```kotlin
// Load initial messages
getMessages(chatId, limit = 50, offset = 0)

// Load older messages
getMessages(chatId, limit = 50, offset = 50)

// Or use timestamp-based pagination
getMessages(chatId, before = "2026-02-07T10:00:00Z", limit = 20)
```

### **Realtime Best Practices:**
1. Subscribe when entering chat screen
2. Unsubscribe when leaving
3. Mark as read when chat is visible
4. Handle reconnection gracefully

### **Caching:**
```kotlin
// Cache recent messages locally
private val messageCache = LruCache<String, List<Message>>(50)

suspend fun getMessagesWithCache(chatId: String): List<Message> {
    messageCache.get(chatId)?.let { return it }
    
    return chatRepository.getMessages(chatId).getOrElse { emptyList() }
        .also { messages ->
            messageCache.put(chatId, messages)
        }
}
```

---

## 🧪 **Testing Examples**

### **cURL Commands:**

```bash
# Get chats
curl http://localhost:3000/api/chats \
  -H "Authorization: Bearer TOKEN"

# Create direct chat
curl -X POST http://localhost:3000/api/chats/direct \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"otherUserId": "uuid"}'

# Create group
curl -X POST http://localhost:3000/api/chats/group \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Group",
    "memberIds": ["uuid1", "uuid2"],
    "description": "Test group description"
  }'

# Get messages
curl "http://localhost:3000/api/chats/CHAT_ID/messages?limit=20" \
  -H "Authorization: Bearer TOKEN"

# Send message
curl -X POST http://localhost:3000/api/chats/CHAT_ID/messages \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello world!",
    "type": "TEXT"
  }'

# Mark as read
curl -X POST http://localhost:3000/api/chats/CHAT_ID/read \
  -H "Authorization: Bearer TOKEN"

# Get members
curl http://localhost:3000/api/chats/CHAT_ID/members \
  -H "Authorization: Bearer TOKEN"

# Add member (admin only)
curl -X POST http://localhost:3000/api/chats/CHAT_ID/members \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "uuid"}'

# Leave group
curl -X POST http://localhost:3000/api/chats/CHAT_ID/leave \
  -H "Authorization: Bearer TOKEN"
```

---

## 🔗 **Database Schema**

### **Required Tables:**

**chat_rooms:**
```sql
id, type, name, description, photo_url, created_by, created_at, updated_at
```

**chat_participants:**
```sql
id, chat_id, user_id, role, joined_at, unread_count, last_read_at
```

**messages:**
```sql
id, chat_id, sender_id, content, type, status, is_edited, reply_to, created_at, updated_at
```

**user_devices:**
```sql
id, user_id, fcm_token, device_type, notification_enabled, created_at, updated_at
```

**chat_notification_preferences:**
```sql
id, user_id, chat_id, muted_until, created_at, updated_at
```

---

## 🔗 **Related Documentation**

- [Authentication API](./AUTH_API.md)
- [User Management API](./USER_MANAGEMENT_API.md)
- [Backend Setup](../GETTING_STARTED.md)
- [Supabase Realtime Guide](https://supabase.com/docs/guides/realtime)

---

**Chat & Messaging APIs are production-ready! 💬**
