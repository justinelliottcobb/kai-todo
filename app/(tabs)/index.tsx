import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Platform,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useColorScheme , useSettings } from '@/contexts/settings-context';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TodoItem } from '@/components/todo-item';
import { AddTodo } from '@/components/add-todo';
import { SyncStatus } from '@/components/sync-status';
import { ServerStatusIndicator } from '@/components/server-status-indicator';
import { SyncNotification } from '@/components/sync-notification';
import { useTodos } from '@/hooks/use-todos';
import { useServerStatus } from '@/hooks/use-server-status';
import { Todo } from '@/types/todo';

export default function HomeScreen() {
  const {
    todos,
    activeTodos,
    completedTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    reorderTodos,
    syncStatus,
    lastSyncTime,
    syncError,
    pendingChanges,
    isOnline,
    performSync,
  } = useTodos();
  const { settings } = useSettings();
  const { isServerOnline, isChecking, refresh: refreshServerStatus } = useServerStatus({
    enabled: settings.enableServerPolling,
  });
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Sync notification state
  const [showSyncNotification, setShowSyncNotification] = useState(false);
  const [syncNotificationMessage, setSyncNotificationMessage] = useState('');
  const [syncNotificationType, setSyncNotificationType] = useState<'success' | 'error'>('success');

  // Track previous sync status for auto-sync notification
  const prevSyncStatusRef = useRef(syncStatus);
  const prevPendingChangesRef = useRef(pendingChanges);

  // Auto-sync when in automatic mode and there are pending changes
  useEffect(() => {
    if (
      settings.syncMode === 'automatic' &&
      isOnline &&
      isServerOnline &&
      pendingChanges > 0 &&
      syncStatus === 'idle'
    ) {
      performSync();
    }
  }, [settings.syncMode, isOnline, isServerOnline, pendingChanges, syncStatus, performSync]);

  // Show notification when sync completes in automatic mode
  useEffect(() => {
    if (settings.syncMode === 'automatic') {
      // Sync just completed successfully
      if (
        prevSyncStatusRef.current === 'syncing' &&
        syncStatus === 'idle' &&
        prevPendingChangesRef.current > 0
      ) {
        setSyncNotificationMessage('Synced with server');
        setSyncNotificationType('success');
        setShowSyncNotification(true);
      }
      // Sync failed
      if (prevSyncStatusRef.current === 'syncing' && syncStatus === 'error') {
        setSyncNotificationMessage('Sync failed');
        setSyncNotificationType('error');
        setShowSyncNotification(true);
      }
    }
    prevSyncStatusRef.current = syncStatus;
    prevPendingChangesRef.current = pendingChanges;
  }, [syncStatus, settings.syncMode, pendingChanges]);

  const moveItemUp = (index: number) => {
    if (index === 0) return;
    const newTodos = [...todos];
    [newTodos[index - 1], newTodos[index]] = [newTodos[index], newTodos[index - 1]];
    reorderTodos(newTodos);
  };

  const moveItemDown = (index: number) => {
    if (index === todos.length - 1) return;
    const newTodos = [...todos];
    [newTodos[index], newTodos[index + 1]] = [newTodos[index + 1], newTodos[index]];
    reorderTodos(newTodos);
  };
  const renderItem = ({ item, drag, isActive }: RenderItemParams<Todo>) => {
    const index = todos.findIndex(t => t.id === item.id);
    return (
      <TodoItem
        todo={item}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onEdit={editTodo}
        onDrag={drag}
        isActive={isActive}
        // Web-specific props
        showOrderButtons={Platform.OS === 'web'}
        canMoveUp={index > 0}
        canMoveDown={index < todos.length - 1}
        onMoveUp={() => moveItemUp(index)}
        onMoveDown={() => moveItemDown(index)}
      />
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      >
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>
              Kai Todo
            </Text>
            <ServerStatusIndicator
              isServerOnline={isServerOnline}
              isChecking={isChecking}
              onPress={refreshServerStatus}
            />
          </View>
          <Text style={[styles.stats, isDark ? styles.statsDark : styles.statsLight]}>
            {activeTodos.length} active • {completedTodos.length} completed
          </Text>
        </View>

        {/* Sync notification for automatic mode */}
        {showSyncNotification && (
          <SyncNotification
            visible={showSyncNotification}
            message={syncNotificationMessage}
            type={syncNotificationType}
            onHide={() => setShowSyncNotification(false)}
          />
        )}

        <View style={styles.syncContainer}>
          <SyncStatus
            syncStatus={syncStatus}
            lastSyncTime={lastSyncTime}
            pendingChanges={pendingChanges}
            syncError={syncError}
            isOnline={isOnline}
            isServerOnline={isServerOnline}
            syncMode={settings.syncMode}
            onSync={performSync}
          />
        </View>

        <View style={styles.addTodoContainer}>
          <AddTodo onAdd={addTodo} />
        </View>

        {todos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isDark ? styles.emptyTextDark : styles.emptyTextLight]}>
              No todos yet! Add one to get started.
            </Text>
          </View>
        ) : Platform.OS === 'web' ? (
          <FlatList
            data={todos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const index = todos.findIndex(t => t.id === item.id);
              return (
                <TodoItem
                  todo={item}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onEdit={editTodo}
                  showOrderButtons={true}
                  canMoveUp={index > 0}
                  canMoveDown={index < todos.length - 1}
                  onMoveUp={() => moveItemUp(index)}
                  onMoveDown={() => moveItemDown(index)}
                />
              );
            }}
            showsVerticalScrollIndicator={false}
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <DraggableFlatList
            data={todos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            onDragEnd={({ data }) => reorderTodos(data)}
            showsVerticalScrollIndicator={false}
            containerStyle={styles.listContainer}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
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
    paddingTop: 40,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  syncContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  addTodoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  listContainer: {
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
