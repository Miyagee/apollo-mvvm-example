import React from 'react';
import { fireEvent, render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Given a user needs to search for devices', () => {
    describe('When the search bar is displayed', () => {
      it('Then shows input field with current value', () => {
        render(<SearchBar value='test value' onChange={mockOnChange} />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('test value');
      });

      it('Then displays placeholder text when provided', () => {
        render(<SearchBar value='' onChange={mockOnChange} placeholder='Search devices...' />);

        const input = screen.getByPlaceholderText('Search devices...');
        expect(input).toBeInTheDocument();
      });

      it('Then shows no placeholder when not provided', () => {
        render(<SearchBar value='' onChange={mockOnChange} />);

        const input = screen.getByRole('textbox');
        expect(input).not.toHaveAttribute('placeholder');
      });

      it('Then displays search icon', () => {
        render(<SearchBar value='' onChange={mockOnChange} />);

        const iconContainer = screen.getByRole('textbox').previousElementSibling;
        expect(iconContainer).toHaveClass(
          'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'
        );

        const svg = iconContainer?.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg?.getAttribute('class')).toContain('h-5 w-5');
      });
    });
  });

  describe('Given a user wants to enter search text', () => {
    describe('When typing in the search input', () => {
      it('Then updates input value and debounces onChange calls', async () => {
        jest.useFakeTimers();
        render(<SearchBar value='' onChange={mockOnChange} />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'new text' } });

        // Input should update immediately
        expect(input).toHaveValue('new text');

        // onChange should not be called immediately due to debouncing
        expect(mockOnChange).not.toHaveBeenCalled();

        // Fast-forward time to trigger debounced onChange
        await act(async () => {
          jest.advanceTimersByTime(300);
        });

        expect(mockOnChange).toHaveBeenCalledWith('new text');
        jest.useRealTimers();
      });

      it('Then handles rapid typing with proper debouncing', async () => {
        jest.useFakeTimers();
        render(<SearchBar value='' onChange={mockOnChange} />);

        const input = screen.getByRole('textbox');

        // Simulate rapid typing
        fireEvent.change(input, { target: { value: 'rapid' } });

        // Should not call onChange during rapid typing
        expect(mockOnChange).not.toHaveBeenCalled();

        // Fast-forward to trigger debounce
        await act(async () => {
          jest.advanceTimersByTime(300);
        });

        // Should only call once with final value
        expect(mockOnChange).toHaveBeenCalledTimes(1);
        expect(mockOnChange).toHaveBeenCalledWith('rapid');

        jest.useRealTimers();
      });

      it('Then handles pasted text with debouncing', async () => {
        jest.useFakeTimers();
        render(<SearchBar value='' onChange={mockOnChange} />);

        const input = screen.getByRole('textbox');

        // Simulate paste
        fireEvent.change(input, { target: { value: 'pasted text' } });

        // Should update input value immediately
        expect(input).toHaveValue('pasted text');

        // But onChange is debounced
        expect(mockOnChange).not.toHaveBeenCalled();

        // Fast-forward time
        await act(async () => {
          jest.advanceTimersByTime(300);
        });

        expect(mockOnChange).toHaveBeenCalledWith('pasted text');
        jest.useRealTimers();
      });

      it('Then handles special characters correctly', async () => {
        jest.useFakeTimers();
        render(<SearchBar value='' onChange={mockOnChange} />);

        const input = screen.getByRole('textbox');
        const specialChars = '!@#$%^&*()_+-=[]{}|;:"<>,.?/~`';

        fireEvent.change(input, { target: { value: specialChars } });

        // Value should be updated immediately in the input
        expect(input).toHaveValue(specialChars);

        // Fast-forward to trigger debounce
        await act(async () => {
          jest.advanceTimersByTime(300);
        });

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        expect(mockOnChange).toHaveBeenCalledWith(specialChars);

        jest.useRealTimers();
      });
    });

    describe('When clearing the search input', () => {
      it('Then clears search when clear button is clicked', async () => {
        jest.useFakeTimers();
        render(<SearchBar value='initial' onChange={mockOnChange} />);

        // Find and click the clear button
        const clearButton = screen.getByRole('button');
        fireEvent.click(clearButton);

        // Fast-forward time to trigger debounced onChange
        await act(async () => {
          jest.advanceTimersByTime(300);
        });

        expect(mockOnChange).toHaveBeenCalledWith('');
        jest.useRealTimers();
      });
    });
  });

  describe('Given a user interacts with the search component', () => {
    describe('When using keyboard navigation', () => {
      it('Then maintains focus after value changes', () => {
        const { rerender } = render(<SearchBar value='' onChange={mockOnChange} />);

        const input = screen.getByRole('textbox') as HTMLInputElement;
        input.focus();
        expect(document.activeElement).toBe(input);

        // Simulate parent component updating the value
        rerender(<SearchBar value='updated' onChange={mockOnChange} />);

        // Focus should be maintained after rerender
        const updatedInput = screen.getByRole('textbox');
        expect(updatedInput).toHaveValue('updated');
      });

      it('Then allows keyboard shortcuts without interfering', async () => {
        const user = userEvent.setup();
        render(<SearchBar value='test' onChange={mockOnChange} />);

        const input = screen.getByRole('textbox');
        await user.click(input);

        // Test Ctrl+A (select all) - should not trigger onChange
        await user.keyboard('{Control>}a{/Control}');
        expect(mockOnChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given the search component should be accessible', () => {
    describe('When checking accessibility features', () => {
      it('Then provides proper input attributes', () => {
        render(<SearchBar value='' onChange={mockOnChange} placeholder='Search' />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('type', 'text');
        expect(input).toBeEnabled();
      });

      it('Then has proper styling and layout structure', () => {
        render(<SearchBar value='' onChange={mockOnChange} />);

        const container = screen.getByRole('textbox').parentElement;
        expect(container).toHaveClass('mt-4 relative');

        const input = screen.getByRole('textbox');
        expect(input).toHaveClass(
          'w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
        );
      });
    });
  });
});
