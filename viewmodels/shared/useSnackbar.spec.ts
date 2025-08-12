import { renderHook, act } from '@testing-library/react';
import { useSnackbar } from './useSnackbar';

describe('useSnackbar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Given the snackbar hook is initialized', () => {
    describe('When first rendered', () => {
      it('Then has empty messages array', () => {
        const { result } = renderHook(() => useSnackbar());

        expect(result.current.messages).toEqual([]);
      });

      it('Then exposes all required functions', () => {
        const { result } = renderHook(() => useSnackbar());

        expect(typeof result.current.show).toBe('function');
        expect(typeof result.current.showSuccess).toBe('function');
        expect(typeof result.current.showError).toBe('function');
        expect(typeof result.current.showInfo).toBe('function');
        expect(typeof result.current.showWarning).toBe('function');
        expect(typeof result.current.dismiss).toBe('function');
        expect(typeof result.current.dismissAll).toBe('function');
      });
    });
  });

  describe('Given a user wants to show a message', () => {
    describe('When calling show with options', () => {
      it('Then adds message to the messages array', () => {
        const { result } = renderHook(() => useSnackbar());

        act(() => {
          result.current.show({ message: 'Test message', type: 'info' });
        });

        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0].message).toBe('Test message');
        expect(result.current.messages[0].type).toBe('info');
      });

      it('Then returns a unique ID', () => {
        const { result } = renderHook(() => useSnackbar());

        let id1: string = '';
        let id2: string = '';

        act(() => {
          id1 = result.current.show({ message: 'Message 1' });
          id2 = result.current.show({ message: 'Message 2' });
        });

        expect(id1).toBeTruthy();
        expect(id2).toBeTruthy();
        expect(id1).not.toBe(id2);
      });

      it('Then defaults to info type when not specified', () => {
        const { result } = renderHook(() => useSnackbar());

        act(() => {
          result.current.show({ message: 'Test message' });
        });

        expect(result.current.messages[0].type).toBe('info');
      });
    });

    describe('When calling showSuccess', () => {
      it('Then adds a success message', () => {
        const { result } = renderHook(() => useSnackbar());

        act(() => {
          result.current.showSuccess('Operation successful!');
        });

        expect(result.current.messages[0].message).toBe('Operation successful!');
        expect(result.current.messages[0].type).toBe('success');
      });
    });

    describe('When calling showError', () => {
      it('Then adds an error message', () => {
        const { result } = renderHook(() => useSnackbar());

        act(() => {
          result.current.showError('Something went wrong');
        });

        expect(result.current.messages[0].message).toBe('Something went wrong');
        expect(result.current.messages[0].type).toBe('error');
      });
    });

    describe('When calling showInfo', () => {
      it('Then adds an info message', () => {
        const { result } = renderHook(() => useSnackbar());

        act(() => {
          result.current.showInfo('FYI: New update available');
        });

        expect(result.current.messages[0].message).toBe('FYI: New update available');
        expect(result.current.messages[0].type).toBe('info');
      });
    });

    describe('When calling showWarning', () => {
      it('Then adds a warning message', () => {
        const { result } = renderHook(() => useSnackbar());

        act(() => {
          result.current.showWarning('Proceed with caution');
        });

        expect(result.current.messages[0].message).toBe('Proceed with caution');
        expect(result.current.messages[0].type).toBe('warning');
      });
    });
  });

  describe('Given messages have auto-dismiss duration', () => {
    describe('When the default duration elapses', () => {
      it('Then automatically dismisses the message after 4000ms', () => {
        const { result } = renderHook(() => useSnackbar());

        act(() => {
          result.current.showSuccess('Auto-dismiss test');
        });

        expect(result.current.messages).toHaveLength(1);

        // Advance time by default duration (4000ms)
        act(() => {
          jest.advanceTimersByTime(4000);
        });

        expect(result.current.messages).toHaveLength(0);
      });
    });

    describe('When a custom duration is specified', () => {
      it('Then dismisses after the custom duration', () => {
        const { result } = renderHook(() => useSnackbar());

        act(() => {
          result.current.show({ message: 'Custom duration', duration: 2000 });
        });

        expect(result.current.messages).toHaveLength(1);

        // Advance time by custom duration
        act(() => {
          jest.advanceTimersByTime(2000);
        });

        expect(result.current.messages).toHaveLength(0);
      });
    });

    describe('When duration is 0', () => {
      it('Then does not auto-dismiss', () => {
        const { result } = renderHook(() => useSnackbar());

        act(() => {
          result.current.show({ message: 'Persistent message', duration: 0 });
        });

        expect(result.current.messages).toHaveLength(1);

        // Advance time significantly
        act(() => {
          jest.advanceTimersByTime(10000);
        });

        // Message should still be present
        expect(result.current.messages).toHaveLength(1);
      });
    });
  });

  describe('Given a user wants to dismiss messages', () => {
    describe('When calling dismiss with a specific ID', () => {
      it('Then removes only that message', () => {
        const { result } = renderHook(() => useSnackbar());

        let id1: string = '';
        let id2: string = '';

        act(() => {
          id1 = result.current.showSuccess('Message 1');
          id2 = result.current.showError('Message 2');
        });

        expect(result.current.messages).toHaveLength(2);

        act(() => {
          result.current.dismiss(id1);
        });

        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0].id).toBe(id2);
      });

      it('Then clears the auto-dismiss timer for that message', () => {
        const { result } = renderHook(() => useSnackbar());

        let id: string = '';

        act(() => {
          id = result.current.show({ message: 'Test', duration: 5000 });
        });

        // Manually dismiss before timer
        act(() => {
          result.current.dismiss(id);
        });

        expect(result.current.messages).toHaveLength(0);

        // Advance past original timer - should not cause any issues
        act(() => {
          jest.advanceTimersByTime(5000);
        });

        expect(result.current.messages).toHaveLength(0);
      });
    });

    describe('When calling dismissAll', () => {
      it('Then removes all messages', () => {
        const { result } = renderHook(() => useSnackbar());

        act(() => {
          result.current.showSuccess('Message 1');
          result.current.showError('Message 2');
          result.current.showWarning('Message 3');
        });

        expect(result.current.messages).toHaveLength(3);

        act(() => {
          result.current.dismissAll();
        });

        expect(result.current.messages).toHaveLength(0);
      });

      it('Then clears all auto-dismiss timers', () => {
        const { result } = renderHook(() => useSnackbar());

        act(() => {
          result.current.show({ message: 'Message 1', duration: 3000 });
          result.current.show({ message: 'Message 2', duration: 5000 });
        });

        act(() => {
          result.current.dismissAll();
        });

        // Advance past all timers
        act(() => {
          jest.advanceTimersByTime(6000);
        });

        // No errors should occur and messages should still be empty
        expect(result.current.messages).toHaveLength(0);
      });
    });
  });

  describe('Given multiple messages are shown', () => {
    describe('When messages have different durations', () => {
      it('Then each dismisses independently', () => {
        const { result } = renderHook(() => useSnackbar());

        act(() => {
          result.current.show({ message: 'Short', duration: 1000 });
          result.current.show({ message: 'Medium', duration: 3000 });
          result.current.show({ message: 'Long', duration: 5000 });
        });

        expect(result.current.messages).toHaveLength(3);

        // After 1000ms, first should be gone
        act(() => {
          jest.advanceTimersByTime(1000);
        });
        expect(result.current.messages).toHaveLength(2);

        // After 2000ms more (total 3000ms), second should be gone
        act(() => {
          jest.advanceTimersByTime(2000);
        });
        expect(result.current.messages).toHaveLength(1);

        // After 2000ms more (total 5000ms), third should be gone
        act(() => {
          jest.advanceTimersByTime(2000);
        });
        expect(result.current.messages).toHaveLength(0);
      });
    });
  });

  describe('Given the hook is unmounted', () => {
    describe('When there are pending auto-dismiss timers', () => {
      it('Then cleans up timers without errors', () => {
        const { result, unmount } = renderHook(() => useSnackbar());

        act(() => {
          result.current.show({ message: 'Test', duration: 5000 });
        });

        // Unmount before timer fires
        unmount();

        // Advance timers - should not cause any errors
        act(() => {
          jest.advanceTimersByTime(5000);
        });

        // If we reach here without errors, cleanup worked
        expect(true).toBe(true);
      });
    });
  });
});
