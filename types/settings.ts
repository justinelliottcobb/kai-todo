export interface AppSettings {
  // Server status polling
  enableServerPolling: boolean;

  // Sync mode: 'manual' or 'automatic'
  syncMode: 'manual' | 'automatic';
}

export const DEFAULT_SETTINGS: AppSettings = {
  enableServerPolling: true,
  syncMode: 'manual',
};
