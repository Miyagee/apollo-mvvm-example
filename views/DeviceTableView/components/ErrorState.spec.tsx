import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  const mockError = new Error('Something went wrong');
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render error message', () => {
    render(<ErrorState error={mockError} />);

    expect(screen.getByText('Error: Something went wrong')).toBeInTheDocument();
  });

  it('should render with custom error message', () => {
    const customError = new Error('Network connection failed');
    render(<ErrorState error={customError} />);

    expect(screen.getByText('Error: Network connection failed')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    render(<ErrorState error={mockError} onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorState error={mockError} />);

    const retryButton = screen.queryByRole('button', { name: /retry/i });
    expect(retryButton).not.toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    render(<ErrorState error={mockError} onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('should have correct CSS classes for styling', () => {
    const { container } = render(<ErrorState error={mockError} onRetry={mockOnRetry} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass(
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'h-64',
      'space-y-4'
    );

    const errorText = screen.getByText(/Error:/);
    expect(errorText).toHaveClass('text-red-500');

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toHaveClass(
      'px-4',
      'py-2',
      'bg-blue-500',
      'text-white',
      'rounded',
      'hover:bg-blue-600'
    );
  });

  it('should handle empty error message', () => {
    const emptyError = new Error('');
    render(<ErrorState error={emptyError} />);

    expect(screen.getByText('Error:')).toBeInTheDocument();
  });

  it('should handle multiple retry clicks', () => {
    render(<ErrorState error={mockError} onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(3);
  });
});
