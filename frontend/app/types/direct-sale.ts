// Direct Sales types (Bán hàng trực tiếp từ Việt Nga)
export interface DirectSale {
  id: number;
  sale_number: string;
  warehouse_id: number; // Phải là kho Việt Nga
  customer_id?: number;
  customer_name: string;
  customer_phone?: string;
  customer_id_number?: string;
  customer_address?: string;
  sale_type: 'retail' | 'wholesale' | 'employee' | 'internal';
  subtotal: number;
  discount_amount: number;
  discount_percent: number;
  tax_amount: number;
  total_amount: number;
  total_cost: number; // THÔNG TIN NHẠY CẢM - CHỈ ADMIN
  gross_profit: number; // THÔNG TIN NHẠY CẢM - CHỈ ADMIN
  profit_margin: number; // THÔNG TIN NHẠY CẢM - CHỈ ADMIN
  payment_method: 'cash' | 'transfer' | 'card' | 'credit';
  payment_status: 'pending' | 'paid' | 'partial' | 'credit';
  paid_amount: number;
  payment_due_date?: string;
  visibility_level: 'admin_only' | 'manager' | 'accountant'; // Quyền truy cập
  is_confidential: boolean;
  approval_status: 'draft' | 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approved_at?: string;
  approval_notes?: string;
  salesperson_id: number;
  created_by: number;
  sale_date: string;
  delivery_date?: string;
  notes?: string;
  customer_notes?: string;
  internal_memo?: string; // Chỉ admin
  attachment_urls?: string; // URL|URL|URL
  created_at: string;
  updated_at: string;
  warehouse?: any;
  customer?: any;
  salesperson?: any;
  items?: DirectSaleItem[];
}

export interface DirectSaleItem {
  id: number;
  direct_sale_id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  product_sku: string;
  product_description?: string;
  quantity: number;
  unit: string;
  unit_price: number; // NHẠY CẢM
  line_total: number; // NHẠY CẢM
  discount_amount: number;
  unit_cost: number; // CHỈ ADMIN XEM
  total_cost: number; // CHỈ ADMIN XEM
  line_profit: number; // CHỈ ADMIN XEM
  profit_margin: number; // CHỈ ADMIN XEM
  tax_rate: number;
  tax_amount: number;
  is_tax_exempt: boolean;
  warehouse_location?: string;
  batch_number?: string;
  serial_number?: string;
  expiry_date?: string;
  has_warranty: boolean;
  warranty_months: number;
  warranty_start_date?: string;
  warranty_end_date?: string;
  status: 'pending' | 'picked' | 'packed' | 'delivered' | 'returned';
  picked_by?: number;
  picked_at?: string;
  notes?: string;
  customer_notes?: string;
  stock_movement_id?: number;
  created_at: string;
  updated_at: string;
  product?: any;
}

export interface CreateDirectSaleData {
  warehouse_id: number;
  customer_id?: number;
  customer_name: string;
  customer_phone?: string;
  customer_id_number?: string;
  customer_address?: string;
  sale_type: 'retail' | 'wholesale' | 'employee' | 'internal';
  sale_date: string;
  payment_method: 'cash' | 'transfer' | 'card' | 'credit';
  discount_percent?: number;
  notes?: string;
  items: {
    product_id: number;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
  }[];
}

