package com.jiffy.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "messages")
data class MessageEntity(
    @PrimaryKey
    val id: String,
    val chatId: String,
    val senderId: String,
    val receiverId: String?,
    val content: String,
    val type: String, // TEXT, GIF, IMAGE
    val status: String, // SENDING, SENT, DELIVERED, READ
    val timestamp: Long,
    val isEdited: Boolean = false
)