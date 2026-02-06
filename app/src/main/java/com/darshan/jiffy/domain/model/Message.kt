package com.darshan.jiffy.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Message(
    val id: String,
    val chatId: String,
    val senderId: String,
    val content: String,
    val type: MessageType,
    val timestamp: Long,
    val status: MessageStatus = MessageStatus.SENDING,
    val readBy: List<String> = emptyList()
)

enum class MessageType {
    TEXT,
    GIF,
    IMAGE
}

enum class MessageStatus {
    SENDING,
    SENT,
    DELIVERED,
    READ,
    FAILED
}