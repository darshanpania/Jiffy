package com.jiffy.app.data.local.dao

import androidx.room.*
import com.jiffy.app.data.local.entity.ProfileEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ProfileDao {
    
    @Query("SELECT * FROM profiles WHERE id = :userId")
    fun getProfile(userId: String): Flow<ProfileEntity?>
    
    @Query("SELECT * FROM profiles")
    fun getAllProfiles(): Flow<List<ProfileEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProfile(profile: ProfileEntity)
    
    @Update
    suspend fun updateProfile(profile: ProfileEntity)
    
    @Delete
    suspend fun deleteProfile(profile: ProfileEntity)
    
    @Query("DELETE FROM profiles WHERE id = :userId")
    suspend fun deleteProfileById(userId: String)
    
    @Query("SELECT * FROM profiles WHERE displayName LIKE '%' || :query || '%'")
    fun searchProfiles(query: String): Flow<List<ProfileEntity>>
}