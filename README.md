# Kai Todo

A cross-platform todo application built with Expo and React Native, featuring offline-first data persistence with MMKV and online synchronization with a REST API.

## Screenshots, Live Demo, and Video Demonstration

### Screenshots in Emulator
<img src="https://github.com/user-attachments/assets/9cf80395-2082-4cf8-913f-0e31b5cb9ab3" width="200px" alt="Kai-todo-list-dark-02" />
<img src="https://github.com/user-attachments/assets/7bb7c931-cdde-44bb-bc5d-4b5c1aded6b8" width="200px" alet="kai-todo-settings-dark-02" />
<img src="https://github.com/user-attachments/assets/b4d11513-3551-4afa-97a1-57d3e2b11650" width="200px" alt="kai-todo-settings-light-02" />
<img src="https://github.com/user-attachments/assets/554fa517-10b6-43f4-b22f-6b0f7da68398" width="200px" alt="Kai-todo-list-light-02" />

### Video Demo

**Samsung Galaxy S22 Ultra:**

https://github.com/user-attachments/assets/a49228ec-25a5-4eca-a8cc-56474d5daf4b

Note: This video demo shows new todo items being appended to the bottom of the list, that behavior has since been corrected to prepend new items to the top of the list. 

### Live Demo

**[View Live Demo](https://kai-todo-web.onrender.com)**

This app demonstrates **offline-first architecture**. When the demo is first loaded:

1. **Initial Load (Offline Mode)**: The server may take 30-60 seconds to wake up (free hosting cold start). During this time, the app works fully offline - you can create, edit, delete, and reorder todos immediately.

2. **Server Connects**: Once the server wakes up, you'll see the status change from "Offline" to "Online". Any todos you created will sync automatically (if auto-sync is enabled) or you can tap "Sync Now" in manual mode. This will also load and integrate any server-side todo items absent from MMKV local storage.

3. **Testing Offline Behavior**: Wait ~15 minutes for the server to sleep again, or simply use the app while the status shows "Offline" to experience the offline-first functionality.

This cold start behavior showcases the core feature request: **the app is fully functional without a server connection**, and syncs when connectivity is restored.

Note: The app is limited (configurably) to 50 todo items for the sake of demonstration.

## Features

- **Todo Management**: Create, edit, delete, and reorder todos with drag-and-drop
- **Offline-First**: All data persisted locally using MMKV for instant access
- **Online Sync**: Synchronize todos with a REST API server when online
- **Manual/Automatic Sync**: Choose between manual sync control or automatic background sync
- **Server Status Polling**: Real-time server connectivity indicator
- **Dark/Light Theme**: System, light, or dark theme with manual toggle in settings
- **Cross-Platform**: Runs on iOS, Android, and Web

## Tech Stack

- **Framework**: Expo SDK 54, React Native 0.81
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React hooks with Context API
- **Local Storage**: react-native-mmkv
- **Network Detection**: @react-native-community/netinfo
- **Drag & Drop**: react-native-draggable-flatlist
- **Testing**: Jest + React Native Testing Library
- **API Server**: json-server (for development)

## Project Structure

```
kai-todo/
├── app/                      # Expo Router screens
│   ├── _layout.tsx          # Root layout with providers
│   └── (tabs)/              # Tab navigation
│       ├── _layout.tsx      # Tab bar configuration
│       ├── index.tsx        # Main todo list screen
│       └── settings.tsx     # Settings screen
├── components/              # React components
│   ├── add-todo.tsx         # Todo input component
│   ├── todo-item.tsx        # Individual todo item
│   ├── sync-status.tsx      # Sync status indicator
│   ├── sync-notification.tsx # Auto-sync notification
│   ├── server-status-indicator.tsx
│   └── ui/                  # UI primitives
├── hooks/                   # Custom React hooks
│   ├── use-todos.ts         # Main composable hook (combines below)
│   ├── use-todo-storage.ts  # MMKV persistence layer
│   ├── use-todo-sync.ts     # Server synchronization
│   ├── use-todo-actions.ts  # CRUD operations with validation
│   ├── use-network-status.ts # Network connectivity
│   └── use-server-status.ts # Server polling
├── services/                # API and sync services
│   ├── api.ts               # REST API client
│   └── sync.ts              # Sync queue management
├── contexts/                # React contexts
│   └── settings-context.tsx # App settings
├── types/                   # TypeScript types
│   ├── todo.ts              # Todo interface
│   └── settings.ts          # Settings interface
├── utils/                   # Utilities
│   ├── storage.ts           # MMKV storage setup
│   └── uuid.ts              # UUID generation utility
├── constants/               # App constants
│   ├── api.ts               # API configuration
│   └── theme.ts             # Theme colors
├── server/                  # Development API server
│   └── db.json              # json-server database
└── __tests__/               # Test files
```

## Hook Architecture

The todo management logic is decomposed into small, focused hooks for maintainability and testability:

```
useTodos() ─────┬─── useTodoStorage()   # MMKV read/write
                │
                ├─── useTodoActions()   # CRUD + input validation
                │
                └─── useTodoSync()      # Server synchronization
```

| Hook | Responsibility |
|------|----------------|
| `useTodos` | Main entry point, composes other hooks, provides derived state |
| `useTodoStorage` | Loads/saves todos to MMKV, tracks loading state |
| `useTodoActions` | Add, edit, delete, toggle, reorder with validation |
| `useTodoSync` | Syncs with server, handles offline/online transitions |
| `useNetworkStatus` | Monitors device network connectivity |
| `useServerStatus` | Polls server health endpoint |

## Getting Started

### Prerequisites

- Node.js >= 20.19.4 (recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS: Xcode (macOS only)
- For Android: Android Studio with emulator

### Installation

1. Clone the repository and install dependencies:

   ```bash
   cd kai-todo
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

3. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser

## Running the API Server

The app includes a json-server setup for testing online/offline sync functionality.

### Start the API server

```bash
# Standard mode
npm run server

# With simulated network delay (500ms)
npm run server:delay
```

The server runs at `http://localhost:3001` with the following endpoints:
- `GET /todos` - List all todos
- `POST /todos` - Create a todo
- `PUT /todos/:id` - Update a todo
- `DELETE /todos/:id` - Delete a todo

### API URL Configuration

The app uses `http://localhost:3001` for all platforms. For Android (emulator or physical device), you need to set up ADB port forwarding so that `localhost` on the device routes to your development machine:

```bash
adb reverse tcp:3001 tcp:3001
```

This command forwards port 3001 from the Android device to your machine where json-server is running.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS simulator |
| `npm run web` | Run in web browser |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run server` | Start json-server API |
| `npm run server:delay` | Start API with 500ms delay |
| `npm run lint` | Run ESLint |

## App Settings

Access settings via the gear icon in the tab bar:

### Appearance
- **System**: Follow device light/dark mode setting
- **Light**: Always use light theme
- **Dark**: Always use dark theme

### Server Status Polling
- **Enabled**: Polls the server every 5 seconds to check connectivity
- **Disabled**: Stops polling, shows offline status

### Sync Mode
- **Manual**: Shows pending changes count and "Sync Now" button. You control when to sync.
- **Automatic**: Syncs automatically when online. Shows notification on successful sync.

## Offline/Online Behavior

### When Offline
- All CRUD operations work locally via MMKV
- Changes are queued for sync
- Server status shows "Offline" (red indicator)

### When Online
- **Manual mode**: Tap "Sync Now" to push/pull changes
- **Automatic mode**: Changes sync automatically in background
- Server status shows "Online" (green indicator)

### Conflict Resolution
- Uses "last write wins" strategy based on `updatedAt` timestamp
- Server and local todos are merged during sync

## Building and Running Locally

This project uses Expo with prebuilt native projects, allowing you to build and run entirely locally without any Expo account.

### Prerequisites

| Platform | Requirements |
|----------|-------------|
| **Web** | Node.js 20+, npm |
| **Android** | Android Studio, Android SDK (API 34), JDK 17 |
| **iOS** | macOS, Xcode 15+, CocoaPods |

### Web (Easiest)

```bash
# Development
npm start
# Press 'w' to open in browser

# Run server to test online functionality
npm run server

# Production build
npx expo export --platform web
# Output in dist/ folder
```

### Android

**Option 1: Using Android Studio (Recommended)**
1. Open Android Studio
2. Select "Open" → navigate to `kai-todo/android`
3. Wait for Gradle sync to complete
4. Select your device/emulator from the dropdown
5. Click the Run button (green play icon)

**Option 2: Command Line (Gradle)**
```bash
# Navigate to android directory
cd android

# Build debug APK (use gradlew.bat on Windows, ./gradlew on Linux/macOS)
./gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk

# Install on connected device/emulator (requires adb in PATH)
adb install app/build/outputs/apk/debug/app-debug.apk
```

**Option 3: Using Expo CLI**
```bash
# Builds and runs on connected device/emulator
npx expo run:android
```

**Emulator Setup:**
1. In Android Studio: Tools → Device Manager
2. Create a new virtual device (e.g., Pixel 7, API 34)
3. Start the emulator before running the app

**Running with Metro Bundler:**

After installing the APK, start the Metro bundler to serve the JavaScript bundle:
```bash
npm start
```
The app will connect to Metro automatically when launched.

Additionally, to test online functionality, run the server:
```bash
npm run server
```

**To speed up Windows builds:**
```powershell
# Add Windows Defender exclusions (run PowerShell as Admin)
Add-MpPreference -ExclusionPath "C:\path\to\kai-todo"
Add-MpPreference -ExclusionPath "$env:USERPROFILE\.gradle"
Add-MpPreference -ExclusionProcess "java.exe"
Add-MpPreference -ExclusionProcess "node.exe"
```

Add to `android/gradle.properties` for faster Gradle builds:
```properties
org.gradle.daemon=true
org.gradle.caching=true
org.gradle.configureondemand=true
```

**Android Studio Emulator Note**

Android Studio on Windows likes to open the emulator either off the viewable screen, or with a negative size. This is a known issue in the latest versions of Android Studio. The workaround is as follows:

```
# $HOME\.android\avd\emulator_model.avd
window.x = 100 # <-- This value should be positive
window.y = 100 # <-- This value should be positive
window.scale = 0.250000 # <-- This value should be positive
resizable.config.id = -1
posture = 0
uuid = 1766883837549
```

### Physical Android Device

Testing on a physical Android device requires a few additional steps.

**Prerequisites:**
- USB debugging enabled on your device (Settings → Developer Options → USB Debugging)
- Device connected via USB and authorized for debugging
- ADB installed and in your PATH

**1. Verify device connection:**
```bash
adb devices
# Should show your device listed
```

**2. Clean build (required for New Architecture):**

This app uses `react-native-mmkv` v3 which requires React Native's New Architecture (TurboModules). If you encounter errors like "Failed to create a new MMKV instance", perform a clean rebuild:

```bash
# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Remove android folder and regenerate with New Architecture enabled
rm -rf android
npx expo prebuild --platform android

# Clean Gradle cache
cd android
./gradlew clean
cd ..

# Uninstall the app from your physical device before reinstalling
```

**3. Build and install:**
```bash
npm run android
```

**4. Start Metro bundler (if not already running):**
```bash
npm start
```

**5. Set up port forwarding for API server:**
```bash
# Forward port 3001 from device to your machine
adb reverse tcp:3001 tcp:3001

# Start the API server
npm run server
```

**6. Verify port forwarding:**
```bash
adb reverse --list
# Should show: (reverse) tcp:3001 tcp:3001
```

The app should now connect to your local json-server and show "Online" status.

**Troubleshooting:**
- If the server shows "Offline", verify `adb reverse` is set and the server is running
- If you see MMKV errors, ensure you did the clean prebuild steps above
- The "keep awake" error in Metro logs is harmless and only affects dev screen timeout

### iOS (macOS only)

**Option 1: Using Expo CLI**
```bash
# Install CocoaPods dependencies first
cd ios && pod install && cd ..

# Builds and runs on simulator
npx expo run:ios
```

**Option 2: Using Xcode**
1. Open `ios/kaitodo.xcworkspace` in Xcode
2. Select a simulator from the device dropdown
3. Click the Run button

### Verifying Your Environment

```bash
# Check for any setup issues
npx expo doctor
```

## Deployment

### Web & API (Render)

Both the web frontend and API server are deployed to Render using the included `render.yaml` Blueprint.

**Quick Setup:**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` and creates both services:
   - **kai-todo-web**: Static site (frontend)
   - **kai-todo-api**: Web service (json-server backend)
5. The web frontend automatically gets the API URL via `EXPO_PUBLIC_API_URL`

**What Gets Deployed:**

| Service | Type | URL Pattern |
|---------|------|-------------|
| kai-todo-web | Static Site | `https://kai-todo-web.onrender.com` |
| kai-todo-api | Web Service | `https://kai-todo-api.onrender.com` |

**Optional: CI/CD Deploy Hooks**

Render auto-deploys when you push to main (if connected to GitHub). For additional control via GitHub Actions, add deploy hooks:

1. In Render, go to each service → Settings → "Deploy Hook"
2. In GitHub repo → Settings → Secrets → Actions, add:
   - `RENDER_DEPLOY_HOOK_API` = API service deploy hook URL
   - `RENDER_DEPLOY_HOOK_WEB` = Web service deploy hook URL

**Free Tier Notes:**
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- This is intentional for the demo - see [Live Demo](#live-demo) section
- Data in `db.json` persists between requests but resets on redeploy

### Mobile App Stores

For production mobile builds, you can either:

1. **Use EAS Build** (requires free Expo account):
   ```bash
   npm install -g eas-cli
   eas build --platform android
   eas build --platform ios
   ```

2. **Build locally** and submit manually:
   - Android: Generate signed APK/AAB via Android Studio
   - iOS: Archive and upload via Xcode

## CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs on all PRs:

- Linting (`npm run lint`)
- Type checking (`npx tsc --noEmit`)
- Tests (`npm test`)
- Web build verification

## License

This project is private and not licensed for public distribution.
