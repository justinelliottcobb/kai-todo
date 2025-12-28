// Using localhost works for:
// - Web: direct access
// - iOS Simulator: direct access
// - Android Emulator: requires `adb reverse tcp:3001 tcp:3001`
// - Physical devices: requires `adb reverse tcp:3001 tcp:3001`
export const API_BASE_URL = 'http://localhost:3001';
export const API_TIMEOUT = 10000;
