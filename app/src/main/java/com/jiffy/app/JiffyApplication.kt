package com.jiffy.app

import android.app.Application
import com.posthog.PostHog
import dagger.hilt.android.HiltAndroidApp
import timber.log.Timber

@HiltAndroidApp
class JiffyApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        
        // Initialize Timber logging
        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        }
        
        // Initialize PostHog Analytics
        initializePostHog()
        
        Timber.d("Jiffy Application Started")
    }

    private fun initializePostHog() {
        if (BuildConfig.POSTHOG_API_KEY.isNotEmpty()) {
            PostHog.setup(
                this,
                apiKey = BuildConfig.POSTHOG_API_KEY,
                host = "https://app.posthog.com"
            ).apply {
                debug = BuildConfig.DEBUG
            }
            Timber.d("PostHog initialized")
        } else {
            Timber.w("PostHog API key not found")
        }
    }
}