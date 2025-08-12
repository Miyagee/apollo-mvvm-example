import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingState } from './LoadingState';

describe('LoadingState', () => {
  describe('Given data is being loaded', () => {
    describe('When the loading state is displayed', () => {
      it('Then shows default loading message', () => {
        render(<LoadingState />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      it('Then shows custom loading message when provided', () => {
        const customMessage = 'Fetching devices...';
        render(<LoadingState message={customMessage} />);

        expect(screen.getByText(customMessage)).toBeInTheDocument();
      });

      it('Then displays loading spinner with proper styling', () => {
        const { container } = render(<LoadingState />);

        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass(
          'rounded-full',
          'h-12',
          'w-12',
          'border-b-2',
          'border-blue-500'
        );
      });

      it('Then renders with proper layout structure', () => {
        const { container } = render(<LoadingState />);

        const outerContainer = container.querySelector('.flex.items-center.justify-center.h-64');
        expect(outerContainer).toBeInTheDocument();

        const innerContainer = container.querySelector('.flex.flex-col.items-center.space-y-4');
        expect(innerContainer).toBeInTheDocument();
      });

      it('Then applies correct text styling to message', () => {
        render(<LoadingState message='Test message' />);

        const messageElement = screen.getByText('Test message');
        expect(messageElement).toHaveClass('text-lg', 'text-gray-600', 'dark:text-gray-400');
      });

      it('Then displays spinner before message in correct order', () => {
        const { container } = render(<LoadingState message='Custom loading text' />);

        const innerContainer = container.querySelector('.flex.flex-col.items-center.space-y-4');
        const children = innerContainer?.children;

        expect(children).toHaveLength(2);
        expect(children?.[0]).toHaveClass('animate-spin');
        expect(children?.[1]).toHaveTextContent('Custom loading text');
      });
    });
  });
});
