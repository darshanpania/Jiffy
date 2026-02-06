package com.darshan.jiffy.domain.repository

import com.darshan.jiffy.domain.model.User
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    suspend fun signInWithGoogle(idToken: String): Result<User>
    suspend fun signInWithApple(idToken: String): Result<User>
    suspend fun signOut(): Result<Unit>
    fun getCurrentUser(): User?
    fun isUserSignedIn(): Boolean
    fun observeAuthState(): Flow<User?>
}