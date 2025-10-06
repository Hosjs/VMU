import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  validate?: (values: T) => Record<string, string>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field changes
    if (errors[name as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    // Validate on blur
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors[name as string]) {
        setErrors(prev => ({
          ...prev,
          [name as string]: validationErrors[name as string],
        }));
      }
    }
  }, [validate, values]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Validate all fields
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce((acc, key) => ({
          ...acc,
          [key]: true,
        }), {});
        setTouched(allTouched);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error: any) {
      // Handle API validation errors
      if (error.data?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.keys(error.data.errors).forEach(key => {
          apiErrors[key] = error.data.errors[key][0];
        });
        setErrors(apiErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, values, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    handleChange(name, value);
  }, [handleChange]);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({
      ...prev,
      [name as string]: error,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    setValues,
  };
}

