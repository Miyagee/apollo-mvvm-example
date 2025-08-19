import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingState } from './LoadingState';

describe('LoadingState', () => {
  it('renders with default message', () => {
    render(<LoadingState />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = 'Fetching devices...';
    render(<LoadingState message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders loading spinner', () => {
    const { container } = render(<LoadingState />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('rounded-full', 'h-12', 'w-12', 'border-b-2', 'border-blue-500');
  });

  it('renders with correct layout structure', () => {
    const { container } = render(<LoadingState />);

    const outerContainer = container.querySelector('.flex.items-center.justify-center.h-64');
    expect(outerContainer).toBeInTheDocument();

    const innerContainer = container.querySelector('.flex.flex-col.items-center.space-y-4');
    expect(innerContainer).toBeInTheDocument();
  });

  it('applies correct text styling', () => {
    render(<LoadingState message='Test message' />);

    const messageElement = screen.getByText('Test message');
    expect(messageElement).toHaveClass('text-lg', 'text-gray-600', 'dark:text-gray-400');
  });

  it('renders spinner and message in correct order', () => {
    const { container } = render(<LoadingState message='Custom loading text' />);

    const innerContainer = container.querySelector('.flex.flex-col.items-center.space-y-4');
    const children = innerContainer?.children;

    expect(children).toHaveLength(2);
    expect(children?.[0]).toHaveClass('animate-spin');
    expect(children?.[1]).toHaveTextContent('Custom loading text');
  });
});
