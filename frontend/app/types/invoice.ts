export interface Invoice {
  id: number;
  order_id: number;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  paid_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  order?: any;
  creator?: any;
  payments?: Payment[];
}

export interface Payment {
  id: number;
  invoice_id?: number;
  order_id?: number;
  payment_date: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'card' | 'e_wallet';
  reference_number?: string;
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  invoice?: Invoice;
  order?: any;
  creator?: any;
}

export interface CreateInvoiceData {
  order_id: number;
  invoice_date: string;
  due_date: string;
  notes?: string;
}

export interface CreatePaymentData {
  invoice_id?: number;
  order_id?: number;
  payment_date: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'card' | 'e_wallet';
  reference_number?: string;
  notes?: string;
}
// Common types used across the application

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface FilterConfig {
  [key: string]: any;
}

export interface TableQueryParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: SortDirection;
  search?: string;
  filters?: FilterConfig;
}

export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

