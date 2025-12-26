import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TodoItem } from '@/components/todo-item';
import { Todo } from '@/types/todo';

describe('TodoItem', () => {
  const mockTodo: Todo = {
    id: '1',
    text: 'Test Todo',
    completed: false,
    createdAt: Date.now(),
  };

  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders todo text correctly', () => {
    const { getByText } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    expect(getByText('Test Todo')).toBeTruthy();
  });

  it('calls onToggle when checkbox is pressed', () => {
    const { getByA11yRole } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const checkbox = getByA11yRole('checkbox');
    fireEvent.press(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith('1');
  });

  it('calls onDelete when delete button is pressed', () => {
    const { getByText } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = getByText('🗑️');
    fireEvent.press(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('displays completed todo with line-through style', () => {
    const completedTodo: Todo = {
      ...mockTodo,
      completed: true,
    };

    const { getByText } = render(
      <TodoItem
        todo={completedTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const todoText = getByText('Test Todo');
    expect(todoText.props.style).toMatchObject(
      expect.arrayContaining([
        expect.objectContaining({ textDecorationLine: 'line-through' }),
      ])
    );
  });
});
