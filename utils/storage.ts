import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'kai-todo-storage',
});

export const STORAGE_KEYS = {
  TODOS: 'todos',
  PENDING_DELETES: 'pending_deletes',
  LAST_SYNC: 'last_sync',
  SETTINGS: 'settings',
} as const;
