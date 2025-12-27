import { useMemo } from 'react';
import { Todo } from '@/types/todo';
import { SyncStatus } from '@/services/sync';
import { useTodoStorage } from './use-todo-storage';
import { useTodoSync } from './use-todo-sync';
import { useTodoActions, TodoValidationError } from './use-todo-actions';

export interface UseTodosReturn {
  // Todo data
  todos: Todo[];
  activeTodos: Todo[];
  completedTodos: Todo[];

  // CRUD operations (return validation error or null)
  addTodo: (text: string) => TodoValidationError | null;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, newText: string) => TodoValidationError | null;
  reorderTodos: (reorderedTodos: Todo[]) => void;

  // Sync-related
  syncStatus: SyncStatus;
  lastSyncTime: number | null;
  syncError: string | null;
  pendingChanges: number;
  isOnline: boolean;
  performSync: () => Promise<void>;
  isSyncing: boolean;

  // Loading state
  isLoaded: boolean;
  loadError: Error | null;
}

/**
 * Main hook for managing todos.
 * Composes storage, sync, and action hooks for a complete todo management solution.
 *
 * @example
 * ```tsx
 * function TodoApp() {
 *   const {
 *     todos,
 *     activeTodos,
 *     addTodo,
 *     toggleTodo,
 *     syncStatus,
 *     performSync,
 *   } = useTodos();
 *
 *   const handleAddTodo = (text: string) => {
 *     const error = addTodo(text);
 *     if (error) {
 *       alert(error.message);
 *     }
 *   };
 *
 *   return (
 *     // ... render todos
 *   );
 * }
 * ```
 */
export function useTodos(): UseTodosReturn {
  // Storage hook manages persistence
  const { todos, setTodos, isLoaded, loadError } = useTodoStorage();

  // Actions hook provides CRUD operations with validation
  const {
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    reorderTodos,
  } = useTodoActions({ setTodos });

  // Sync hook manages server synchronization
  const {
    syncStatus,
    lastSyncTime,
    syncError,
    pendingChanges,
    isOnline,
    performSync,
    isSyncing,
  } = useTodoSync({ todos, setTodos });

  // Derived state with memoization
  const sortedTodos = useMemo(
    () => [...todos].sort((a, b) => a.order - b.order),
    [todos]
  );

  const activeTodos = useMemo(
    () => sortedTodos.filter((todo) => !todo.completed),
    [sortedTodos]
  );

  const completedTodos = useMemo(
    () => sortedTodos.filter((todo) => todo.completed),
    [sortedTodos]
  );

  return {
    // Todo data
    todos: sortedTodos,
    activeTodos,
    completedTodos,

    // CRUD operations
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
    isSyncing,

    // Loading state
    isLoaded,
    loadError,
  };
}

// Re-export types for convenience
export type { TodoValidationError } from './use-todo-actions';
export { validateTodoText } from './use-todo-actions';
