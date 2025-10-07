// Warranty types
export interface Warranty {
  id: number;
  warranty_number: string;
  order_id: number;
  order_item_id: number;
  customer_id: number;
  vehicle_id?: number;
  type: 'service' | 'product';
  item_name: string;
  item_code: string;
  start_date: string;
  end_date: string;
  warranty_months: number;
  warranty_terms?: string;
  covered_issues?: string; // Danh sách vấn đề, ngăn cách bởi |
  excluded_issues?: string; // Danh sách vấn đề, ngăn cách bởi |
  status: 'active' | 'expired' | 'used' | 'cancelled';
  usage_count: number;
  max_usage?: number;
  notes?: string;
  attachment_urls?: string; // URL|URL|URL
  created_at: string;
  updated_at: string;
  order?: any;
  customer?: any;
  vehicle?: any;
}

export interface CreateWarrantyData {
  order_id: number;
  order_item_id: number;
  customer_id: number;
  vehicle_id?: number;
  type: 'service' | 'product';
  item_name: string;
  item_code: string;
  warranty_months: number;
  warranty_terms?: string;
  covered_issues?: string;
  excluded_issues?: string;
}
// Settlement and Payment types for Partner reconciliation
export interface Settlement {
  id: number;
  settlement_number: string;
  order_id: number;
  invoice_id?: number;
  provider_id?: number;
  provider_name: string;
  provider_code?: string;
  provider_contact?: string;
  provider_phone?: string;
  provider_email?: string;
  provider_address?: string;
  provider_tax_code?: string;
  provider_bank_account?: string;
  type: 'service' | 'product' | 'mixed';
  work_description?: string;
  work_start_date?: string;
  work_completion_date?: string;
  settlement_subtotal: number;
  settlement_tax_amount: number;
  settlement_tax_percent: number;
  settlement_total: number;
  commission_amount: number;
  commission_percent: number;
  deduction_amount: number;
  final_payment: number;
  customer_quoted_total?: number;
  profit_margin?: number;
  profit_percent?: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'paid' | 'completed' | 'disputed';
  payment_status: 'unpaid' | 'partial' | 'paid';
  paid_amount: number;
  payment_method?: 'cash' | 'transfer' | 'check';
  payment_due_date?: string;
  payment_date?: string;
  created_by: number;
  approved_by?: number;
  accountant_id?: number;
  approved_at?: string;
  notes?: string;
  provider_notes?: string;
  attachment_urls?: string; // URL|URL|URL
  work_evidence_urls?: string; // URL|URL|URL
  created_at: string;
  updated_at: string;
  order?: any;
  invoice?: any;
  provider?: any;
  payments?: SettlementPayment[];
}

export interface SettlementPayment {
  id: number;
  payment_number: string;
  settlement_id: number;
  provider_id?: number;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'check';
  payment_date: string;
  processed_at?: string;
  reference_number?: string;
  bank_name?: string;
  account_number?: string;
  check_number?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  approval_status: 'pending' | 'approved' | 'rejected';
  created_by: number;
  approved_by?: number;
  processed_by?: number;
  approved_at?: string;
  approval_notes?: string;
  rejection_reason?: string;
  notes?: string;
  attachment_urls?: string; // URL|URL|URL
  provider_confirmed: boolean;
  provider_confirmed_at?: string;
  provider_notes?: string;
  created_at: string;
  updated_at: string;
  settlement?: Settlement;
  provider?: any;
}

export interface CreateSettlementData {
  order_id: number;
  invoice_id?: number;
  provider_id?: number;
  provider_name: string;
  provider_code?: string;
  type: 'service' | 'product' | 'mixed';
  work_description?: string;
  work_start_date?: string;
  work_completion_date?: string;
  settlement_subtotal: number;
  settlement_tax_percent?: number;
  commission_percent?: number;
  deduction_amount?: number;
  payment_due_date?: string;
  notes?: string;
}

export interface CreateSettlementPaymentData {
  settlement_id: number;
  provider_id?: number;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'check';
  payment_date: string;
  reference_number?: string;
  bank_name?: string;
  account_number?: string;
  check_number?: string;
  notes?: string;
}

