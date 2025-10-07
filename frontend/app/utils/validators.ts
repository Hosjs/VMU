// Validation utilities
export const validators = {
  // Email validation
  email: (value: string): string | undefined => {
    if (!value) return 'Email là bắt buộc';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Email không hợp lệ';
    return undefined;
  },

  // Phone validation (Vietnam format)
  phone: (value: string): string | undefined => {
    if (!value) return 'Số điện thoại là bắt buộc';
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Số điện thoại không hợp lệ (VD: 0912345678)';
    }
    return undefined;
  },

  // Required field
  required: (fieldName: string) => (value: any): string | undefined => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} là bắt buộc`;
    }
    return undefined;
  },

  // Min length
  minLength: (min: number) => (value: string): string | undefined => {
    if (!value) return undefined;
    if (value.length < min) {
      return `Tối thiểu ${min} ký tự`;
    }
    return undefined;
  },

  // Max length
  maxLength: (max: number) => (value: string): string | undefined => {
    if (!value) return undefined;
    if (value.length > max) {
      return `Tối đa ${max} ký tự`;
    }
    return undefined;
  },

  // Number validation
  number: (value: string): string | undefined => {
    if (!value) return undefined;
    if (isNaN(Number(value))) {
      return 'Phải là số';
    }
    return undefined;
  },

  // Min value
  min: (minValue: number) => (value: string | number): string | undefined => {
    if (!value && value !== 0) return undefined;
    if (Number(value) < minValue) {
      return `Giá trị tối thiểu là ${minValue}`;
    }
    return undefined;
  },

  // Max value
  max: (maxValue: number) => (value: string | number): string | undefined => {
    if (!value && value !== 0) return undefined;
    if (Number(value) > maxValue) {
      return `Giá trị tối đa là ${maxValue}`;
    }
    return undefined;
  },

  // License plate validation (Vietnam format)
  licensePlate: (value: string): string | undefined => {
    if (!value) return 'Biển số xe là bắt buộc';
    // Format: 30A-12345 or 30A12345
    const plateRegex = /^[0-9]{2}[A-Z]{1,2}-?[0-9]{4,5}$/;
    if (!plateRegex.test(value.replace(/\s/g, ''))) {
      return 'Biển số xe không hợp lệ (VD: 30A-12345)';
    }
    return undefined;
  },

  // Tax code validation (Vietnam format)
  taxCode: (value: string): string | undefined => {
    if (!value) return undefined;
    // Format: 10 hoặc 13 số
    const taxRegex = /^[0-9]{10}$|^[0-9]{13}$/;
    if (!taxRegex.test(value)) {
      return 'Mã số thuế không hợp lệ (10 hoặc 13 số)';
    }
    return undefined;
  },

  // Date validation
  date: (value: string): string | undefined => {
    if (!value) return undefined;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Ngày không hợp lệ';
    }
    return undefined;
  },

  // Future date validation
  futureDate: (value: string): string | undefined => {
    if (!value) return undefined;
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return 'Ngày phải trong tương lai';
    }
    return undefined;
  },

  // Past date validation
  pastDate: (value: string): string | undefined => {
    if (!value) return undefined;
    const date = new Date(value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (date > today) {
      return 'Ngày phải trong quá khứ';
    }
    return undefined;
  },

  // Password validation
  password: (value: string): string | undefined => {
    if (!value) return 'Mật khẩu là bắt buộc';
    if (value.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Mật khẩu phải có ít nhất 1 chữ hoa';
    }
    if (!/[a-z]/.test(value)) {
      return 'Mật khẩu phải có ít nhất 1 chữ thường';
    }
    if (!/[0-9]/.test(value)) {
      return 'Mật khẩu phải có ít nhất 1 số';
    }
    return undefined;
  },

  // Confirm password validation
  confirmPassword: (password: string) => (value: string): string | undefined => {
    if (!value) return 'Xác nhận mật khẩu là bắt buộc';
    if (value !== password) {
      return 'Mật khẩu xác nhận không khớp';
    }
    return undefined;
  },

  // URL validation
  url: (value: string): string | undefined => {
    if (!value) return undefined;
    try {
      new URL(value);
      return undefined;
    } catch {
      return 'URL không hợp lệ';
    }
  },

  // Positive number
  positive: (value: string | number): string | undefined => {
    if (!value && value !== 0) return undefined;
    if (Number(value) <= 0) {
      return 'Giá trị phải lớn hơn 0';
    }
    return undefined;
  },

  // Non-negative number
  nonNegative: (value: string | number): string | undefined => {
    if (!value && value !== 0) return undefined;
    if (Number(value) < 0) {
      return 'Giá trị không được âm';
    }
    return undefined;
  },
};

// Compose multiple validators
export function composeValidators(...validators: Array<(value: any) => string | undefined>) {
  return (value: any): string | undefined => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return undefined;
  };
}

// Validate entire form
export function validateForm<T extends Record<string, any>>(
  values: T,
  validationRules: Record<keyof T, (value: any) => string | undefined>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const key in validationRules) {
    const error = validationRules[key](values[key]);
    if (error) {
      errors[key as string] = error;
    }
  }

  return errors;
}

