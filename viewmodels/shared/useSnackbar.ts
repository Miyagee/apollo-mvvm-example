import { useState, useCallback, useRef, useEffect } from 'react';

/** Snackbar message types */
export type SnackbarType = 'success' | 'error' | 'info' | 'warning';

/** Individual snackbar message */
export interface SnackbarMessage {
  id: string;
  message: string;
  type: SnackbarType;
  duration?: number;
}

/** Default duration in milliseconds */
const DEFAULT_DURATION = 4000;

/** Options for showing a snackbar */
export interface ShowSnackbarOptions {
  /** Message to display */
  message: string;
  /** Type of snackbar (affects styling) */
  type?: SnackbarType;
  /** Duration in ms before auto-dismiss (0 = no auto-dismiss) */
  duration?: number;
}

/** Return type for useSnackbar hook */
export interface UseSnackbarResult {
  /** Currently visible snackbar messages */
  messages: SnackbarMessage[];
  /** Show a snackbar message */
  show: (options: ShowSnackbarOptions) => string;
  /** Show a success message */
  showSuccess: (message: string, duration?: number) => string;
  /** Show an error message */
  showError: (message: string, duration?: number) => string;
  /** Show an info message */
  showInfo: (message: string, duration?: number) => string;
  /** Show a warning message */
  showWarning: (message: string, duration?: number) => string;
  /** Dismiss a specific message by ID */
  dismiss: (id: string) => void;
  /** Dismiss all messages */
  dismissAll: () => void;
}

/** Generate a unique ID for snackbar messages */
const generateId = (): string => {
  return `snackbar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * useSnackbar - ViewModel hook for managing snackbar notifications
 *
 * This hook manages the state for displaying toast/snackbar notifications.
 * It follows the MVVM pattern where all state lives in the ViewModel.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const snackbar = useSnackbar();
 *
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       snackbar.showSuccess('Data saved successfully!');
 *     } catch (error) {
 *       snackbar.showError('Failed to save data');
 *     }
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleSave}>Save</button>
 *       <SnackbarContainer messages={snackbar.messages} onDismiss={snackbar.dismiss} />
 *     </>
 *   );
 * }
 * ```
 */
export function useSnackbar(): UseSnackbarResult {
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    // Clear any existing timer for this message
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();

    setMessages([]);
  }, []);

  const show = useCallback(
    ({ message, type = 'info', duration = DEFAULT_DURATION }: ShowSnackbarOptions): string => {
      const id = generateId();

      const newMessage: SnackbarMessage = {
        id,
        message,
        type,
        duration,
      };

      setMessages((prev) => [...prev, newMessage]);

      // Set up auto-dismiss if duration > 0
      if (duration > 0) {
        const timer = setTimeout(() => {
          dismiss(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss]
  );

  const showSuccess = useCallback(
    (message: string, duration?: number): string => {
      return show({ message, type: 'success', duration });
    },
    [show]
  );

  const showError = useCallback(
    (message: string, duration?: number): string => {
      return show({ message, type: 'error', duration });
    },
    [show]
  );

  const showInfo = useCallback(
    (message: string, duration?: number): string => {
      return show({ message, type: 'info', duration });
    },
    [show]
  );

  const showWarning = useCallback(
    (message: string, duration?: number): string => {
      return show({ message, type: 'warning', duration });
    },
    [show]
  );

  return {
    messages,
    show,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    dismiss,
    dismissAll,
  };
}
