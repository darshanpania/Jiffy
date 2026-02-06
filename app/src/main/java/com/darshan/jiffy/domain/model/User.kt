package com.darshan.jiffy.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val email: String,
    val displayName: String,
    val avatarUrl: String? = null,
    val bio: String? = null,
    val isOnline: Boolean = false,
    val lastSeen: Long? = null,
    val createdAt: Long = System.currentTimeMillis()
)