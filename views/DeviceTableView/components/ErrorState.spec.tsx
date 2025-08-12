import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  const mockError = new Error('Something went wrong');
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Given an error has occurred during data loading', () => {
    describe('When the error state is displayed', () => {
      it('Then shows error information to the user', () => {
        render(<ErrorState error={mockError} />);

        expect(screen.getByText('Failed to load devices')).toBeInTheDocument();
        expect(screen.getByText('Error: Something went wrong')).toBeInTheDocument();
      });

      it('Then displays custom error messages', () => {
        const customError = new Error('Network connection failed');
        render(<ErrorState error={customError} />);

        expect(screen.getByText('Error: Network connection failed')).toBeInTheDocument();
      });

      it('Then handles empty error messages gracefully', () => {
        const emptyError = new Error('');
        render(<ErrorState error={emptyError} />);

        expect(screen.getByText('Error:')).toBeInTheDocument();
      });

      it('Then renders visible error state container', () => {
        render(<ErrorState error={mockError} onRetry={mockOnRetry} />);

        const container = screen.getByTestId('error-state');
        expect(container).toBeVisible();
      });
    });
  });

  describe('Given a user can retry after an error', () => {
    describe('When retry functionality is available', () => {
      it('Then shows retry button', () => {
        render(<ErrorState error={mockError} onRetry={mockOnRetry} />);

        const retryButton = screen.getByRole('button', { name: /retry/i });
        expect(retryButton).toBeInTheDocument();
        expect(retryButton).toBeEnabled();
      });

      it('Then calls retry handler when retry button is clicked', () => {
        render(<ErrorState error={mockError} onRetry={mockOnRetry} />);

        const retryButton = screen.getByRole('button', { name: /retry/i });
        fireEvent.click(retryButton);

        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });

      it('Then allows multiple retry attempts', () => {
        render(<ErrorState error={mockError} onRetry={mockOnRetry} />);

        const retryButton = screen.getByRole('button', { name: /retry/i });
        fireEvent.click(retryButton);
        fireEvent.click(retryButton);
        fireEvent.click(retryButton);

        expect(mockOnRetry).toHaveBeenCalledTimes(3);
      });
    });

    describe('When retry functionality is not available', () => {
      it('Then hides retry button', () => {
        render(<ErrorState error={mockError} />);

        const retryButton = screen.queryByRole('button', { name: /retry/i });
        expect(retryButton).not.toBeInTheDocument();
      });
    });
  });
});
