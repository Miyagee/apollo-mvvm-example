import React from 'react';

/**
 * Props for the stateless SearchBar component
 *
 * All state is managed by the ViewModel and passed in via props.
 * The SearchBar is completely presentational.
 */
interface SearchBarProps {
  /** Current input value */
  value: string;
  /** Whether search is being debounced */
  isDebouncing?: boolean;
  /** Callback when input value changes */
  onChange: (value: string) => void;
  /** Callback to clear the search */
  onClear?: () => void;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * SearchBar - Stateless Search Input Component
 *
 * This component has NO internal state. All state (value, debouncing)
 * comes from props, making it:
 * - Easy to test (just render with props)
 * - Predictable (all state changes come from ViewModel)
 * - Reusable (can be used with different ViewModels)
 *
 * The debouncing logic is handled by the ViewModel (useSearchInput hook),
 * not by this component.
 *
 * @example
 * ```tsx
 * <SearchBar
 *   value={vm.searchInputValue}
 *   isDebouncing={vm.isSearchDebouncing}
 *   onChange={vm.setSearchInput}
 *   onClear={vm.clearSearch}
 *   placeholder="Search devices..."
 * />
 * ```
 */
export function SearchBar({
  value,
  isDebouncing = false,
  onChange,
  onClear,
  placeholder,
}: SearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }
  };

  return (
    <div className='mt-4 relative'>
      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
        <svg
          className={`h-5 w-5 transition-colors ${isDebouncing ? 'text-blue-500' : 'text-gray-400'}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
          />
        </svg>
      </div>
      <input
        type='text'
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        data-testid='search-input'
        className='w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
      />
      {value && (
        <button
          type='button'
          onClick={handleClear}
          data-testid='search-clear-button'
          className='absolute inset-y-0 right-0 pr-3 flex items-center'
        >
          <svg
            className='h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      )}
    </div>
  );
}
