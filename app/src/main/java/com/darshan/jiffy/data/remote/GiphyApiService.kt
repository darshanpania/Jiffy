package com.darshan.jiffy.data.remote

import com.darshan.jiffy.BuildConfig
import retrofit2.http.GET
import retrofit2.http.Query

interface GiphyApiService {
    
    @GET("gifs/search")
    suspend fun searchGifs(
        @Query("api_key") apiKey: String = BuildConfig.GIPHY_API_KEY,
        @Query("q") query: String,
        @Query("limit") limit: Int = 25,
        @Query("offset") offset: Int = 0,
        @Query("rating") rating: String = "g",
        @Query("lang") lang: String = "en"
    ): GiphyResponse
    
    @GET("gifs/trending")
    suspend fun getTrendingGifs(
        @Query("api_key") apiKey: String = BuildConfig.GIPHY_API_KEY,
        @Query("limit") limit: Int = 25,
        @Query("offset") offset: Int = 0,
        @Query("rating") rating: String = "g"
    ): GiphyResponse
}

data class GiphyResponse(
    val data: List<GiphyGif>,
    val pagination: Pagination,
    val meta: Meta
)

data class GiphyGif(
    val id: String,
    val title: String,
    val images: GiphyImages
)

data class GiphyImages(
    val original: GiphyImage,
    val downsized: GiphyImage,
    val preview_gif: GiphyImage
)

data class GiphyImage(
    val url: String,
    val width: String,
    val height: String,
    val size: String?
)

data class Pagination(
    val total_count: Int,
    val count: Int,
    val offset: Int
)

data class Meta(
    val status: Int,
    val msg: String,
    val response_id: String
)