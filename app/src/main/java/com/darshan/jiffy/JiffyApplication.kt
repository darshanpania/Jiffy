package com.darshan.jiffy

import android.app.Application
import com.posthog.PostHog
import dagger.hilt.android.HiltAndroidApp
import timber.log.Timber

@HiltAndroidApp
class JiffyApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize Timber
        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        }
        
        // Initialize PostHog Analytics
        initializePostHog()
        
        Timber.d("JIFFY Application started")
    }
    
    private fun initializePostHog() {
        PostHog.setup(
            context = this,
            apiKey = BuildConfig.POSTHOG_API_KEY,
            host = "https://app.posthog.com"
        ).apply {
            debug = BuildConfig.DEBUG
        }
        
        Timber.d("PostHog initialized")
    }
}