package com.jiffy.app.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class UserProfile(
    val id: String,
    val email: String,
    @SerialName("display_name")
    val displayName: String,
    @SerialName("photo_url")
    val photoUrl: String? = null,
    val bio: String? = null,
    @SerialName("phone_number")
    val phoneNumber: String? = null,
    @SerialName("created_at")
    val createdAt: String,
    @SerialName("updated_at")
    val updatedAt: String,
    @SerialName("is_online")
    val isOnline: Boolean = false,
    @SerialName("last_seen")
    val lastSeen: String? = null
)