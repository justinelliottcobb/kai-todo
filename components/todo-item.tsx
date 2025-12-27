import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  TextInput,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Todo } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  onDrag?: () => void;
  isActive?: boolean;
  // Web-specific props for reordering
  showOrderButtons?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Debug: Log order button state
  console.log('TodoItem:', { id: todo.id, showOrderButtons, canMoveUp, canMoveDown });

  const handleSaveEdit = () => {
    const trimmedText = editText.trim();
    if (trimmedText && trimmedText !== todo.text) {
      onEdit(todo.id, trimmedText);
    } else {
      setEditText(todo.text);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(todo.text);
    setIsEditing(false);
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
        <>
          <TextInput
            style={[
              styles.input,
              isDark ? styles.inputDark : styles.inputLight,
            ]}
            value={editText}
            onChangeText={setEditText}
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
        </>
      ) : (
        <>
          <Text
            style={[
              styles.text,
              todo.completed && styles.textCompleted,
              isDark ? styles.textDark : styles.textLight,
            ]}
          >
            {todo.text}
          </Text>

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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
  text: {
    flex: 1,
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
});
