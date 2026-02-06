# 🚀 JIFFY Setup Guide

Complete step-by-step guide to set up the JIFFY development environment.

---

## 📋 Prerequisites

### Required Software
- [x] **Android Studio** Hedgehog (2023.1.1) or newer
- [x] **JDK** 17 or higher
- [x] **Git** for version control
- [x] **Android SDK** API 24-34

### Required Accounts
- [x] **Supabase Account** - [Sign up](https://supabase.com)
- [x] **Firebase Account** - [Console](https://console.firebase.google.com)
- [x] **GIPHY Developer Account** - [Register](https://developers.giphy.com)
- [x] **Google Cloud Account** - For Tenor API and Google Sign-In
- [x] **PostHog Account** - [Sign up](https://posthog.com)
- [x] **Apple Developer Account** - For Apple Sign-In (optional, $99/year)

---

## 🔧 Step 1: Clone Repository

```bash
git clone https://github.com/darshanpania/jiffy.git
cd jiffy
```

---

## 🔑 Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Enter project details:
   - **Name:** jiffy-prod (or jiffy-dev for development)
   - **Database Password:** Strong password (save it!)
   - **Region:** Choose closest to your users
4. Wait for project initialization (~2 minutes)

### 2.2 Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Project API Key (anon):** `eyJhbGc...`

### 2.3 Run Database Schema

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy entire contents of `database/schema.sql`
4. Click **Run**
5. Verify all tables created successfully

### 2.4 Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Google** provider:
   - Click on Google
   - Toggle "Enable Sign in with Google"
   - You'll add Client ID/Secret in Step 4

3. Enable **Apple** provider:
   - Click on Apple
   - Toggle "Enable Sign in with Apple"
   - You'll configure Apple credentials in Step 5

### 2.5 Create Storage Bucket

1. Go to **Storage**
2. Click **New Bucket**
3. Create bucket: `avatars`
   - Public bucket: **Yes**
   - File size limit: **5 MB**
   - Allowed MIME types: `image/jpeg, image/png, image/webp`
4. Click **Create bucket**

---

## 🔥 Step 3: Firebase Setup (FCM Only)

### 3.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: **JIFFY**
4. Disable Google Analytics (we use PostHog)
5. Click "Create project"

### 3.2 Add Android App

1. Click **Android icon** to add Android app
2. Enter package name: `com.darshan.jiffy`
3. Enter app nickname: **JIFFY Android**
4. Click "Register app"

### 3.3 Get SHA-1 Fingerprints

```bash
# Debug SHA-1
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Copy the SHA-1 and add to Firebase Console
```

### 3.4 Download google-services.json

1. Download `google-services.json` from Firebase Console
2. Place in `app/` directory
3. **Important:** Add to `.gitignore` (already included)

### 3.5 Enable Cloud Messaging

1. Go to **Build** → **Cloud Messaging**
2. No additional configuration needed (auto-enabled)

---

## 🔐 Step 4: Google Sign-In Setup

### 4.1 Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project (or create new)
3. Go to **APIs & Services** → **Credentials**

### 4.2 Configure OAuth Consent Screen

1. Click **OAuth consent screen**
2. Choose **External**
3. Fill in:
   - **App name:** JIFFY
   - **User support email:** your-email@gmail.com
   - **Developer contact:** your-email@gmail.com
4. Click **Save and Continue**
5. Add scopes: `email`, `profile`, `openid`
6. Click **Save and Continue**

### 4.3 Create OAuth 2.0 Client ID

1. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
2. Choose **Web application**
3. Name: **JIFFY Web Client (for Supabase)**
4. Add Authorized redirect URI:
   ```
   https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
   ```
5. Click **Create**
6. **Copy Client ID and Client Secret**

### 4.4 Create Android OAuth Client

1. Create another OAuth Client ID
2. Choose **Android**
3. Name: **JIFFY Android**
4. Package name: `com.darshan.jiffy`
5. SHA-1: Paste from Step 3.3
6. Click **Create**
7. **Copy the Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

### 4.5 Configure in Supabase

1. Go to Supabase **Authentication** → **Providers** → **Google**
2. Paste **Client ID** (from Web Client)
3. Paste **Client Secret** (from Web Client)
4. Click **Save**

---

## 🍎 Step 5: Apple Sign-In Setup (Optional)

### 5.1 Apple Developer Account

1. Enroll in [Apple Developer Program](https://developer.apple.com/programs/) ($99/year)
2. Wait for approval

### 5.2 Register App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. **Certificates, IDs & Profiles** → **Identifiers**
3. Click **+** → Choose **App IDs**
4. Select **App**
5. Description: **JIFFY**
6. Bundle ID: `com.darshan.jiffy`
7. Enable **Sign in with Apple**
8. Click **Continue** → **Register**

### 5.3 Create Service ID

1. **Identifiers** → **+** → **Services IDs**
2. Description: **JIFFY Sign In**
3. Identifier: `com.darshan.jiffy.signin`
4. Enable **Sign in with Apple**
5. Click **Configure**
6. Add Return URL:
   ```
   https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
   ```
7. Click **Save** → **Continue** → **Register**

### 5.4 Create Private Key

1. **Keys** → **+**
2. Name: **JIFFY Apple Sign In Key**
3. Enable **Sign in with Apple**
4. Click **Configure** → Select your App ID
5. Click **Save** → **Continue** → **Register**
6. **Download the .p8 key file** (save securely!)
7. Note the **Key ID**

### 5.5 Configure in Supabase

1. Supabase → **Authentication** → **Providers** → **Apple**
2. Paste **Service ID**: `com.darshan.jiffy.signin`
3. Paste **Team ID**: (from Apple Developer Portal)
4. Paste **Key ID**: (from step 5.4)
5. Upload **.p8 file**
6. Click **Save**

---

## 🎨 Step 6: GIPHY API Setup

1. Go to [GIPHY Developers](https://developers.giphy.com)
2. Click **Create an App**
3. Choose **SDK** (not API)
4. App name: **JIFFY**
5. Description: "GIF messaging app"
6. Click **Create App**
7. **Copy API Key**

---

## 🎭 Step 7: Tenor API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project (same as Firebase)
3. **APIs & Services** → **Library**
4. Search for **"Tenor API"**
5. Click **Enable**
6. Go to **Credentials** → **Create Credentials** → **API Key**
7. Name: **Tenor API Key**
8. Restrict key to **Tenor API** only
9. **Copy API Key**

---

## 📊 Step 8: PostHog Setup

1. Go to [PostHog](https://app.posthog.com)
2. Sign up or log in
3. Create organization: **JIFFY**
4. Create project: **JIFFY Android**
5. Copy **Project API Key** (starts with `phc_`)
6. Copy **Host URL** (usually `https://app.posthog.com`)

---

## 📝 Step 9: Configure local.properties

Create `local.properties` in project root:

```properties
# Android SDK (auto-generated by Android Studio)
sdk.dir=/Users/your-username/Library/Android/sdk

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Sign-In (Android OAuth Client ID from Step 4.4)
GOOGLE_CLIENT_ID=xxxxx-xxxxx.apps.googleusercontent.com

# Apple Sign-In (Service ID from Step 5.3)
APPLE_SERVICE_ID=com.darshan.jiffy.signin

# GIPHY API (from Step 6)
GIPHY_API_KEY=your_giphy_api_key_here

# Tenor API (from Step 7)
TENOR_API_KEY=your_tenor_api_key_here

# PostHog (from Step 8)
POSTHOG_API_KEY=phc_xxxxxxxxxxxxxxxxxxxxx

# Social Media (Optional - for Phase 2)
FACEBOOK_APP_ID=your_facebook_app_id
TWITTER_API_KEY=your_twitter_api_key
```

**⚠️ NEVER commit this file to git!** (It's in `.gitignore`)

---

## 🔨 Step 10: Build the Project

### 10.1 Open in Android Studio

1. Open Android Studio
2. **File** → **Open**
3. Select the `jiffy` folder
4. Wait for Gradle sync

### 10.2 Sync Gradle

```bash
# Or via command line
./gradlew build
```

### 10.3 Run on Device/Emulator

1. Connect Android device or start emulator
2. Click **Run** ▶️ button
3. Select device
4. App should install and launch

---

## ✅ Step 11: Verify Setup

### Test Checklist

- [ ] App builds without errors
- [ ] Supabase connection works (check Logcat)
- [ ] PostHog initialized (check Logcat: "PostHog initialized")
- [ ] Google Sign-In button appears
- [ ] Apple Sign-In button appears (if configured)
- [ ] No API key errors in Logcat

### Verify in Supabase Dashboard

1. **Database** → Run query:
   ```sql
   SELECT * FROM profiles;
   ```
   Should return empty table (no errors)

2. **Authentication** → **Users**
   Should show empty list initially

3. **Storage** → **avatars bucket**
   Should exist and be empty

---

## 🐛 Troubleshooting

### Build Errors

**"Could not find Supabase dependency"**
```bash
./gradlew --refresh-dependencies
```

**"API key not found"**
- Check `local.properties` exists
- Verify all keys are set
- Sync Gradle again

### Google Sign-In Issues

**"Sign-in failed"**
- Verify SHA-1 fingerprint in Firebase Console
- Check GOOGLE_CLIENT_ID matches Android OAuth Client
- Ensure Google provider enabled in Supabase

### Supabase Connection Issues

**"Unable to connect to Supabase"**
- Verify SUPABASE_URL is correct
- Check SUPABASE_ANON_KEY is valid
- Ensure internet connection
- Check Supabase project is not paused

---

## 📚 Next Steps

After successful setup:

1. **Read the Issues:**
   - [#28 - Project Setup](https://github.com/darshanpania/jiffy/issues/28)
   - [#29 - Supabase Auth](https://github.com/darshanpania/jiffy/issues/29)
   - [#37 - Phase 1 Tracker](https://github.com/darshanpania/jiffy/issues/37)

2. **Start Development:**
   - Begin with Sprint 1-2 issues
   - Follow Clean Architecture patterns
   - Write tests as you code
   - Commit frequently

3. **Join Community:**
   - Star the repository ⭐
   - Watch for updates
   - Open issues for bugs
   - Contribute improvements

---

## 💡 Pro Tips

- Use **Build Variants** for different environments (dev, staging, prod)
- Run **tests frequently** with `./gradlew test`
- Use **Logcat filters** to debug Supabase/PostHog
- Enable **debug mode** in PostHog to see events
- Use **Supabase Studio** to view real-time data
- Check **PostHog dashboard** to verify analytics

---

## 🆘 Getting Help

**Can't get something working?**

1. Check [Troubleshooting](#troubleshooting) section above
2. Search [existing issues](https://github.com/darshanpania/jiffy/issues)
3. Check documentation:
   - [README.md](README.md)
   - [TECH_STACK.md](TECH_STACK.md)
4. Open a [new issue](https://github.com/darshanpania/jiffy/issues/new)
5. Ask in [Discussions](https://github.com/darshanpania/jiffy/discussions)

---

## ✅ Setup Complete!

You're ready to start building JIFFY! 🎉

**Next:** Start with [Issue #28 - Project Setup](https://github.com/darshanpania/jiffy/issues/28)

---

**Happy Coding! 💻**
