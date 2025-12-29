import { useCallback } from 'react';
import { Todo } from '@/types/todo';
import { generateId } from '@/utils/uuid';
import { addPendingDelete } from '@/services/sync';
import { MAX_TODO_COUNT } from '@/constants/app';

const MAX_TODO_LENGTH = 500;

export interface TodoValidationError {
  type: 'empty' | 'too_long' | 'whitespace_only' | 'limit_reached';
  message: string;
}

export interface UseTodoActionsOptions {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}

export interface UseTodoActionsReturn {
  addTodo: (text: string) => TodoValidationError | null;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, newText: string) => TodoValidationError | null;
  reorderTodos: (reorderedTodos: Todo[]) => void;
  validateTodoText: (text: string) => TodoValidationError | null;
}

/**
 * Validates todo text input.
 * @returns null if valid, or an error object if invalid
 */
export function validateTodoText(text: string): TodoValidationError | null {
  if (!text || text.length === 0) {
    return { type: 'empty', message: 'Todo text cannot be empty' };
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { type: 'whitespace_only', message: 'Todo text cannot be only whitespace' };
  }

  if (trimmed.length > MAX_TODO_LENGTH) {
    return { type: 'too_long', message: `Todo text cannot exceed ${MAX_TODO_LENGTH} characters` };
  }

  return null;
}

/**
 * Hook providing CRUD operations for todos with input validation.
 */
export function useTodoActions({ todos, setTodos }: UseTodoActionsOptions): UseTodoActionsReturn {
  const addTodo = useCallback((text: string): TodoValidationError | null => {
    // Check todo count limit
    if (MAX_TODO_COUNT > 0 && todos.length >= MAX_TODO_COUNT) {
      return { type: 'limit_reached', message: `Cannot add more than ${MAX_TODO_COUNT} todos` };
    }

    const trimmedText = text.trim();
    const validationError = validateTodoText(trimmedText);

    if (validationError) {
      return validationError;
    }

    const now = Date.now();
    setTodos((prevTodos) => {
      // Shift existing todos down (increment order) to make room at the top
      const shiftedTodos = prevTodos.map((todo) => ({
        ...todo,
        order: todo.order + 1,
      }));
      const newTodo: Todo = {
        id: generateId(),
        text: trimmedText,
        completed: false,
        createdAt: now,
        updatedAt: now,
        order: 0,
      };
      return [newTodo, ...shiftedTodos];
    });

    return null;
  }, [todos.length, setTodos]);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: Date.now() }
          : todo
      )
    );
  }, [setTodos]);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    // Track deletion for server sync
    addPendingDelete(id);
  }, [setTodos]);

  const editTodo = useCallback((id: string, newText: string): TodoValidationError | null => {
    const trimmedText = newText.trim();
    const validationError = validateTodoText(trimmedText);

    if (validationError) {
      return validationError;
    }

    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id
          ? { ...todo, text: trimmedText, updatedAt: Date.now() }
          : todo
      )
    );

    return null;
  }, [setTodos]);

  const reorderTodos = useCallback((reorderedTodos: Todo[]) => {
    // Only update the order field, not updatedAt, to avoid marking all as "changed"
    const todosWithNewOrder = reorderedTodos.map((todo, index) => ({
      ...todo,
      order: index,
    }));
    setTodos(todosWithNewOrder);
  }, [setTodos]);

  return {
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    reorderTodos,
    validateTodoText,
  };
}
