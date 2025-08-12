import React from 'react';
import { SnackbarMessage, SnackbarType } from '@/viewmodels/shared/useSnackbar';

/**
 * Props for individual SnackbarItem component
 */
interface SnackbarItemProps {
  message: SnackbarMessage;
  onDismiss: (id: string) => void;
}

/**
 * Get Tailwind classes for snackbar type
 */
const getTypeStyles = (type: SnackbarType): string => {
  switch (type) {
    case 'success':
      return 'bg-green-600 text-white';
    case 'error':
      return 'bg-red-600 text-white';
    case 'warning':
      return 'bg-yellow-500 text-gray-900';
    case 'info':
    default:
      return 'bg-blue-600 text-white';
  }
};

/**
 * Get icon for snackbar type
 */
const getIcon = (type: SnackbarType): React.ReactNode => {
  switch (type) {
    case 'success':
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          data-testid="snackbar-icon-success"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    case 'error':
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          data-testid="snackbar-icon-error"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          data-testid="snackbar-icon-warning"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          data-testid="snackbar-icon-info"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
  }
};

/**
 * SnackbarItem - Individual snackbar message (stateless View component)
 */
function SnackbarItem({ message, onDismiss }: SnackbarItemProps) {
  return (
    <div
      data-testid={`snackbar-item-${message.id}`}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        ${getTypeStyles(message.type)}
      `}
      role="alert"
    >
      <span className="flex-shrink-0">{getIcon(message.type)}</span>
      <p className="flex-1 text-sm font-medium" data-testid="snackbar-message">
        {message.message}
      </p>
      <button
        onClick={() => onDismiss(message.id)}
        className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
        aria-label="Dismiss notification"
        data-testid="snackbar-dismiss-button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

/**
 * Props for SnackbarContainer component
 */
export interface SnackbarContainerProps {
  /** Array of snackbar messages to display */
  messages: SnackbarMessage[];
  /** Callback to dismiss a message by ID */
  onDismiss: (id: string) => void;
  /** Position of the snackbar container */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

/**
 * Get position classes for the container
 */
const getPositionClasses = (position: SnackbarContainerProps['position']): string => {
  switch (position) {
    case 'top-left':
      return 'top-4 left-4';
    case 'top-center':
      return 'top-4 left-1/2 -translate-x-1/2';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'bottom-center':
      return 'bottom-4 left-1/2 -translate-x-1/2';
    case 'bottom-right':
      return 'bottom-4 right-4';
    case 'top-right':
    default:
      return 'top-4 right-4';
  }
};

/**
 * SnackbarContainer - Container for displaying multiple snackbar messages
 *
 * This is a stateless View component that receives all state from the ViewModel.
 * It simply renders the messages it receives via props.
 *
 * @example
 * ```tsx
 * function MyView() {
 *   const snackbar = useSnackbar();
 *
 *   return (
 *     <>
 *       <button onClick={() => snackbar.showSuccess('Saved!')}>Save</button>
 *       <SnackbarContainer
 *         messages={snackbar.messages}
 *         onDismiss={snackbar.dismiss}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function SnackbarContainer({
  messages,
  onDismiss,
  position = 'bottom-right',
}: SnackbarContainerProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="snackbar-container"
      className={`fixed z-50 flex flex-col gap-2 ${getPositionClasses(position)}`}
      style={{ maxWidth: '400px', width: '100%' }}
    >
      {messages.map((message) => (
        <SnackbarItem key={message.id} message={message} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
