package com.jiffy.app.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.jiffy.app.data.local.dao.MessageDao
import com.jiffy.app.data.local.dao.ProfileDao
import com.jiffy.app.data.local.entity.MessageEntity
import com.jiffy.app.data.local.entity.ProfileEntity

@Database(
    entities = [
        ProfileEntity::class,
        MessageEntity::class
    ],
    version = 1,
    exportSchema = true
)
@TypeConverters(Converters::class)
abstract class JiffyDatabase : RoomDatabase() {
    abstract fun profileDao(): ProfileDao
    abstract fun messageDao(): MessageDao
}