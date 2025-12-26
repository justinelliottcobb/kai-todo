import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Todo } from '@/types/todo';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { TodoItem } from '@/components/todo-item';
import { AddTodo } from '@/components/add-todo';

export default function HomeScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Load todos from storage on mount
  useEffect(() => {
    const loadTodos = () => {
      try {
        const storedTodos = storage.getString(STORAGE_KEYS.TODOS);
        if (storedTodos) {
          setTodos(JSON.parse(storedTodos));
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
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos((prevTodos) => [newTodo, ...prevTodos]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  }, []);

  const activeTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>
          Kai Todo
        </Text>
        <Text style={[styles.stats, isDark ? styles.statsDark : styles.statsLight]}>
          {activeTodos.length} active • {completedTodos.length} completed
        </Text>
      </View>

      <View style={styles.content}>
        <AddTodo onAdd={addTodo} />

        {todos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isDark ? styles.emptyTextDark : styles.emptyTextLight]}>
              No todos yet! Add one to get started.
            </Text>
          </View>
        ) : (
          <FlatList
            data={todos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TodoItem
                todo={item}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#1c1c1c',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  titleLight: {
    color: '#000',
  },
  titleDark: {
    color: '#fff',
  },
  stats: {
    fontSize: 14,
  },
  statsLight: {
    color: '#666',
  },
  statsDark: {
    color: '#999',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyTextLight: {
    color: '#999',
  },
  emptyTextDark: {
    color: '#666',
  },
});
