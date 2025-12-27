import { useState, useEffect, useCallback } from 'react';
import { Todo } from '@/types/todo';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { useNetworkStatus } from './use-network-status';
import {
  syncTodos,
  countPendingChanges,
  addPendingDelete,
  SyncStatus,
} from '@/services/sync';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { isOnline } = useNetworkStatus();

  // Load todos from storage on mount
  useEffect(() => {
    const loadTodos = () => {
      try {
        const storedTodos = storage.getString(STORAGE_KEYS.TODOS);
        if (storedTodos) {
          setTodos(JSON.parse(storedTodos));
        }
        // Load last sync time
        const lastSync = storage.getString(STORAGE_KEYS.LAST_SYNC);
        if (lastSync) {
          setLastSyncTime(parseInt(lastSync, 10));
        }
      } catch (error) {
        console.error('Failed to load todos:', error);
      }
    };
    loadTodos();
  }, []);

  // Save todos to storage whenever they change
  useEffect(() => {
    try {
      storage.set(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  }, [todos]);

  const addTodo = useCallback((text: string) => {
    const now = Date.now();
    setTodos((prevTodos) => {
      const newTodo: Todo = {
        id: now.toString(),
        text,
        completed: false,
        createdAt: now,
        updatedAt: now,
        order: prevTodos.length > 0 ? Math.max(...prevTodos.map(t => t.order)) + 1 : 0,
      };
      return [newTodo, ...prevTodos];
    });
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: Date.now() } : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    // Track deletion for server sync when online
    addPendingDelete(id);
  }, []);

  const editTodo = useCallback((id: string, newText: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, text: newText, updatedAt: Date.now() } : todo
      )
    );
  }, []);

  const reorderTodos = useCallback((reorderedTodos: Todo[]) => {
    const todosWithNewOrder = reorderedTodos.map((todo, index) => ({
      ...todo,
      order: index,
      updatedAt: Date.now(),
    }));
    setTodos(todosWithNewOrder);
  }, []);

  // Manual sync function
  const performSync = useCallback(async () => {
    if (!isOnline) {
      setSyncStatus('offline');
      return;
    }

    setSyncStatus('syncing');
    setSyncError(null);

    const result = await syncTodos(todos, (syncedTodos) => {
      setTodos(syncedTodos);
    });

    if (result.success) {
      setSyncStatus('idle');
      setLastSyncTime(Date.now());
      setSyncError(null);
    } else {
      setSyncStatus('error');
      setSyncError(result.error || 'Sync failed');
    }
  }, [todos, isOnline]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && syncStatus === 'offline') {
      performSync();
    }
  }, [isOnline, syncStatus, performSync]);

  const pendingChanges = countPendingChanges(todos);
  const sortedTodos = [...todos].sort((a, b) => a.order - b.order);
  const activeTodos = sortedTodos.filter((todo) => !todo.completed);
  const completedTodos = sortedTodos.filter((todo) => todo.completed);

  return {
    todos: sortedTodos,
    activeTodos,
    completedTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    reorderTodos,
    // Sync-related
    syncStatus,
    lastSyncTime,
    syncError,
    pendingChanges,
    isOnline,
    performSync,
  };
}
