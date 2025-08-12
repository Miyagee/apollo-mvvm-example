import { renderHook, act } from '@testing-library/react';
import { useForm, ValidationRules } from './useForm';

interface TestFormValues {
  name: string;
  email: string;
  age: number;
}

describe('useForm', () => {
  const defaultInitialValues: TestFormValues = {
    name: '',
    email: '',
    age: 0,
  };

  const defaultValidationRules: ValidationRules<TestFormValues> = {
    name: (value) => (value.length < 1 ? 'Name is required' : null),
    email: (value) => (!value.includes('@') ? 'Invalid email' : null),
    age: (value) => (value < 0 ? 'Age must be positive' : null),
  };

  describe('Given a form with initial values', () => {
    describe('When initialized', () => {
      it('Then has the initial values', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: { name: 'John', email: 'john@example.com', age: 25 },
          })
        );

        expect(result.current.values).toEqual({
          name: 'John',
          email: 'john@example.com',
          age: 25,
        });
      });

      it('Then has no errors initially', () => {
        const { result } = renderHook(() =>
          useForm({ initialValues: defaultInitialValues })
        );

        expect(result.current.errors).toEqual({});
      });

      it('Then has no touched fields initially', () => {
        const { result } = renderHook(() =>
          useForm({ initialValues: defaultInitialValues })
        );

        expect(result.current.touched).toEqual({});
      });

      it('Then is not submitting initially', () => {
        const { result } = renderHook(() =>
          useForm({ initialValues: defaultInitialValues })
        );

        expect(result.current.isSubmitting).toBe(false);
      });

      it('Then is not dirty initially', () => {
        const { result } = renderHook(() =>
          useForm({ initialValues: defaultInitialValues })
        );

        expect(result.current.isDirty).toBe(false);
      });

      it('Then is valid initially (no errors)', () => {
        const { result } = renderHook(() =>
          useForm({ initialValues: defaultInitialValues })
        );

        expect(result.current.isValid).toBe(true);
      });
    });
  });

  describe('Given a form with validation rules', () => {
    describe('When setting a field value', () => {
      it('Then updates the values state', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: defaultValidationRules,
          })
        );

        act(() => {
          result.current.setField('name', 'John');
        });

        expect(result.current.values.name).toBe('John');
      });

      it('Then clears any existing error for that field', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: defaultValidationRules,
          })
        );

        // First, trigger an error by touching and validating
        act(() => {
          result.current.touchField('name');
        });

        expect(result.current.errors.name).toBe('Name is required');

        // Now set a valid value
        act(() => {
          result.current.setField('name', 'John');
        });

        expect(result.current.errors.name).toBeUndefined();
      });

      it('Then marks the form as dirty', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: defaultValidationRules,
          })
        );

        act(() => {
          result.current.setField('name', 'John');
        });

        expect(result.current.isDirty).toBe(true);
      });
    });

    describe('When touching a field (blur)', () => {
      it('Then marks the field as touched', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: defaultValidationRules,
          })
        );

        act(() => {
          result.current.touchField('name');
        });

        expect(result.current.touched.name).toBe(true);
      });

      it('Then validates the field and sets error if invalid', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: defaultValidationRules,
          })
        );

        act(() => {
          result.current.touchField('name');
        });

        expect(result.current.errors.name).toBe('Name is required');
      });

      it('Then does not set error if field is valid', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: { ...defaultInitialValues, name: 'John' },
            validationRules: defaultValidationRules,
          })
        );

        act(() => {
          result.current.touchField('name');
        });

        expect(result.current.errors.name).toBeUndefined();
      });
    });

    describe('When validating the form', () => {
      it('Then returns true if all fields pass validation', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: { name: 'John', email: 'john@example.com', age: 25 },
            validationRules: defaultValidationRules,
          })
        );

        let isValid: boolean;
        act(() => {
          isValid = result.current.validate();
        });

        expect(isValid!).toBe(true);
        expect(result.current.errors).toEqual({});
      });

      it('Then returns false and sets errors if validation fails', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: defaultValidationRules,
          })
        );

        let isValid: boolean;
        act(() => {
          isValid = result.current.validate();
        });

        expect(isValid!).toBe(false);
        expect(result.current.errors.name).toBe('Name is required');
        expect(result.current.errors.email).toBe('Invalid email');
      });

      it('Then marks form as invalid when errors exist', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: defaultValidationRules,
          })
        );

        act(() => {
          result.current.validate();
        });

        expect(result.current.isValid).toBe(false);
      });
    });

    describe('When validating a single field', () => {
      it('Then returns the error message if invalid', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: defaultValidationRules,
          })
        );

        let error: string | null;
        act(() => {
          error = result.current.validateField('name');
        });

        expect(error!).toBe('Name is required');
      });

      it('Then returns null if valid', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: { ...defaultInitialValues, name: 'John' },
            validationRules: defaultValidationRules,
          })
        );

        let error: string | null;
        act(() => {
          error = result.current.validateField('name');
        });

        expect(error!).toBeNull();
      });

      it('Then returns null if no validation rule exists for field', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: {}, // No rules
          })
        );

        let error: string | null;
        act(() => {
          error = result.current.validateField('name');
        });

        expect(error!).toBeNull();
      });
    });

    describe('When submitting the form', () => {
      it('Then validates before calling onSubmit', async () => {
        const mockOnSubmit = jest.fn();
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: defaultValidationRules,
            onSubmit: mockOnSubmit,
          })
        );

        await act(async () => {
          await result.current.handleSubmit();
        });

        expect(mockOnSubmit).not.toHaveBeenCalled();
        expect(result.current.errors.name).toBe('Name is required');
      });

      it('Then sets isSubmitting during async operation', async () => {
        let resolveSubmit: () => void;
        const submitPromise = new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        });

        const mockOnSubmit = jest.fn(() => submitPromise);
        const { result } = renderHook(() =>
          useForm({
            initialValues: { name: 'John', email: 'john@example.com', age: 25 },
            validationRules: defaultValidationRules,
            onSubmit: mockOnSubmit,
          })
        );

        // Start submission
        let submitPromiseResult: Promise<void>;
        act(() => {
          submitPromiseResult = result.current.handleSubmit();
        });

        // Should be submitting
        expect(result.current.isSubmitting).toBe(true);

        // Complete submission
        await act(async () => {
          resolveSubmit!();
          await submitPromiseResult;
        });

        // Should no longer be submitting
        expect(result.current.isSubmitting).toBe(false);
      });

      it('Then calls onSubmit with current values on success', async () => {
        const mockOnSubmit = jest.fn();
        const validValues = { name: 'John', email: 'john@example.com', age: 25 };

        const { result } = renderHook(() =>
          useForm({
            initialValues: validValues,
            validationRules: defaultValidationRules,
            onSubmit: mockOnSubmit,
          })
        );

        await act(async () => {
          await result.current.handleSubmit();
        });

        expect(mockOnSubmit).toHaveBeenCalledWith(validValues);
      });

      it('Then marks all fields as touched on submit', async () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: defaultValidationRules,
          })
        );

        await act(async () => {
          await result.current.handleSubmit();
        });

        expect(result.current.touched.name).toBe(true);
        expect(result.current.touched.email).toBe(true);
        expect(result.current.touched.age).toBe(true);
      });

      it('Then sets isSubmitted to true', async () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: defaultValidationRules,
          })
        );

        expect(result.current.isSubmitted).toBe(false);

        await act(async () => {
          await result.current.handleSubmit();
        });

        expect(result.current.isSubmitted).toBe(true);
      });

      it('Then resets isSubmitting even if onSubmit throws', async () => {
        const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Submit failed'));
        const validValues = { name: 'John', email: 'john@example.com', age: 25 };

        const { result } = renderHook(() =>
          useForm({
            initialValues: validValues,
            validationRules: defaultValidationRules,
            onSubmit: mockOnSubmit,
          })
        );

        await act(async () => {
          try {
            await result.current.handleSubmit();
          } catch {
            // Expected to throw
          }
        });

        expect(result.current.isSubmitting).toBe(false);
      });
    });

    describe('When resetting the form', () => {
      it('Then restores initial values', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: defaultValidationRules,
          })
        );

        act(() => {
          result.current.setField('name', 'John');
          result.current.setField('email', 'john@example.com');
        });

        act(() => {
          result.current.reset();
        });

        expect(result.current.values).toEqual(defaultInitialValues);
      });

      it('Then clears all errors', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: defaultValidationRules,
          })
        );

        act(() => {
          result.current.validate();
        });

        expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);

        act(() => {
          result.current.reset();
        });

        expect(result.current.errors).toEqual({});
      });

      it('Then clears all touched state', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: defaultValidationRules,
          })
        );

        act(() => {
          result.current.touchField('name');
          result.current.touchField('email');
        });

        act(() => {
          result.current.reset();
        });

        expect(result.current.touched).toEqual({});
      });

      it('Then resets isSubmitted to false', async () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: defaultValidationRules,
          })
        );

        await act(async () => {
          await result.current.handleSubmit();
        });

        expect(result.current.isSubmitted).toBe(true);

        act(() => {
          result.current.reset();
        });

        expect(result.current.isSubmitted).toBe(false);
      });

      it('Then marks form as not dirty', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: defaultValidationRules,
          })
        );

        act(() => {
          result.current.setField('name', 'John');
        });

        expect(result.current.isDirty).toBe(true);

        act(() => {
          result.current.reset();
        });

        expect(result.current.isDirty).toBe(false);
      });

      it('Then accepts new initial values when provided', () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            validationRules: defaultValidationRules,
          })
        );

        const newValues = { name: 'Jane', email: 'jane@example.com', age: 30 };

        act(() => {
          result.current.reset(newValues);
        });

        expect(result.current.values).toEqual(newValues);
        expect(result.current.isDirty).toBe(false);
      });
    });
  });

  describe('Given a form without validation rules', () => {
    describe('When submitting', () => {
      it('Then calls onSubmit directly', async () => {
        const mockOnSubmit = jest.fn();
        const { result } = renderHook(() =>
          useForm({
            initialValues: defaultInitialValues,
            onSubmit: mockOnSubmit,
          })
        );

        await act(async () => {
          await result.current.handleSubmit();
        });

        expect(mockOnSubmit).toHaveBeenCalledWith(defaultInitialValues);
      });
    });
  });

  describe('Given a form without onSubmit callback', () => {
    describe('When submitting', () => {
      it('Then validates but does not throw', async () => {
        const { result } = renderHook(() =>
          useForm({
            initialValues: { name: 'John', email: 'john@example.com', age: 25 },
            validationRules: defaultValidationRules,
          })
        );

        await act(async () => {
          await result.current.handleSubmit();
        });

        // Should complete without error
        expect(result.current.isSubmitting).toBe(false);
      });
    });
  });

  describe('Given cross-field validation rules', () => {
    describe('When validating with access to all form data', () => {
      it('Then can validate based on other field values', () => {
        interface PasswordForm {
          password: string;
          confirmPassword: string;
        }

        const { result } = renderHook(() =>
          useForm<PasswordForm>({
            initialValues: { password: 'secret', confirmPassword: 'different' },
            validationRules: {
              confirmPassword: (value, formData) =>
                value !== formData.password ? 'Passwords must match' : null,
            },
          })
        );

        act(() => {
          result.current.touchField('confirmPassword');
        });

        expect(result.current.errors.confirmPassword).toBe('Passwords must match');
      });
    });
  });
});
