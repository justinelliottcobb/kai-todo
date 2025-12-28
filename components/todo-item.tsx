import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useColorScheme } from '@/contexts/settings-context';
import { Todo } from '@/types/todo';
import { TodoValidationError } from '@/hooks/use-todos';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => TodoValidationError | null;
  onDrag?: () => void;
  isActive?: boolean;
  // Web-specific props for reordering
  showOrderButtons?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  onDrag,
  isActive,
  showOrderButtons = false,
  canMoveUp = false,
  canMoveDown = false,
  onMoveUp,
  onMoveDown,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editError, setEditError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const wasUpdated = todo.updatedAt && todo.updatedAt !== todo.createdAt;
  const displayTimestamp = wasUpdated ? todo.updatedAt : todo.createdAt;
  const timestampLabel = wasUpdated ? 'Updated' : 'Created';

  const handleSaveEdit = () => {
    if (editText.trim() === todo.text) {
      setIsEditing(false);
      return;
    }

    const validationError = onEdit(todo.id, editText);

    if (validationError) {
      if (Platform.OS === 'web') {
        setEditError(validationError.message);
      } else {
        Alert.alert('Invalid Todo', validationError.message);
      }
      return;
    }

    setEditError(null);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(todo.text);
    setEditError(null);
    setIsEditing(false);
  };

  const handleEditTextChange = (text: string) => {
    setEditText(text);
    if (editError) setEditError(null);
  };

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
        isActive && styles.containerActive,
      ]}
    >
      {showOrderButtons ? (
        <View style={styles.orderButtons}>
          <TouchableOpacity
            style={[styles.orderButton, !canMoveUp && styles.orderButtonDisabled]}
            onPress={onMoveUp}
            disabled={!canMoveUp}
            accessibilityLabel="Move up"
          >
            <Text style={styles.orderButtonText}>▲</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.orderButton, !canMoveDown && styles.orderButtonDisabled]}
            onPress={onMoveDown}
            disabled={!canMoveDown}
            accessibilityLabel="Move down"
          >
            <Text style={styles.orderButtonText}>▼</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Pressable
          style={styles.dragHandle}
          onLongPress={onDrag}
          delayLongPress={200}
        >
          <Text style={styles.dragIcon}>☰</Text>
        </Pressable>
      )}

      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggle(todo.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: todo.completed }}
        accessibilityLabel={`Mark ${todo.text} as ${todo.completed ? 'incomplete' : 'complete'}`}
      >
        <View
          style={[
            styles.checkboxInner,
            todo.completed && styles.checkboxChecked,
          ]}
        >
          {todo.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={[
              styles.input,
              isDark ? styles.inputDark : styles.inputLight,
              editError && styles.inputError,
            ]}
            value={editText}
            onChangeText={handleEditTextChange}
            onSubmitEditing={handleSaveEdit}
            onBlur={handleSaveEdit}
            autoFocus
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCancelEdit}
            accessibilityRole="button"
            accessibilityLabel="Cancel editing"
          >
            <Text style={styles.actionText}>✕</Text>
          </TouchableOpacity>
          {editError && Platform.OS === 'web' && (
            <Text style={styles.errorText}>{editError}</Text>
          )}
        </View>
      ) : (
        <>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.text,
                todo.completed && styles.textCompleted,
                isDark ? styles.textDark : styles.textLight,
              ]}
            >
              {todo.text}
            </Text>
            <Text style={[styles.timestamp, isDark ? styles.timestampDark : styles.timestampLight]}>
              {timestampLabel} {formatTimestamp(displayTimestamp)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsEditing(true)}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${todo.text}`}
          >
            <Text style={styles.actionText}>✏️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(todo.id)}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${todo.text}`}
          >
            <Text style={styles.actionText}>🗑️</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 4,
    gap: 12,
  },
  containerLight: {
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#2c2c2c',
  },
  containerActive: {
    opacity: 0.8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  dragHandle: {
    padding: 4,
  },
  dragIcon: {
    fontSize: 20,
    color: '#999',
  },
  orderButtons: {
    flexDirection: 'column',
    gap: 4,
  },
  orderButton: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderButtonDisabled: {
    opacity: 0.3,
  },
  orderButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  checkbox: {
    padding: 4,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 16,
  },
  textLight: {
    color: '#000',
  },
  textDark: {
    color: '#fff',
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
  },
  timestampLight: {
    color: '#999',
  },
  timestampDark: {
    color: '#666',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  inputLight: {
    backgroundColor: '#fff',
    borderColor: '#007AFF',
    color: '#000',
  },
  inputDark: {
    backgroundColor: '#1c1c1c',
    borderColor: '#007AFF',
    color: '#fff',
  },
  actionButton: {
    padding: 4,
  },
  actionText: {
    fontSize: 20,
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    width: '100%',
  },
});
