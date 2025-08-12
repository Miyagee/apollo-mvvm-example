import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SnackbarContainer } from './Snackbar';
import { SnackbarMessage } from '@/viewmodels/shared/useSnackbar';

describe('SnackbarContainer', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    mockOnDismiss.mockClear();
  });

  describe('Given a stateless SnackbarContainer component', () => {
    describe('When rendered with no messages', () => {
      it('Then renders nothing', () => {
        const { container } = render(
          <SnackbarContainer messages={[]} onDismiss={mockOnDismiss} />
        );

        expect(container.firstChild).toBeNull();
        expect(screen.queryByTestId('snackbar-container')).not.toBeInTheDocument();
      });
    });

    describe('When rendered with messages', () => {
      it('Then displays all messages', () => {
        const messages: SnackbarMessage[] = [
          { id: '1', message: 'Message 1', type: 'success' },
          { id: '2', message: 'Message 2', type: 'error' },
        ];

        render(<SnackbarContainer messages={messages} onDismiss={mockOnDismiss} />);

        expect(screen.getByTestId('snackbar-container')).toBeInTheDocument();
        expect(screen.getByTestId('snackbar-item-1')).toBeInTheDocument();
        expect(screen.getByTestId('snackbar-item-2')).toBeInTheDocument();
        expect(screen.getByText('Message 1')).toBeInTheDocument();
        expect(screen.getByText('Message 2')).toBeInTheDocument();
      });
    });
  });

  describe('Given different snackbar types', () => {
    describe('When type is success', () => {
      it('Then displays with success styling and icon', () => {
        const messages: SnackbarMessage[] = [
          { id: '1', message: 'Success message', type: 'success' },
        ];

        render(<SnackbarContainer messages={messages} onDismiss={mockOnDismiss} />);

        const snackbarItem = screen.getByTestId('snackbar-item-1');
        expect(snackbarItem).toHaveClass('bg-green-600');
        expect(screen.getByTestId('snackbar-icon-success')).toBeInTheDocument();
      });
    });

    describe('When type is error', () => {
      it('Then displays with error styling and icon', () => {
        const messages: SnackbarMessage[] = [
          { id: '1', message: 'Error message', type: 'error' },
        ];

        render(<SnackbarContainer messages={messages} onDismiss={mockOnDismiss} />);

        const snackbarItem = screen.getByTestId('snackbar-item-1');
        expect(snackbarItem).toHaveClass('bg-red-600');
        expect(screen.getByTestId('snackbar-icon-error')).toBeInTheDocument();
      });
    });

    describe('When type is warning', () => {
      it('Then displays with warning styling and icon', () => {
        const messages: SnackbarMessage[] = [
          { id: '1', message: 'Warning message', type: 'warning' },
        ];

        render(<SnackbarContainer messages={messages} onDismiss={mockOnDismiss} />);

        const snackbarItem = screen.getByTestId('snackbar-item-1');
        expect(snackbarItem).toHaveClass('bg-yellow-500');
        expect(screen.getByTestId('snackbar-icon-warning')).toBeInTheDocument();
      });
    });

    describe('When type is info', () => {
      it('Then displays with info styling and icon', () => {
        const messages: SnackbarMessage[] = [
          { id: '1', message: 'Info message', type: 'info' },
        ];

        render(<SnackbarContainer messages={messages} onDismiss={mockOnDismiss} />);

        const snackbarItem = screen.getByTestId('snackbar-item-1');
        expect(snackbarItem).toHaveClass('bg-blue-600');
        expect(screen.getByTestId('snackbar-icon-info')).toBeInTheDocument();
      });
    });
  });

  describe('Given a user wants to dismiss a message', () => {
    describe('When clicking the dismiss button', () => {
      it('Then calls onDismiss with the message ID', () => {
        const messages: SnackbarMessage[] = [
          { id: 'test-id-123', message: 'Dismissable message', type: 'info' },
        ];

        render(<SnackbarContainer messages={messages} onDismiss={mockOnDismiss} />);

        const dismissButton = screen.getByTestId('snackbar-dismiss-button');
        fireEvent.click(dismissButton);

        expect(mockOnDismiss).toHaveBeenCalledTimes(1);
        expect(mockOnDismiss).toHaveBeenCalledWith('test-id-123');
      });
    });

    describe('When there are multiple messages', () => {
      it('Then each dismiss button calls onDismiss with correct ID', () => {
        const messages: SnackbarMessage[] = [
          { id: 'msg-1', message: 'Message 1', type: 'success' },
          { id: 'msg-2', message: 'Message 2', type: 'error' },
        ];

        render(<SnackbarContainer messages={messages} onDismiss={mockOnDismiss} />);

        const dismissButtons = screen.getAllByTestId('snackbar-dismiss-button');
        expect(dismissButtons).toHaveLength(2);

        fireEvent.click(dismissButtons[0]);
        expect(mockOnDismiss).toHaveBeenCalledWith('msg-1');

        fireEvent.click(dismissButtons[1]);
        expect(mockOnDismiss).toHaveBeenCalledWith('msg-2');
      });
    });
  });

  describe('Given different position props', () => {
    describe('When position is bottom-right (default)', () => {
      it('Then has correct positioning classes', () => {
        const messages: SnackbarMessage[] = [
          { id: '1', message: 'Test', type: 'info' },
        ];

        render(<SnackbarContainer messages={messages} onDismiss={mockOnDismiss} />);

        const container = screen.getByTestId('snackbar-container');
        expect(container).toHaveClass('bottom-4', 'right-4');
      });
    });

    describe('When position is top-right', () => {
      it('Then has correct positioning classes', () => {
        const messages: SnackbarMessage[] = [
          { id: '1', message: 'Test', type: 'info' },
        ];

        render(
          <SnackbarContainer messages={messages} onDismiss={mockOnDismiss} position="top-right" />
        );

        const container = screen.getByTestId('snackbar-container');
        expect(container).toHaveClass('top-4', 'right-4');
      });
    });

    describe('When position is top-left', () => {
      it('Then has correct positioning classes', () => {
        const messages: SnackbarMessage[] = [
          { id: '1', message: 'Test', type: 'info' },
        ];

        render(
          <SnackbarContainer messages={messages} onDismiss={mockOnDismiss} position="top-left" />
        );

        const container = screen.getByTestId('snackbar-container');
        expect(container).toHaveClass('top-4', 'left-4');
      });
    });

    describe('When position is bottom-left', () => {
      it('Then has correct positioning classes', () => {
        const messages: SnackbarMessage[] = [
          { id: '1', message: 'Test', type: 'info' },
        ];

        render(
          <SnackbarContainer messages={messages} onDismiss={mockOnDismiss} position="bottom-left" />
        );

        const container = screen.getByTestId('snackbar-container');
        expect(container).toHaveClass('bottom-4', 'left-4');
      });
    });

    describe('When position is top-center', () => {
      it('Then has correct positioning classes', () => {
        const messages: SnackbarMessage[] = [
          { id: '1', message: 'Test', type: 'info' },
        ];

        render(
          <SnackbarContainer messages={messages} onDismiss={mockOnDismiss} position="top-center" />
        );

        const container = screen.getByTestId('snackbar-container');
        expect(container).toHaveClass('top-4', 'left-1/2', '-translate-x-1/2');
      });
    });

    describe('When position is bottom-center', () => {
      it('Then has correct positioning classes', () => {
        const messages: SnackbarMessage[] = [
          { id: '1', message: 'Test', type: 'info' },
        ];

        render(
          <SnackbarContainer
            messages={messages}
            onDismiss={mockOnDismiss}
            position="bottom-center"
          />
        );

        const container = screen.getByTestId('snackbar-container');
        expect(container).toHaveClass('bottom-4', 'left-1/2', '-translate-x-1/2');
      });
    });
  });

  describe('Given accessibility requirements', () => {
    describe('When snackbar is rendered', () => {
      it('Then has role="alert" for screen readers', () => {
        const messages: SnackbarMessage[] = [
          { id: '1', message: 'Alert message', type: 'error' },
        ];

        render(<SnackbarContainer messages={messages} onDismiss={mockOnDismiss} />);

        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
      });

      it('Then dismiss button has accessible label', () => {
        const messages: SnackbarMessage[] = [
          { id: '1', message: 'Test', type: 'info' },
        ];

        render(<SnackbarContainer messages={messages} onDismiss={mockOnDismiss} />);

        const dismissButton = screen.getByLabelText('Dismiss notification');
        expect(dismissButton).toBeInTheDocument();
      });
    });
  });
});
