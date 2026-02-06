package com.darshan.jiffy.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.darshan.jiffy.presentation.auth.AuthScreen
import com.darshan.jiffy.presentation.home.HomeScreen

@Composable
fun JiffyNavHost() {
    val navController = rememberNavController()
    
    NavHost(
        navController = navController,
        startDestination = "auth"
    ) {
        composable("auth") {
            AuthScreen(
                onAuthSuccess = {
                    navController.navigate("home") {
                        popUpTo("auth") { inclusive = true }
                    }
                }
            )
        }
        
        composable("home") {
            HomeScreen()
        }
    }
}