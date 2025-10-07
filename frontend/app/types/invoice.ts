export interface Invoice {
  id: number;
  invoice_number: string;
  order_id: number;
  customer_id: number;
  vehicle_id?: number;
  issuer: 'thang_truong' | 'viet_nga'; // Ai xuất hóa đơn
  admin_only_access: boolean; // Chỉ admin được xem/sửa - QUAN TRỌNG
  issuing_warehouse_id?: number;
  invoice_date: string;
  due_date?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  customer_tax_code?: string;
  vehicle_info?: string;
  subtotal: number; // Tổng tiền trước thuế và giảm giá
  discount_amount: number;
  discount_percent: number;
  tax_amount: number;
  tax_percent: number;
  total_amount: number; // Tổng tiền cuối cùng
  actual_cost?: number; // Chi phí thực tế - CHỈ ADMIN XEM
  actual_profit?: number; // Lợi nhuận thực tế - CHỈ ADMIN XEM
  partner_settlement_cost: number; // Chi phí quyết toán với gara liên kết - CHỈ ADMIN XEM
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  paid_amount: number;
  remaining_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid' | 'overpaid';
  created_by: number;
  approved_by?: number;
  approved_at?: string;
  notes?: string;
  customer_notes?: string;
  terms_conditions?: string;
  attachment_urls?: string; // URL|URL|URL
  created_at: string;
  updated_at: string;
  order?: any;
  customer?: any;
  vehicle?: any;
  issuing_warehouse?: any;
  creator?: any;
  approver?: any;
  payments?: Payment[];
}

export interface Payment {
  id: number;
  payment_number: string;
  invoice_id: number;
  order_id: number;
  customer_id: number;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'digital_wallet' | 'installment' | 'check';
  payment_date: string;
  received_at?: string;
  reference_number?: string;
  bank_name?: string;
  account_number?: string;
  card_last_digits?: string;
  wallet_type?: string;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded' | 'cancelled';
  verification_status: 'unverified' | 'verified' | 'disputed';
  received_by: number;
  verified_by?: number;
  verified_at?: string;
  notes?: string;
  customer_notes?: string;
  attachment_urls?: string; // URL|URL|URL
  refund_amount: number;
  refund_date?: string;
  refund_reason?: string;
  refunded_by?: number;
  created_at: string;
  updated_at: string;
  invoice?: Invoice;
  order?: any;
  customer?: any;
  receiver?: any;
  verifier?: any;
}

export interface CreateInvoiceData {
  order_id: number;
  customer_id: number;
  vehicle_id?: number;
  issuer: 'thang_truong' | 'viet_nga';
  issuing_warehouse_id?: number;
  invoice_date: string;
  due_date?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  customer_tax_code?: string;
  discount_percent?: number;
  tax_percent?: number;
  notes?: string;
  customer_notes?: string;
  terms_conditions?: string;
}

export interface CreatePaymentData {
  invoice_id: number;
  order_id: number;
  customer_id: number;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'digital_wallet' | 'installment' | 'check';
  payment_date: string;
  reference_number?: string;
  bank_name?: string;
  account_number?: string;
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
