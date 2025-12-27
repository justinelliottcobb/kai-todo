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
    updatedAt: Date.now(),
    order: 0,
  };

  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders todo text correctly', () => {
    const { getByText } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(getByText('Test Todo')).toBeTruthy();
  });

  it('calls onToggle when checkbox is pressed', () => {
    const { getByRole } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const checkbox = getByRole('checkbox');
    fireEvent.press(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith('1');
  });

  it('calls onDelete when delete button is pressed', () => {
    const { getByText } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
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
        onEdit={mockOnEdit}
      />
    );

    const todoText = getByText('Test Todo');
    expect(todoText.props.style).toMatchObject(
      expect.arrayContaining([
        expect.objectContaining({ textDecorationLine: 'line-through' }),
      ])
    );
  });

  it('enters edit mode when edit button is pressed', () => {
    const { getByText, getByDisplayValue } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const editButton = getByText('✏️');
    fireEvent.press(editButton);

    expect(getByDisplayValue('Test Todo')).toBeTruthy();
  });

  it('calls onEdit with new text when editing is complete', () => {
    const { getByText, getByDisplayValue } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const editButton = getByText('✏️');
    fireEvent.press(editButton);

    const input = getByDisplayValue('Test Todo');
    fireEvent.changeText(input, 'Updated Todo');
    fireEvent(input, 'submitEditing');

    expect(mockOnEdit).toHaveBeenCalledWith('1', 'Updated Todo');
  });

  it('cancels editing when cancel button is pressed', () => {
    const { getByText, queryByDisplayValue } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const editButton = getByText('✏️');
    fireEvent.press(editButton);

    const cancelButton = getByText('✕');
    fireEvent.press(cancelButton);

    expect(queryByDisplayValue('Test Todo')).toBeNull();
    expect(mockOnEdit).not.toHaveBeenCalled();
  });
});
