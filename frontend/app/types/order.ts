export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  vehicle_id?: number;
  service_request_id?: number;
  type: 'service' | 'product' | 'mixed';
  status: 'draft' | 'quoted' | 'confirmed' | 'in_progress' | 'completed' | 'delivered' | 'paid' | 'cancelled';
  quote_total: number; // Tổng báo giá cho khách
  settlement_total: number; // Tổng thanh toán cho đối tác - CHỈ ADMIN XEM
  discount: number;
  tax_amount: number;
  final_amount: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  payment_method?: 'cash' | 'transfer' | 'card' | 'installment';
  paid_amount: number;
  salesperson_id?: number;
  technician_id?: number; // Kỹ thuật viên chính Thắng Trường
  accountant_id?: number;
  partner_provider_id?: number; // Gara liên kết nhận sửa
  partner_coordinator_id?: number; // Người điều phối bên gara liên kết
  partner_coordinator_name?: string;
  partner_coordinator_phone?: string;
  quote_date?: string;
  confirmed_date?: string;
  start_date?: string;
  completion_date?: string;
  delivery_date?: string;
  partner_handover_date?: string; // Ngày bàn giao cho gara liên kết
  partner_return_date?: string; // Ngày nhận lại từ gara liên kết
  notes?: string;
  attachment_urls?: string; // URL|URL|URL
  created_at: string;
  updated_at: string;
  customer?: any;
  vehicle?: any;
  service_request?: any;
  items?: OrderItem[];
  salesperson?: any;
  technician?: any;
  accountant?: any;
  partner_provider?: any;
}

export interface OrderItem {
  id: number;
  order_id: number;
  item_type: 'service' | 'product';
  service_id?: number;
  product_id?: number;
  item_name: string;
  item_code: string;
  item_description?: string;
  quantity: number;
  unit: string;
  quote_unit_price: number; // Giá báo cho khách
  quote_total_price: number;
  settlement_unit_price: number; // Giá quyết toán với đối tác - CHỈ ADMIN XEM
  settlement_total_price: number; // CHỈ ADMIN XEM
  discount_amount: number;
  discount_percent: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_technician?: number;
  partner_technician_id?: number; // Kỹ thuật viên gara liên kết
  partner_technician_name?: string;
  start_time?: string;
  completion_time?: string;
  actual_duration?: number;
  has_warranty: boolean;
  warranty_months: number;
  warranty_start_date?: string;
  warranty_end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  service?: any;
  product?: any;
}

export interface CreateOrderData {
  customer_id: number;
  vehicle_id?: number;
  service_request_id?: number;
  type: 'service' | 'product' | 'mixed';
  quote_date?: string;
  partner_provider_id?: number;
  partner_coordinator_name?: string;
  partner_coordinator_phone?: string;
  items: {
    item_type: 'service' | 'product';
    service_id?: number;
    product_id?: number;
    item_name: string;
    item_code: string;
    quantity: number;
    unit: string;
    quote_unit_price: number;
    settlement_unit_price: number;
    discount_percent?: number;
  }[];
  discount?: number;
  notes?: string;
}

export interface UpdateOrderData extends Partial<CreateOrderData> {
  id: number;
  status?: 'draft' | 'quoted' | 'confirmed' | 'in_progress' | 'completed' | 'delivered' | 'paid' | 'cancelled';
  payment_status?: 'pending' | 'partial' | 'paid' | 'refunded';
}
