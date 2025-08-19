import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with the provided value', () => {
    render(<SearchBar value='test value' onChange={mockOnChange} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test value');
  });

  it('renders with placeholder when provided', () => {
    render(<SearchBar value='' onChange={mockOnChange} placeholder='Search devices...' />);

    const input = screen.getByPlaceholderText('Search devices...');
    expect(input).toBeInTheDocument();
  });

  it('renders without placeholder when not provided', () => {
    render(<SearchBar value='' onChange={mockOnChange} />);

    const input = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('placeholder');
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    render(<SearchBar value='' onChange={mockOnChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'new text');

    expect(mockOnChange).toHaveBeenCalledTimes(8); // Called once for each character
    expect(mockOnChange).toHaveBeenNthCalledWith(1, 'n');
    expect(mockOnChange).toHaveBeenNthCalledWith(2, 'e');
    expect(mockOnChange).toHaveBeenNthCalledWith(3, 'w');
    expect(mockOnChange).toHaveBeenNthCalledWith(4, ' ');
    expect(mockOnChange).toHaveBeenNthCalledWith(5, 't');
    expect(mockOnChange).toHaveBeenNthCalledWith(6, 'e');
    expect(mockOnChange).toHaveBeenNthCalledWith(7, 'x');
    expect(mockOnChange).toHaveBeenNthCalledWith(8, 't');
  });

  it('calls onChange with empty string when input is cleared', async () => {
    const user = userEvent.setup();
    render(<SearchBar value='initial' onChange={mockOnChange} />);

    const input = screen.getByRole('textbox');
    await user.clear(input);

    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('renders search icon', () => {
    render(<SearchBar value='' onChange={mockOnChange} />);

    // Find the icon container
    const iconContainer = screen.getByRole('textbox').previousElementSibling;
    expect(iconContainer).toHaveClass(
      'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'
    );

    // Verify the SVG exists within the container
    const svg = iconContainer?.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('h-5 w-5 text-gray-400');
  });

  it('applies correct CSS classes', () => {
    render(<SearchBar value='' onChange={mockOnChange} />);

    const container = screen.getByRole('textbox').parentElement;
    expect(container).toHaveClass('mt-4 relative');

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(
      'w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
    );
  });

  it('handles paste events correctly', async () => {
    const user = userEvent.setup();
    render(<SearchBar value='' onChange={mockOnChange} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.paste('pasted text');

    expect(mockOnChange).toHaveBeenCalledWith('pasted text');
  });

  it('maintains focus after value change', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SearchBar value='' onChange={mockOnChange} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    expect(input).toHaveFocus();

    // Simulate parent component updating the value
    rerender(<SearchBar value='updated' onChange={mockOnChange} />);
    expect(input).toHaveFocus();
  });

  it('handles rapid typing correctly', async () => {
    const user = userEvent.setup({ delay: null }); // Remove delay for rapid typing
    render(<SearchBar value='' onChange={mockOnChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'rapid');

    expect(mockOnChange).toHaveBeenCalledTimes(5);
    expect(mockOnChange).toHaveBeenLastCalledWith('d');
  });

  it('is accessible with proper ARIA attributes', () => {
    render(<SearchBar value='' onChange={mockOnChange} placeholder='Search' />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toBeEnabled();
  });

  it('handles special characters correctly', () => {
    render(<SearchBar value='' onChange={mockOnChange} />);

    const input = screen.getByRole('textbox');
    const specialChars = '!@#$%^&*()_+-=[]{}|;:"<>,.?/~`';

    // Use fireEvent.change to set the value directly
    fireEvent.change(input, { target: { value: specialChars } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(specialChars);
  });

  it('handles keyboard shortcuts without interfering', async () => {
    const user = userEvent.setup();
    render(<SearchBar value='test' onChange={mockOnChange} />);

    const input = screen.getByRole('textbox');
    await user.click(input);

    // Test Ctrl+A (select all) - should not trigger onChange
    await user.keyboard('{Control>}a{/Control}');
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
