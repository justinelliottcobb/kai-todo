// API URL configuration:
// - Production: Uses EXPO_PUBLIC_API_URL environment variable (set in Render)
// - Development: Falls back to localhost:3001
//
// For Android (emulator or physical device), run: adb reverse tcp:3001 tcp:3001
const getBaseUrl = (): string => {
  // Check for production/deployment URL first
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Default to localhost for development
  return 'http://localhost:3001';
};

export const API_BASE_URL = getBaseUrl();

// Timeout for API requests (in milliseconds)
// Set high to accommodate Render free tier cold starts (~30-60s)
export const API_TIMEOUT = 120000; // 2 minutes
