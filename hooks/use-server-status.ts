import { useState, useEffect, useCallback, useRef } from 'react';
import { checkServerHealth } from '@/services/api';
import { useNetworkStatus } from './use-network-status';

const POLL_INTERVAL = 15000; // Poll every 15 seconds

export interface ServerStatus {
  isServerOnline: boolean;
  lastChecked: number | null;
}

export interface UseServerStatusReturn extends ServerStatus {
  refresh: () => Promise<boolean>;
  isPollingEnabled: boolean;
  isDeviceOnline: boolean;
}

interface UseServerStatusOptions {
  enabled?: boolean;
}

export function useServerStatus(options: UseServerStatusOptions = {}): UseServerStatusReturn {
  const { enabled = true } = options;
  const { isOnline: isDeviceOnline } = useNetworkStatus();
  const [isServerOnline, setIsServerOnline] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkStatus = useCallback(async () => {
    // Don't attempt to check server if device is offline
    if (!isDeviceOnline) {
      setIsServerOnline(false);
      return false;
    }

    const online = await checkServerHealth();
    setIsServerOnline(online);
    setLastChecked(Date.now());
    return online;
  }, [isDeviceOnline]);

  // When device goes offline, immediately mark server as offline
  useEffect(() => {
    if (!isDeviceOnline) {
      setIsServerOnline(false);
    }
  }, [isDeviceOnline]);

  // Initial check and polling
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!enabled || !isDeviceOnline) {
      // When polling is disabled or device is offline, mark server as offline
      setIsServerOnline(false);
      return;
    }

    // Check immediately on mount or when device comes online
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
  }, [checkStatus, enabled, isDeviceOnline]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    if (!enabled || !isDeviceOnline) return false;
    return checkStatus();
  }, [checkStatus, enabled, isDeviceOnline]);

  return {
    isServerOnline,
    lastChecked,
    refresh,
    isPollingEnabled: enabled,
    isDeviceOnline,
  };
}
