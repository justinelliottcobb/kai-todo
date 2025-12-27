import { useState, useCallback, useEffect, useRef } from 'react';
import { Todo } from '@/types/todo';
import { useNetworkStatus } from './use-network-status';
import { useSyncTime } from './use-todo-storage';
import {
  syncTodos,
  countPendingChanges,
  SyncStatus,
} from '@/services/sync';

export interface UseTodoSyncOptions {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  autoSyncOnReconnect?: boolean;
}

export interface UseTodoSyncReturn {
  syncStatus: SyncStatus;
  lastSyncTime: number | null;
  syncError: string | null;
  pendingChanges: number;
  isOnline: boolean;
  performSync: () => Promise<void>;
  isSyncing: boolean;
}

/**
 * Hook for managing todo synchronization with the server.
 * Uses a ref-based approach to avoid stale closure issues during async operations.
 */
export function useTodoSync({
  todos,
  setTodos,
  autoSyncOnReconnect = true,
}: UseTodoSyncOptions): UseTodoSyncReturn {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const { isOnline } = useNetworkStatus();
  const { lastSyncTime, setLastSyncTime } = useSyncTime();

  // Use ref to always have access to current todos during async sync
  const todosRef = useRef(todos);
  todosRef.current = todos;

  // Use ref for setTodos to keep performSync stable
  const setTodosRef = useRef(setTodos);
  setTodosRef.current = setTodos;

  // Track if sync is in progress to prevent concurrent syncs
  const isSyncingRef = useRef(false);

  const performSync = useCallback(async () => {
    if (!isOnline) {
      setSyncStatus('offline');
      return;
    }

    if (isSyncingRef.current) {
      return; // Prevent concurrent syncs
    }

    isSyncingRef.current = true;
    setSyncStatus('syncing');
    setSyncError(null);

    try {
      // Use ref to get current todos, avoiding stale closure
      const currentTodos = todosRef.current;

      const result = await syncTodos(currentTodos, (syncedTodos) => {
        setTodosRef.current(syncedTodos);
      });

      if (result.success) {
        setSyncStatus('idle');
        setLastSyncTime(Date.now());
        setSyncError(null);
      } else {
        setSyncStatus('error');
        setSyncError(result.error || 'Sync failed');
      }
    } catch (error) {
      setSyncStatus('error');
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      isSyncingRef.current = false;
    }
  }, [isOnline, setLastSyncTime]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (autoSyncOnReconnect && isOnline && syncStatus === 'offline') {
      performSync();
    }
  }, [isOnline, syncStatus, performSync, autoSyncOnReconnect]);

  // Update status when going offline
  useEffect(() => {
    if (!isOnline && syncStatus === 'idle') {
      setSyncStatus('offline');
    }
  }, [isOnline, syncStatus]);

  const pendingChanges = countPendingChanges(todos);

  return {
    syncStatus,
    lastSyncTime,
    syncError,
    pendingChanges,
    isOnline,
    performSync,
    isSyncing: syncStatus === 'syncing',
  };
}
