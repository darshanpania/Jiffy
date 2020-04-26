package com.darshan.jiffy;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import android.view.animation.AnimationUtils;
import android.widget.TextView;

public class SplashActivity extends AppCompatActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);
        scheduleSplashScreen();
        TextView appLogo = findViewById(R.id.appLogo);
        appLogo.startAnimation(AnimationUtils.loadAnimation(SplashActivity.this,android.R.anim.slide_in_left));
    }

    private void scheduleSplashScreen() {
        final long splashDuration = 2000L;
        Handler handler = new Handler();
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                Intent mainIntent = new Intent(SplashActivity.this, LoginActivity.class);
                startActivity(mainIntent);
                SplashActivity.this.finish();
            }
        }, splashDuration);
    }
}
