package com.darshan.jiffy.data.remote

import com.darshan.jiffy.BuildConfig
import retrofit2.http.GET
import retrofit2.http.Query

interface TenorApiService {
    
    @GET("search")
    suspend fun searchGifs(
        @Query("key") apiKey: String = BuildConfig.TENOR_API_KEY,
        @Query("q") query: String,
        @Query("limit") limit: Int = 20,
        @Query("pos") position: String? = null,
        @Query("contentfilter") contentFilter: String = "medium",
        @Query("media_filter") mediaFilter: String = "gif",
        @Query("ar_range") arRange: String = "all"
    ): TenorResponse
    
    @GET("featured")
    suspend fun getFeaturedGifs(
        @Query("key") apiKey: String = BuildConfig.TENOR_API_KEY,
        @Query("limit") limit: Int = 20,
        @Query("pos") position: String? = null,
        @Query("contentfilter") contentFilter: String = "medium"
    ): TenorResponse
    
    @GET("categories")
    suspend fun getCategories(
        @Query("key") apiKey: String = BuildConfig.TENOR_API_KEY
    ): TenorCategoriesResponse
}

data class TenorResponse(
    val results: List<TenorGif>,
    val next: String?
)

data class TenorGif(
    val id: String,
    val title: String,
    val media_formats: TenorMediaFormats,
    val created: Double,
    val content_description: String,
    val itemurl: String,
    val url: String
)

data class TenorMediaFormats(
    val gif: TenorMedia,
    val tinygif: TenorMedia,
    val nanogif: TenorMedia,
    val mediumgif: TenorMedia
)

data class TenorMedia(
    val url: String,
    val dims: List<Int>,
    val size: Int
)

data class TenorCategoriesResponse(
    val tags: List<TenorCategory>
)

data class TenorCategory(
    val searchterm: String,
    val path: String,
    val image: String,
    val name: String
)