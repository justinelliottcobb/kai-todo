export type ThemePreference = 'light' | 'dark' | 'system';

export interface AppSettings {
  // Theme preference
  theme: ThemePreference;

  // Server status polling
  enableServerPolling: boolean;

  // Sync mode: 'manual' or 'automatic'
  syncMode: 'manual' | 'automatic';
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  enableServerPolling: true,
  syncMode: 'manual',
};
