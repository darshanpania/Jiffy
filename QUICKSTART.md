# ⚡ JIFFY Quick Start Guide

Get JIFFY up and running in 10 minutes!

---

## 🚀 Quick Setup (10 Minutes)

### 1️⃣ Clone Repository (1 min)
```bash
git clone https://github.com/darshanpania/jiffy.git
cd jiffy
```

### 2️⃣ Install Prerequisites (5 min)
- Download [Android Studio](https://developer.android.com/studio)
- Install JDK 17+

### 3️⃣ Configure API Keys (4 min)

**Create `local.properties` file:**
```bash
cp local.properties.example local.properties
```

**Add these keys to `local.properties`:**
```properties
# Supabase (Get from: https://app.supabase.com)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Google Sign-In (Get from: https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# GIPHY (Get from: https://developers.giphy.com)
GIPHY_API_KEY=your-giphy-key

# Tenor (Get from: https://console.cloud.google.com)
TENOR_API_KEY=your-tenor-key

# PostHog (Get from: https://app.posthog.com)
POSTHOG_API_KEY=phc_your-posthog-key
```

### 4️⃣ Run Database Schema (2 min)

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor** → **New Query**
3. Copy contents of `database/schema.sql`
4. Click **Run**

### 5️⃣ Add google-services.json (1 min)

1. Download from [Firebase Console](https://console.firebase.google.com)
2. Place in `app/` directory

### 6️⃣ Build & Run! (1 min)
```bash
./gradlew assembleDebug
```

Or open in Android Studio and click Run ▶️

---

## 🎯 What You Get

After setup, you'll have:

✅ **Modern Android App**
- Kotlin + Jetpack Compose
- Material Design 3 UI
- Clean Architecture

✅ **Authentication**
- Google Sign-In ready
- Apple Sign-In ready
- Supabase Auth backend

✅ **Features Ready to Build**
- User profiles
- Friend system
- Real-time chat
- GIF integration (GIPHY + Tenor)
- Push notifications (FCM)
- Analytics (PostHog)

---

## 📋 Development Workflow

### Start Development

1. **Check Issues:**
   ```
   Phase 1 Sprint 1-2 (Weeks 1-4):
   - Issue #28: Project Setup
   - Issue #29: Supabase Authentication
   - Issue #30: User Profiles
   - Issue #35: PostHog Analytics
   - Issue #36: Firebase Cloud Messaging
   ```

2. **Create Feature Branch:**
   ```bash
   git checkout -b feature/supabase-auth
   ```

3. **Make Changes & Commit:**
   ```bash
   git add .
   git commit -m "feat(auth): implement Google Sign-In with Supabase"
   ```

4. **Push & Create PR:**
   ```bash
   git push origin feature/supabase-auth
   # Then create PR on GitHub
   ```

### Run Tests
```bash
# Unit tests
./gradlew test

# UI tests
./gradlew connectedAndroidTest
```

---

## 🐛 Common Issues

**Problem:** Build fails with "API key not found"
```
✅ Solution: Make sure local.properties exists with all keys
```

**Problem:** Supabase connection fails
```
✅ Solution: Check SUPABASE_URL and SUPABASE_ANON_KEY are correct
```

**Problem:** Google Sign-In fails
```
✅ Solution: 
1. Add SHA-1 fingerprint to Firebase Console
2. Verify GOOGLE_CLIENT_ID matches Android OAuth client
```

**Problem:** Gradle sync fails
```bash
✅ Solution: 
./gradlew --refresh-dependencies
```

---

## 📚 Next Steps

1. **Read the Docs:**
   - [README.md](README.md) - Project overview
   - [TECH_STACK.md](TECH_STACK.md) - Technology details
   - [SETUP.md](SETUP.md) - Detailed setup guide

2. **Track Progress:**
   - [Issue #37](https://github.com/darshanpania/jiffy/issues/37) - Phase 1 Tracker

3. **Start Coding:**
   - Begin with [Issue #28](https://github.com/darshanpania/jiffy/issues/28)
   - Follow the acceptance criteria
   - Write tests as you code

4. **Join Community:**
   - ⭐ Star the repository
   - 👀 Watch for updates
   - 💬 Open discussions for questions

---

## 🎉 You're Ready!

**Start building:**
```bash
# Open in Android Studio
studio .

# Or via command line
./gradlew build
./gradlew installDebug
```

**Happy Coding! 🚀**

---

## 📞 Need Help?

- 📖 [Full Setup Guide](SETUP.md)
- 🐛 [Report Issues](https://github.com/darshanpania/jiffy/issues)
- 💬 [Discussions](https://github.com/darshanpania/jiffy/discussions)
- 📧 Email: dev@jiffy.app

---

**Built with ❤️ using Kotlin, Supabase, and Jetpack Compose**
