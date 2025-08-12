import { renderHook, act } from '@testing-library/react';
import { useSearchInput } from './useSearchInput';

describe('useSearchInput', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Given a search input hook', () => {
    describe('When initialized with default options', () => {
      it('Then has empty initial values', () => {
        const { result } = renderHook(() => useSearchInput());

        expect(result.current.inputValue).toBe('');
        expect(result.current.debouncedValue).toBe('');
        expect(result.current.isDebouncing).toBe(false);
      });
    });

    describe('When initialized with an initial value', () => {
      it('Then uses that value', () => {
        const { result } = renderHook(() =>
          useSearchInput({ initialValue: 'test' })
        );

        expect(result.current.inputValue).toBe('test');
        expect(result.current.debouncedValue).toBe('test');
      });
    });
  });

  describe('Given a user types in the search input', () => {
    describe('When setting the input value', () => {
      it('Then updates inputValue immediately', () => {
        const { result } = renderHook(() => useSearchInput());

        act(() => {
          result.current.setInputValue('hello');
        });

        expect(result.current.inputValue).toBe('hello');
      });

      it('Then sets isDebouncing to true', () => {
        const { result } = renderHook(() => useSearchInput());

        act(() => {
          result.current.setInputValue('hello');
        });

        expect(result.current.isDebouncing).toBe(true);
      });

      it('Then does not update debouncedValue immediately', () => {
        const { result } = renderHook(() => useSearchInput());

        act(() => {
          result.current.setInputValue('hello');
        });

        expect(result.current.debouncedValue).toBe('');
      });
    });

    describe('When debounce delay passes', () => {
      it('Then updates debouncedValue', () => {
        const { result } = renderHook(() =>
          useSearchInput({ debounceMs: 300 })
        );

        act(() => {
          result.current.setInputValue('hello');
        });

        act(() => {
          jest.advanceTimersByTime(300);
        });

        expect(result.current.debouncedValue).toBe('hello');
      });

      it('Then sets isDebouncing to false', () => {
        const { result } = renderHook(() =>
          useSearchInput({ debounceMs: 300 })
        );

        act(() => {
          result.current.setInputValue('hello');
        });

        act(() => {
          jest.advanceTimersByTime(300);
        });

        expect(result.current.isDebouncing).toBe(false);
      });

      it('Then calls onDebouncedChange callback', () => {
        const onDebouncedChange = jest.fn();
        const { result } = renderHook(() =>
          useSearchInput({ debounceMs: 300, onDebouncedChange })
        );

        act(() => {
          result.current.setInputValue('hello');
        });

        expect(onDebouncedChange).not.toHaveBeenCalled();

        act(() => {
          jest.advanceTimersByTime(300);
        });

        expect(onDebouncedChange).toHaveBeenCalledWith('hello');
      });
    });

    describe('When typing quickly (before debounce)', () => {
      it('Then only calls onDebouncedChange once with final value', () => {
        const onDebouncedChange = jest.fn();
        const { result } = renderHook(() =>
          useSearchInput({ debounceMs: 300, onDebouncedChange })
        );

        act(() => {
          result.current.setInputValue('h');
        });

        act(() => {
          jest.advanceTimersByTime(100);
        });

        act(() => {
          result.current.setInputValue('he');
        });

        act(() => {
          jest.advanceTimersByTime(100);
        });

        act(() => {
          result.current.setInputValue('hel');
        });

        act(() => {
          jest.advanceTimersByTime(100);
        });

        act(() => {
          result.current.setInputValue('hello');
        });

        // Not called yet
        expect(onDebouncedChange).not.toHaveBeenCalled();

        act(() => {
          jest.advanceTimersByTime(300);
        });

        // Called once with final value
        expect(onDebouncedChange).toHaveBeenCalledTimes(1);
        expect(onDebouncedChange).toHaveBeenCalledWith('hello');
      });

      it('Then shows inputValue as the latest typed value', () => {
        const { result } = renderHook(() =>
          useSearchInput({ debounceMs: 300 })
        );

        act(() => {
          result.current.setInputValue('h');
        });

        act(() => {
          result.current.setInputValue('he');
        });

        act(() => {
          result.current.setInputValue('hello');
        });

        expect(result.current.inputValue).toBe('hello');
        expect(result.current.debouncedValue).toBe(''); // Not yet debounced
      });
    });
  });

  describe('Given the user clears the search', () => {
    describe('When calling clear()', () => {
      it('Then clears both inputValue and debouncedValue immediately', () => {
        const { result } = renderHook(() =>
          useSearchInput({ initialValue: 'test' })
        );

        act(() => {
          result.current.clear();
        });

        expect(result.current.inputValue).toBe('');
        expect(result.current.debouncedValue).toBe('');
      });

      it('Then sets isDebouncing to false', () => {
        const { result } = renderHook(() =>
          useSearchInput({ debounceMs: 300 })
        );

        // Start typing
        act(() => {
          result.current.setInputValue('hello');
        });

        expect(result.current.isDebouncing).toBe(true);

        // Clear
        act(() => {
          result.current.clear();
        });

        expect(result.current.isDebouncing).toBe(false);
      });

      it('Then calls onDebouncedChange with empty string', () => {
        const onDebouncedChange = jest.fn();
        const { result } = renderHook(() =>
          useSearchInput({ initialValue: 'test', onDebouncedChange })
        );

        act(() => {
          result.current.clear();
        });

        expect(onDebouncedChange).toHaveBeenCalledWith('');
      });

      it('Then cancels any pending debounce', () => {
        const onDebouncedChange = jest.fn();
        const { result } = renderHook(() =>
          useSearchInput({ debounceMs: 300, onDebouncedChange })
        );

        act(() => {
          result.current.setInputValue('hello');
        });

        // Clear before debounce fires
        act(() => {
          result.current.clear();
        });

        // Advance past debounce time
        act(() => {
          jest.advanceTimersByTime(500);
        });

        // Should only have the clear call, not 'hello'
        expect(onDebouncedChange).toHaveBeenCalledTimes(1);
        expect(onDebouncedChange).toHaveBeenCalledWith('');
      });
    });
  });

  describe('Given custom debounce delay', () => {
    describe('When using a custom delay', () => {
      it('Then debounces with that delay', () => {
        const onDebouncedChange = jest.fn();
        const { result } = renderHook(() =>
          useSearchInput({ debounceMs: 500, onDebouncedChange })
        );

        act(() => {
          result.current.setInputValue('hello');
        });

        // After 300ms - should not have fired
        act(() => {
          jest.advanceTimersByTime(300);
        });

        expect(onDebouncedChange).not.toHaveBeenCalled();

        // After 500ms total - should fire
        act(() => {
          jest.advanceTimersByTime(200);
        });

        expect(onDebouncedChange).toHaveBeenCalledWith('hello');
      });
    });
  });
});
