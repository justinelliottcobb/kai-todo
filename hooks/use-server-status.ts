import { useState, useEffect, useCallback, useRef } from 'react';
import { checkServerHealth } from '@/services/api';

const POLL_INTERVAL = 5000; // Poll every 5 seconds

export interface ServerStatus {
  isServerOnline: boolean;
  isChecking: boolean;
  lastChecked: number | null;
}

export interface UseServerStatusReturn extends ServerStatus {
  refresh: () => Promise<boolean>;
  isPollingEnabled: boolean;
}

interface UseServerStatusOptions {
  enabled?: boolean;
}

export function useServerStatus(options: UseServerStatusOptions = {}): UseServerStatusReturn {
  const { enabled = true } = options;
  const [isServerOnline, setIsServerOnline] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(enabled);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    const online = await checkServerHealth();
    setIsServerOnline(online);
    setLastChecked(Date.now());
    setIsChecking(false);
    return online;
  }, []);

  // Initial check and polling
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!enabled) {
      // When polling is disabled, assume offline (or could default to online)
      setIsServerOnline(false);
      setIsChecking(false);
      return;
    }

    // Check immediately on mount
    checkStatus();

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      checkStatus();
    }, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkStatus, enabled]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    if (!enabled) return false;
    return checkStatus();
  }, [checkStatus, enabled]);

  return {
    isServerOnline,
    isChecking,
    lastChecked,
    refresh,
    isPollingEnabled: enabled,
  };
}
