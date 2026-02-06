package com.jiffy.app.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Message(
    val id: String,
    @SerialName("chat_id")
    val chatId: String,
    @SerialName("sender_id")
    val senderId: String,
    @SerialName("receiver_id")
    val receiverId: String? = null,
    val content: String,
    val type: MessageType,
    val status: MessageStatus,
    val timestamp: String,
    @SerialName("is_edited")
    val isEdited: Boolean = false
)

@Serializable
enum class MessageType {
    @SerialName("TEXT")
    TEXT,
    @SerialName("GIF")
    GIF,
    @SerialName("IMAGE")
    IMAGE
}

@Serializable
enum class MessageStatus {
    @SerialName("SENDING")
    SENDING,
    @SerialName("SENT")
    SENT,
    @SerialName("DELIVERED")
    DELIVERED,
    @SerialName("READ")
    READ,
    @SerialName("FAILED")
    FAILED
}