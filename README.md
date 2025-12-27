# Kai Todo

A cross-platform todo application built with Expo and React Native, featuring offline-first data persistence with MMKV and online synchronization with a REST API.

## Features

- **Todo Management**: Create, edit, delete, and reorder todos with drag-and-drop
- **Offline-First**: All data persisted locally using MMKV for instant access
- **Online Sync**: Synchronize todos with a REST API server when online
- **Manual/Automatic Sync**: Choose between manual sync control or automatic background sync
- **Server Status Polling**: Real-time server connectivity indicator
- **Dark/Light Theme**: Automatic theme switching based on system preferences
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
│   ├── use-todos.ts         # Todo state management
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
│   └── storage.ts           # MMKV storage setup
├── constants/               # App constants
│   ├── api.ts               # API configuration
│   └── theme.ts             # Theme colors
├── server/                  # Development API server
│   └── db.json              # json-server database
└── __tests__/               # Test files
```

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

### Platform-Specific API URLs

The app automatically uses the correct URL based on platform:
- **iOS Simulator / Web**: `http://localhost:3001`
- **Android Emulator**: `http://10.0.2.2:3001`

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

## Building for Production

### Expo Build (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Local Development Build

```bash
# iOS (requires macOS with Xcode)
npm run ios

# Android
npm run android
```

## License

This project is private and not licensed for public distribution.
