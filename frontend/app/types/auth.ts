export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  permissions?: string[];
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: Role;
  role_id: number;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  token_type: string;
  expires_in?: number;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  updateUser: (user: AuthUser) => void;
}

