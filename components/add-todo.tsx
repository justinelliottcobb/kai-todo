import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  Keyboard,
  Alert,
  Platform,
} from 'react-native';
import { TodoValidationError } from '@/hooks/use-todos';

interface AddTodoProps {
  onAdd: (text: string) => TodoValidationError | null;
}

export function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleAdd = () => {
    setError(null);
    const validationError = onAdd(text);

    if (validationError) {
      if (Platform.OS === 'web') {
        setError(validationError.message);
      } else {
        Alert.alert('Invalid Todo', validationError.message);
      }
      return;
    }

    setText('');
    Keyboard.dismiss();
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (error) setError(null);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TextInput
          style={[
            styles.input,
            isDark ? styles.inputDark : styles.inputLight,
            error && styles.inputError,
          ]}
          placeholder="Add a new todo..."
          placeholderTextColor={isDark ? '#999' : '#666'}
          value={text}
          onChangeText={handleTextChange}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          accessibilityLabel="New todo input"
        />
        <TouchableOpacity
          style={[
            styles.button,
            !text.trim() && styles.buttonDisabled,
          ]}
          onPress={handleAdd}
          disabled={!text.trim()}
          accessibilityRole="button"
          accessibilityLabel="Add todo"
        >
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
      {error && Platform.OS === 'web' && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  inputLight: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    color: '#000',
  },
  inputDark: {
    backgroundColor: '#2c2c2c',
    borderColor: '#444',
    color: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
