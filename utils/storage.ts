import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'kai-todo-storage',
});

export const STORAGE_KEYS = {
  TODOS: 'todos',
} as const;
