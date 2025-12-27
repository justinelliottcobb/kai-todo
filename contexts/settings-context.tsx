import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { AppSettings, DEFAULT_SETTINGS } from '@/types/settings';
import { storage, STORAGE_KEYS } from '@/utils/storage';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load settings from storage on mount
  useEffect(() => {
    try {
      const stored = storage.getString(STORAGE_KEYS.SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppSettings>;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  // Save settings to storage whenever they change
  useEffect(() => {
    try {
      storage.set(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

/**
 * Hook that returns the effective color scheme based on user's theme preference.
 * Falls back to system color scheme if used outside SettingsProvider (e.g., in tests).
 */
export function useColorScheme(): 'light' | 'dark' {
  const context = useContext(SettingsContext);
  const systemColorScheme = useSystemColorScheme();

  // If outside provider (e.g., in tests), use system color scheme
  if (!context) {
    return systemColorScheme ?? 'light';
  }

  const { settings } = context;

  if (settings.theme === 'system') {
    return systemColorScheme ?? 'light';
  }
  return settings.theme;
}
