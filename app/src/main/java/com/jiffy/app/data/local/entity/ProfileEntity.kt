package com.jiffy.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "profiles")
data class ProfileEntity(
    @PrimaryKey
    val id: String,
    val email: String,
    val displayName: String,
    val photoUrl: String?,
    val bio: String?,
    val phoneNumber: String?,
    val createdAt: Long,
    val updatedAt: Long,
    val isOnline: Boolean,
    val lastSeen: Long?
)