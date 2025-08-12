import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  const mockOnChange = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnClear.mockClear();
  });

  describe('Given a stateless SearchBar component', () => {
    describe('When rendered with value prop', () => {
      it('Then displays the value from props', () => {
        render(<SearchBar value='test value' onChange={mockOnChange} />);

        const input = screen.getByTestId('search-input');
        expect(input).toHaveValue('test value');
      });

      it('Then displays placeholder text when provided', () => {
        render(<SearchBar value='' onChange={mockOnChange} placeholder='Search devices...' />);

        const input = screen.getByPlaceholderText('Search devices...');
        expect(input).toBeInTheDocument();
      });

      it('Then displays search icon', () => {
        render(<SearchBar value='' onChange={mockOnChange} />);

        const iconContainer = screen.getByTestId('search-input').previousElementSibling;
        expect(iconContainer).toHaveClass(
          'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'
        );

        const svg = iconContainer?.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });

    describe('When isDebouncing is true', () => {
      it('Then shows blue search icon to indicate debouncing', () => {
        render(<SearchBar value='test' isDebouncing={true} onChange={mockOnChange} />);

        const iconContainer = screen.getByTestId('search-input').previousElementSibling;
        const svg = iconContainer?.querySelector('svg');
        expect(svg?.getAttribute('class')).toContain('text-blue-500');
      });
    });

    describe('When isDebouncing is false', () => {
      it('Then shows gray search icon', () => {
        render(<SearchBar value='test' isDebouncing={false} onChange={mockOnChange} />);

        const iconContainer = screen.getByTestId('search-input').previousElementSibling;
        const svg = iconContainer?.querySelector('svg');
        expect(svg?.getAttribute('class')).toContain('text-gray-400');
      });
    });
  });

  describe('Given a user types in the search input', () => {
    describe('When typing characters', () => {
      it('Then calls onChange immediately with the new value', () => {
        render(<SearchBar value='' onChange={mockOnChange} />);

        const input = screen.getByTestId('search-input');
        fireEvent.change(input, { target: { value: 'new text' } });

        // Stateless component - calls onChange immediately
        expect(mockOnChange).toHaveBeenCalledTimes(1);
        expect(mockOnChange).toHaveBeenCalledWith('new text');
      });

      it('Then handles special characters correctly', () => {
        render(<SearchBar value='' onChange={mockOnChange} />);

        const input = screen.getByTestId('search-input');
        const specialChars = '!@#$%^&*()_+-=[]{}|;:"<>,.?/~`';

        fireEvent.change(input, { target: { value: specialChars } });

        expect(mockOnChange).toHaveBeenCalledWith(specialChars);
      });

      it('Then handles pasted text', () => {
        render(<SearchBar value='' onChange={mockOnChange} />);

        const input = screen.getByTestId('search-input');
        fireEvent.change(input, { target: { value: 'pasted text' } });

        expect(mockOnChange).toHaveBeenCalledWith('pasted text');
      });
    });
  });

  describe('Given a user wants to clear the search', () => {
    describe('When value is non-empty', () => {
      it('Then shows the clear button', () => {
        render(<SearchBar value='test' onChange={mockOnChange} />);

        const clearButton = screen.getByTestId('search-clear-button');
        expect(clearButton).toBeInTheDocument();
      });
    });

    describe('When value is empty', () => {
      it('Then hides the clear button', () => {
        render(<SearchBar value='' onChange={mockOnChange} />);

        expect(screen.queryByTestId('search-clear-button')).not.toBeInTheDocument();
      });
    });

    describe('When clicking the clear button with onClear prop', () => {
      it('Then calls onClear callback', () => {
        render(<SearchBar value='test' onChange={mockOnChange} onClear={mockOnClear} />);

        const clearButton = screen.getByTestId('search-clear-button');
        fireEvent.click(clearButton);

        expect(mockOnClear).toHaveBeenCalledTimes(1);
        expect(mockOnChange).not.toHaveBeenCalled();
      });
    });

    describe('When clicking the clear button without onClear prop', () => {
      it('Then calls onChange with empty string', () => {
        render(<SearchBar value='test' onChange={mockOnChange} />);

        const clearButton = screen.getByTestId('search-clear-button');
        fireEvent.click(clearButton);

        expect(mockOnChange).toHaveBeenCalledWith('');
      });
    });
  });

  describe('Given the SearchBar receives updated props', () => {
    describe('When value prop changes', () => {
      it('Then displays the new value', () => {
        const { rerender } = render(<SearchBar value='initial' onChange={mockOnChange} />);

        const input = screen.getByTestId('search-input');
        expect(input).toHaveValue('initial');

        rerender(<SearchBar value='updated' onChange={mockOnChange} />);

        expect(input).toHaveValue('updated');
      });

      it('Then maintains focus after rerender', () => {
        const { rerender } = render(<SearchBar value='' onChange={mockOnChange} />);

        const input = screen.getByTestId('search-input') as HTMLInputElement;
        input.focus();
        expect(document.activeElement).toBe(input);

        rerender(<SearchBar value='updated' onChange={mockOnChange} />);

        expect(document.activeElement).toBe(input);
      });
    });
  });

  describe('Given the SearchBar should be accessible', () => {
    describe('When checking accessibility features', () => {
      it('Then has proper input type', () => {
        render(<SearchBar value='' onChange={mockOnChange} />);

        const input = screen.getByTestId('search-input');
        expect(input).toHaveAttribute('type', 'text');
        expect(input).toBeEnabled();
      });

      it('Then has proper test IDs for automation', () => {
        render(<SearchBar value='test' onChange={mockOnChange} />);

        expect(screen.getByTestId('search-input')).toBeInTheDocument();
        expect(screen.getByTestId('search-clear-button')).toBeInTheDocument();
      });

      it('Then allows keyboard interaction', async () => {
        const user = userEvent.setup();
        render(<SearchBar value='test' onChange={mockOnChange} />);

        const input = screen.getByTestId('search-input');
        await user.click(input);

        // Test Ctrl+A (select all) - should not trigger onChange
        await user.keyboard('{Control>}a{/Control}');
        expect(mockOnChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given proper styling', () => {
    describe('When rendered', () => {
      it('Then has proper layout structure', () => {
        render(<SearchBar value='' onChange={mockOnChange} />);

        const container = screen.getByTestId('search-input').parentElement;
        expect(container).toHaveClass('mt-4 relative');
      });

      it('Then input has proper styling classes', () => {
        render(<SearchBar value='' onChange={mockOnChange} />);

        const input = screen.getByTestId('search-input');
        expect(input).toHaveClass('w-full pl-10 pr-4 py-2 border rounded-md');
      });
    });
  });
});
