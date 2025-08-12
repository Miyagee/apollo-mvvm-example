import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Validation rule function type
 * Returns error message string if invalid, null if valid
 */
export type ValidationRule<T, K extends keyof T> = (value: T[K], formData: T) => string | null;

/**
 * Validation rules for form fields
 */
export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T, K>;
};

/**
 * Options for useForm hook
 */
export interface UseFormOptions<T extends object> {
  /** Initial form values */
  initialValues: T;
  /** Validation rules for each field */
  validationRules?: ValidationRules<T>;
  /** Callback when form is submitted successfully */
  onSubmit?: (data: T) => Promise<void>;
}

/**
 * Return type for useForm hook
 */
export interface UseFormResult<T extends object> {
  /** Current form values */
  values: T;
  /** Field errors (only set after validation) */
  errors: Partial<Record<keyof T, string>>;
  /** Fields that have been touched (blurred) */
  touched: Partial<Record<keyof T, boolean>>;
  /** Whether form is currently submitting */
  isSubmitting: boolean;
  /** Whether form has been submitted at least once */
  isSubmitted: boolean;
  /** Set a single field value */
  setField: <K extends keyof T>(field: K, value: T[K]) => void;
  /** Mark a field as touched */
  touchField: (field: keyof T) => void;
  /** Validate all fields, returns true if valid */
  validate: () => boolean;
  /** Validate a single field */
  validateField: (field: keyof T) => string | null;
  /** Reset form to initial or new values */
  reset: (newValues?: T) => void;
  /** Handle form submission */
  handleSubmit: () => Promise<void>;
  /** Whether form is valid (no errors) */
  isValid: boolean;
  /** Whether form values differ from initial values */
  isDirty: boolean;
}

/**
 * Generic, reusable form state management hook
 *
 * @example
 * ```typescript
 * const form = useForm({
 *   initialValues: { name: '', email: '' },
 *   validationRules: {
 *     name: (v) => v.length < 1 ? 'Name is required' : null,
 *     email: (v) => !v.includes('@') ? 'Invalid email' : null,
 *   },
 *   onSubmit: async (data) => { await saveData(data); },
 * });
 * ```
 */
export function useForm<T extends object>({
  initialValues,
  validationRules = {},
  onSubmit,
}: UseFormOptions<T>): UseFormResult<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Keep track of initial values for dirty checking and reset
  const initialValuesRef = useRef<T>(initialValues);

  // Update initialValuesRef when initialValues prop changes
  useEffect(() => {
    initialValuesRef.current = initialValues;
  }, [initialValues]);

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (field: keyof T): string | null => {
      const rule = validationRules[field];
      if (!rule) return null;
      return rule(values[field], values);
    },
    [validationRules, values]
  );

  /**
   * Validate all fields
   */
  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const field of Object.keys(validationRules) as (keyof T)[]) {
      const error = validateField(field);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [validationRules, validateField]);

  /**
   * Set a single field value
   * Clears any existing error for that field
   */
  const setField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    setErrors((prev) => {
      if (prev[field]) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [field]: _, ...rest } = prev;
        return rest as Partial<Record<keyof T, string>>;
      }
      return prev;
    });
  }, []);

  /**
   * Mark a field as touched (typically on blur)
   * Validates the field if it has a validation rule
   */
  const touchField = useCallback(
    (field: keyof T) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Validate field on blur
      const error = validateField(field);
      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [validateField]
  );

  /**
   * Reset form to initial or new values
   */
  const reset = useCallback((newValues?: T) => {
    const resetValues = newValues ?? initialValuesRef.current;
    setValues(resetValues);
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
    if (newValues) {
      initialValuesRef.current = newValues;
    }
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    setIsSubmitted(true);

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof T, boolean>
    );
    setTouched(allTouched);

    // Validate all fields
    if (!validate()) {
      return;
    }

    if (!onSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  // Computed values
  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isSubmitted,
    setField,
    touchField,
    validate,
    validateField,
    reset,
    handleSubmit,
    isValid,
    isDirty,
  };
}
