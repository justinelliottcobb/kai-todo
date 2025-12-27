import { useState, useEffect, useRef, useCallback } from 'react';
import { Todo } from '@/types/todo';
import { storage, STORAGE_KEYS } from '@/utils/storage';

export interface UseTodoStorageReturn {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  isLoaded: boolean;
  loadError: Error | null;
}

/**
 * Hook for managing todo persistence with MMKV storage.
 * Handles loading from and saving to local storage.
 */
export function useTodoStorage(): UseTodoStorageReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const isInitializedRef = useRef(false);

  // Load todos from storage on mount
  useEffect(() => {
    try {
      const storedTodos = storage.getString(STORAGE_KEYS.TODOS);
      if (storedTodos) {
        const parsed = JSON.parse(storedTodos) as Todo[];
        setTodos(parsed);
      }
      setIsLoaded(true);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to load todos');
      setLoadError(err);
      console.error('Failed to load todos:', error);
      setIsLoaded(true);
    }
    isInitializedRef.current = true;
  }, []);

  // Save todos to storage whenever they change (skip initial mount)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    try {
      storage.set(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  }, [todos]);

  return {
    todos,
    setTodos,
    isLoaded,
    loadError,
  };
}

/**
 * Hook for managing last sync time persistence.
 */
export interface UseSyncTimeReturn {
  lastSyncTime: number | null;
  setLastSyncTime: (time: number) => void;
}

export function useSyncTime(): UseSyncTimeReturn {
  const [lastSyncTime, setLastSyncTimeState] = useState<number | null>(null);

  // Load last sync time on mount
  useEffect(() => {
    try {
      const stored = storage.getString(STORAGE_KEYS.LAST_SYNC);
      if (stored) {
        setLastSyncTimeState(parseInt(stored, 10));
      }
    } catch (error) {
      console.error('Failed to load last sync time:', error);
    }
  }, []);

  const setLastSyncTime = useCallback((time: number) => {
    setLastSyncTimeState(time);
    try {
      storage.set(STORAGE_KEYS.LAST_SYNC, time.toString());
    } catch (error) {
      console.error('Failed to save last sync time:', error);
    }
  }, []);

  return {
    lastSyncTime,
    setLastSyncTime,
  };
}
