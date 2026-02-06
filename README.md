# 🎉 JIFFY - GIF-Powered Chat Application

[![Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://developer.android.com/)
[![API](https://img.shields.io/badge/API-21%2B-brightgreen.svg?style=flat)](https://android-arsenal.com/api?level=21)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-orange.svg)](https://firebase.google.com/)

**JIFFY** is an Android chat application that brings conversations to life with GIFs! Express yourself beyond words with an intuitive, fun, and expressive messaging experience powered by animated GIFs.

## 📱 Project Overview

JIFFY transforms traditional text messaging into a vibrant, visual experience. Users can communicate using GIFs, making conversations more engaging, emotional, and fun. The app leverages Firebase for real-time messaging and Google Sign-In for seamless authentication.

### ✨ Key Features

- 🔐 **Google Sign-In Authentication** - Quick and secure login
- 💬 **Real-time Messaging** - Instant message delivery with Firebase Realtime Database
- 🎨 **GIF Integration** - Browse and share GIFs from popular providers
- 👥 **User Profiles** - Personalized user experience
- ⚡ **Fast & Responsive** - Optimized for smooth performance
- 🎯 **Material Design** - Modern and intuitive UI/UX

## 🛠️ Tech Stack

### Core Technologies
- **Language:** Java
- **Platform:** Android (API 21+)
- **IDE:** Android Studio

### Architecture & Libraries
- **Architecture Pattern:** MVC/MVVM (evolving)
- **UI Framework:** AndroidX, Material Components
- **Backend:** Firebase
  - Firebase Authentication
  - Firebase Realtime Database
- **Authentication:** Google Play Services Auth
- **Build System:** Gradle

### Key Dependencies
```gradle
- AndroidX AppCompat 1.1.0
- ConstraintLayout 1.1.3
- Firebase Auth 19.3.0
- Firebase Realtime Database 19.3.0
- Google Play Services Auth 18.0.0
```

## 🏗️ Project Architecture

```
jiffy/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/darshan/jiffy/
│   │   │   │   ├── activities/          # Activity classes
│   │   │   │   ├── models/              # Data models
│   │   │   │   ├── adapters/            # RecyclerView adapters
│   │   │   │   ├── utils/               # Utility classes
│   │   │   │   └── interfaces/          # Interface definitions
│   │   │   ├── res/
│   │   │   │   ├── layout/              # XML layouts
│   │   │   │   ├── drawable/            # Images & drawables
│   │   │   │   ├── values/              # Strings, colors, styles
│   │   │   │   └── mipmap/              # App icons
│   │   │   └── AndroidManifest.xml
│   │   ├── test/                        # Unit tests
│   │   └── androidTest/                 # Instrumentation tests
│   ├── build.gradle                     # App-level Gradle
│   └── google-services.json             # Firebase config (not in repo)
├── build.gradle                         # Project-level Gradle
├── gradle.properties
├── settings.gradle
└── README.md
```

### Architecture Patterns
- **Current:** Basic MVC structure
- **Planned Migration:** MVVM with Repository pattern for better separation of concerns

## 🚀 Getting Started

### Prerequisites
- Android Studio Arctic Fox or newer
- JDK 8 or higher
- Android SDK (API 28+)
- Firebase account
- Google Cloud Console project (for Google Sign-In)

### Setup Instructions

#### 1. Clone the Repository
```bash
git clone https://github.com/darshanpania/jiffy.git
cd jiffy
```

#### 2. Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Add an Android app with package name: `com.darshan.jiffy`
4. Download `google-services.json`
5. Place it in the `app/` directory

#### 3. Enable Firebase Services
In Firebase Console, enable:
- **Authentication** → Google Sign-In provider
- **Realtime Database** → Create database in test mode

#### 4. Configure Google Sign-In
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add your debug/release SHA-1 fingerprints

To get your SHA-1:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

#### 5. Build & Run
```bash
# Open project in Android Studio
# Sync Gradle
# Run on emulator or physical device
```

Or via command line:
```bash
./gradlew assembleDebug
./gradlew installDebug
```

## 📋 Development Roadmap

### Phase 1: Foundation ✅ (Completed)
- [x] Project setup and structure
- [x] Google Sign-In integration
- [x] Firebase Authentication
- [x] User creation in Realtime Database
- [x] Basic UI layout

### Phase 2: Core Messaging (In Progress)
- [ ] Real-time chat functionality
- [ ] Message model and adapter
- [ ] Chat list view
- [ ] Individual chat screens
- [ ] Message timestamps and read receipts

### Phase 3: GIF Integration
- [ ] Integrate GIF API (Giphy/Tenor)
- [ ] GIF search and browse interface
- [ ] GIF picker in chat
- [ ] GIF caching and optimization
- [ ] Share GIFs in conversations

### Phase 4: Enhanced Features
- [ ] User profiles with avatars
- [ ] Online/offline status
- [ ] Push notifications (FCM)
- [ ] Group chat support
- [ ] Media sharing (images, videos)
- [ ] Message reactions and emojis

### Phase 5: Polish & Optimization
- [ ] Performance optimization
- [ ] Offline support
- [ ] Dark mode
- [ ] Custom themes
- [ ] Settings and preferences
- [ ] Comprehensive testing suite

### Phase 6: Advanced Features (Future)
- [ ] Voice messages
- [ ] Video calls
- [ ] Story/status feature
- [ ] End-to-end encryption
- [ ] Multi-device sync
- [ ] Chat backup and restore

## 🧪 Testing

### Run Unit Tests
```bash
./gradlew test
```

### Run Instrumentation Tests
```bash
./gradlew connectedAndroidTest
```

## 📦 Building Release APK

```bash
./gradlew assembleRelease
```

The signed APK will be available at: `app/build/outputs/apk/release/`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Code Style

This project follows the [Android Kotlin Style Guide](https://developer.android.com/kotlin/style-guide) and [Java Style Guide](https://google.github.io/styleguide/javaguide.html).

## 🐛 Known Issues

- Project uses older Gradle version (3.5.1) - upgrade recommended
- Android API targets 28 - should update to latest (33+)
- JCenter repository is deprecated - migrate to Maven Central

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Darshan Pania**
- GitHub: [@darshanpania](https://github.com/darshanpania)
- Email: darshanpania@gmail.com

## 🙏 Acknowledgments

- Firebase for real-time backend infrastructure
- Material Design guidelines for UI/UX inspiration
- Android developer community for best practices

## 📞 Support

For support, email darshanpania@gmail.com or open an issue in the repository.

---

**Made with ❤️ and lots of GIFs!**
