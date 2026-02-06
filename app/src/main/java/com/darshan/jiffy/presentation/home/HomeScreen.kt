package com.darshan.jiffy.presentation.home

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen() {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("Chats", "Friends", "Profile")
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("JIFFY") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        },
        bottomBar = {
            NavigationBar {
                tabs.forEachIndexed { index, title ->
                    NavigationBarItem(
                        icon = {
                            when (index) {
                                0 -> Icon(Icons.Default.Chat, contentDescription = title)
                                1 -> Icon(Icons.Default.People, contentDescription = title)
                                2 -> Icon(Icons.Default.Person, contentDescription = title)
                            }
                        },
                        label = { Text(title) },
                        selected = selectedTab == index,
                        onClick = { selectedTab = index }
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues)) {
            when (selectedTab) {
                0 -> ChatsContent()
                1 -> FriendsContent()
                2 -> ProfileContent()
            }
        }
    }
}

@Composable
fun ChatsContent() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = androidx.compose.ui.Alignment.Center
    ) {
        Text("Chats - Coming Soon")
    }
}

@Composable
fun FriendsContent() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = androidx.compose.ui.Alignment.Center
    ) {
        Text("Friends - Coming Soon")
    }
}

@Composable
fun ProfileContent() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = androidx.compose.ui.Alignment.Center
    ) {
        Text("Profile - Coming Soon")
    }
}