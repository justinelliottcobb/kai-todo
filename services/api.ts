import { Todo } from '@/types/todo';
import { API_BASE_URL, API_TIMEOUT } from '@/constants/api';

// Health check - ping the server to see if it's reachable
export async function checkServerHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout for health check

    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const todoApi = {
  async getAll(): Promise<Todo[]> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/todos`);
    if (!response.ok) {
      throw new ApiError('Failed to fetch todos', response.status);
    }
    return response.json();
  },

  async create(todo: Todo): Promise<Todo> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    });
    if (!response.ok) {
      throw new ApiError('Failed to create todo', response.status);
    }
    return response.json();
  },

  async update(todo: Todo): Promise<Todo> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    });
    if (!response.ok) {
      throw new ApiError('Failed to update todo', response.status);
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new ApiError('Failed to delete todo', response.status);
    }
  },

  async syncBatch(todos: Todo[]): Promise<Todo[]> {
    // For full sync, we replace all todos on server
    // First get existing, then reconcile
    const serverTodos = await this.getAll();
    const serverIds = new Set(serverTodos.map((t) => t.id));
    const localIds = new Set(todos.map((t) => t.id));

    const results: Todo[] = [];

    // Create or update local todos on server
    for (const todo of todos) {
      if (serverIds.has(todo.id)) {
        const serverTodo = serverTodos.find((t) => t.id === todo.id)!;
        // Use the more recently updated version
        if (todo.updatedAt > serverTodo.updatedAt) {
          results.push(await this.update(todo));
        } else {
          results.push(serverTodo);
        }
      } else {
        results.push(await this.create(todo));
      }
    }

    // Include server todos that don't exist locally (created on another device)
    for (const serverTodo of serverTodos) {
      if (!localIds.has(serverTodo.id)) {
        results.push(serverTodo);
      }
    }

    return results;
  },
};
