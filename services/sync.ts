import { Todo } from '@/types/todo';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { todoApi } from './api';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

// Get pending delete IDs from storage
function getPendingDeletes(): string[] {
  const stored = storage.getString(STORAGE_KEYS.PENDING_DELETES);
  return stored ? JSON.parse(stored) : [];
}

// Save pending delete IDs to storage
function savePendingDeletes(ids: string[]): void {
  storage.set(STORAGE_KEYS.PENDING_DELETES, JSON.stringify(ids));
}

// Add a todo ID to pending deletes (for offline delete tracking)
export function addPendingDelete(id: string): void {
  const pending = getPendingDeletes();
  if (!pending.includes(id)) {
    pending.push(id);
    savePendingDeletes(pending);
  }
}

// Clear pending deletes after successful sync
function clearPendingDeletes(): void {
  storage.delete(STORAGE_KEYS.PENDING_DELETES);
}

// Get last sync timestamp
export function getLastSyncTime(): number | null {
  const stored = storage.getString(STORAGE_KEYS.LAST_SYNC);
  return stored ? parseInt(stored, 10) : null;
}

// Save last sync timestamp
function saveLastSyncTime(time: number): void {
  storage.set(STORAGE_KEYS.LAST_SYNC, time.toString());
}

// Count pending changes (todos modified after last sync + pending deletes)
export function countPendingChanges(todos: Todo[]): number {
  const lastSync = getLastSyncTime();
  const pendingDeletes = getPendingDeletes();

  if (!lastSync) {
    // Never synced, all todos are pending
    return todos.length + pendingDeletes.length;
  }

  const modifiedTodos = todos.filter((todo) => todo.updatedAt > lastSync);
  return modifiedTodos.length + pendingDeletes.length;
}

// Sync todos with server
export async function syncTodos(
  localTodos: Todo[],
  onUpdate: (todos: Todo[]) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, process pending deletes on server
    const pendingDeletes = getPendingDeletes();
    for (const id of pendingDeletes) {
      try {
        await todoApi.delete(id);
      } catch {
        // Ignore 404 errors (already deleted on server)
      }
    }

    // Then sync remaining todos
    const syncedTodos = await todoApi.syncBatch(localTodos);

    // Filter out any todos that were pending delete
    const finalTodos = syncedTodos.filter((t) => !pendingDeletes.includes(t.id));

    // Update local state with synced todos
    onUpdate(finalTodos);

    // Clear pending deletes and update sync time
    clearPendingDeletes();
    saveLastSyncTime(Date.now());

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';
    return { success: false, error: message };
  }
}
