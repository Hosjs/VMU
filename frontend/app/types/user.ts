export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  birth_date?: string;
  gender?: string;
  address?: string;
  employee_code?: string;
  position?: string;
  department?: string;
  hire_date?: string;
  salary?: number;
  role_id?: number;
  role?: {
    id: number;
    name: string;
    display_name: string;
  };
  is_active: boolean;
  notes?: string;
  custom_permissions?: Record<string, string[]>;
  created_at: string;
  updated_at: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  employee_code?: string;
  position?: string;
  department?: string;
  hire_date?: string;
  salary?: number;
  role_id?: number;
  is_active: boolean;
  notes?: string;
  custom_permissions?: Record<string, string[]>;
}

