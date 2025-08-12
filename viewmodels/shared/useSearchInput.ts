import { useState, useCallback, useEffect, useRef } from 'react';

/** Default debounce delay in milliseconds */
const DEFAULT_DEBOUNCE_MS = 300;

export interface UseSearchInputOptions {
  /** Initial search value */
  initialValue?: string;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Callback when debounced value changes */
  onDebouncedChange?: (value: string) => void;
}

export interface UseSearchInputResult {
  /** Current input value (updates immediately) */
  inputValue: string;
  /** Debounced value (updates after delay) */
  debouncedValue: string;
  /** Whether input is currently being debounced */
  isDebouncing: boolean;
  /** Set the input value */
  setInputValue: (value: string) => void;
  /** Clear the input */
  clear: () => void;
}

/**
 * useSearchInput - ViewModel hook for search input with debouncing
 *
 * Manages both the immediate input value and the debounced value,
 * keeping the View component completely stateless.
 *
 * @example
 * ```typescript
 * const search = useSearchInput({
 *   debounceMs: 300,
 *   onDebouncedChange: (value) => console.log('Search:', value),
 * });
 *
 * // In View (stateless):
 * <SearchBar
 *   value={search.inputValue}
 *   isDebouncing={search.isDebouncing}
 *   onChange={search.setInputValue}
 *   onClear={search.clear}
 * />
 * ```
 */
export function useSearchInput({
  initialValue = '',
  debounceMs = DEFAULT_DEBOUNCE_MS,
  onDebouncedChange,
}: UseSearchInputOptions = {}): UseSearchInputResult {
  const [inputValue, setInputValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onDebouncedChangeRef = useRef(onDebouncedChange);

  // Keep callback ref up to date
  useEffect(() => {
    onDebouncedChangeRef.current = onDebouncedChange;
  }, [onDebouncedChange]);

  // Handle debouncing
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If values are different, we're debouncing
    if (inputValue !== debouncedValue) {
      setIsDebouncing(true);

      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(inputValue);
        setIsDebouncing(false);
        onDebouncedChangeRef.current?.(inputValue);
      }, debounceMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inputValue, debouncedValue, debounceMs]);

  const handleSetInputValue = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const clear = useCallback(() => {
    setInputValue('');
    setDebouncedValue('');
    setIsDebouncing(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onDebouncedChangeRef.current?.('');
  }, []);

  return {
    inputValue,
    debouncedValue,
    isDebouncing,
    setInputValue: handleSetInputValue,
    clear,
  };
}
