import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { z, ZodSchema } from 'zod';
import { useToast } from '@/contexts/ToastContext';

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: ZodSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Custom Form Hook with Zod Validation
 * 
 * @example
 * const { values, errors, handleChange, handleSubmit } = useForm({
 *   initialValues: { email: '', password: '' },
 *   validationSchema: LoginSchema,
 *   onSubmit: async (values) => {
 *     await loginUser(values);
 *   }
 * });
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormOptions<T>) {
  const toast = useToast();

  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: false,
  });

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (name: keyof T, value: any): string | undefined => {
      if (!validationSchema) return undefined;

      try {
        // Validate the full object with just this field changed
        // Zod v4 doesn't expose .shape, so we validate inline
        const testObj = { ...({} as T), [name]: value };
        validationSchema.parse(testObj);
        return undefined;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.issues.find(e => e.path[0] === name);
          return fieldError?.message;
        }
        return 'خطأ في التحقق من البيانات';
      }
    },
    [validationSchema]
  );

  /**
   * Validate all form fields
   */
  const validateForm = useCallback((): boolean => {
    if (!validationSchema) return true;

    try {
      validationSchema.parse(state.values);
      setState((prev) => ({ ...prev, errors: {}, isValid: true }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof T, string>> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof T] = err.message;
          }
        });
        setState((prev) => ({ ...prev, errors, isValid: false }));
        return false;
      }
      return false;
    }
  }, [state.values, validationSchema]);

  /**
   * Handle input change
   */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldValue =
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

      setState((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          [name]: fieldValue,
        },
        // Clear error on change if validateOnChange is enabled
        ...(validateOnChange && {
          errors: {
            ...prev.errors,
            [name]: validateField(name as keyof T, fieldValue),
          },
        }),
      }));
    },
    [validateField, validateOnChange]
  );

  /**
   * Handle field blur
   */
  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      setState((prev) => ({
        ...prev,
        touched: {
          ...prev.touched,
          [name]: true,
        },
        ...(validateOnBlur && {
          errors: {
            ...prev.errors,
            [name]: validateField(name as keyof T, value),
          },
        }),
      }));
    },
    [validateField, validateOnBlur]
  );

  /**
   * Set field value programmatically
   */
  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [name]: value,
      },
    }));
  }, []);

  /**
   * Set field error programmatically
   */
  const setFieldError = useCallback((name: keyof T, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        [name]: error,
      },
    }));
  }, []);

  /**
   * Set multiple field values
   */
  const setValues = useCallback((values: Partial<T>) => {
    setState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        ...values,
      },
    }));
  }, []);

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: false,
    });
  }, [initialValues]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e?: FormEvent<HTMLFormElement>) => {
      if (e) {
        e.preventDefault();
      }

      // Validate form
      const isValid = validateForm();
      if (!isValid) {
        toast.error('يرجى تصحيح الأخطاء في النموذج');
        return;
      }

      // Submit form
      setState((prev) => ({ ...prev, isSubmitting: true }));

      try {
        await onSubmit(state.values);
        // Reset form after successful submission
        // resetForm();
      } catch (error) {
        console.error('Form submission error:', error);
        toast.error(
          error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال النموذج'
        );
      } finally {
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [state.values, onSubmit, validateForm, toast]
  );

  /**
   * Get field props for easy binding
   */
  const getFieldProps = useCallback(
    (name: keyof T) => ({
      name: name as string,
      value: state.values[name] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: state.touched[name] ? state.errors[name] : undefined,
    }),
    [state.values, state.errors, state.touched, handleChange, handleBlur]
  );

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setValues,
    resetForm,
    validateForm,
    getFieldProps,
  };
}
