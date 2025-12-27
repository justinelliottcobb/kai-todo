import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AddTodo } from '@/components/add-todo';

describe('AddTodo', () => {
  const mockOnAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // By default, mock returns null (success)
    mockOnAdd.mockReturnValue(null);
  });

  it('renders input and button', () => {
    const { getByPlaceholderText, getByText } = render(
      <AddTodo onAdd={mockOnAdd} />
    );

    expect(getByPlaceholderText('Add a new todo...')).toBeTruthy();
    expect(getByText('Add')).toBeTruthy();
  });

  it('calls onAdd with text when button is pressed', () => {
    const { getByPlaceholderText, getByText } = render(
      <AddTodo onAdd={mockOnAdd} />
    );

    const input = getByPlaceholderText('Add a new todo...');
    const button = getByText('Add');

    fireEvent.changeText(input, 'New Todo');
    fireEvent.press(button);

    expect(mockOnAdd).toHaveBeenCalledWith('New Todo');
  });

  it('clears input after adding todo successfully', () => {
    const { getByPlaceholderText, getByText } = render(
      <AddTodo onAdd={mockOnAdd} />
    );

    const input = getByPlaceholderText('Add a new todo...');
    const button = getByText('Add');

    fireEvent.changeText(input, 'New Todo');
    fireEvent.press(button);

    expect(input.props.value).toBe('');
  });

  it('does not clear input when validation fails', () => {
    mockOnAdd.mockReturnValue({ type: 'empty', message: 'Todo text cannot be empty' });

    const { getByPlaceholderText, getByText } = render(
      <AddTodo onAdd={mockOnAdd} />
    );

    const input = getByPlaceholderText('Add a new todo...');
    const button = getByText('Add');

    fireEvent.changeText(input, 'Test');
    fireEvent.press(button);

    // Input should retain its value when validation fails
    expect(input.props.value).toBe('Test');
  });

  it('does not call onAdd with empty text (button disabled)', () => {
    const { getByPlaceholderText, getByText } = render(
      <AddTodo onAdd={mockOnAdd} />
    );

    const input = getByPlaceholderText('Add a new todo...');
    const button = getByText('Add');

    fireEvent.changeText(input, '   ');
    fireEvent.press(button);

    // Button is disabled when text is empty/whitespace
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('calls onAdd when return key is pressed', () => {
    const { getByPlaceholderText } = render(<AddTodo onAdd={mockOnAdd} />);

    const input = getByPlaceholderText('Add a new todo...');

    fireEvent.changeText(input, 'New Todo');
    fireEvent(input, 'submitEditing');

    expect(mockOnAdd).toHaveBeenCalledWith('New Todo');
  });
});
