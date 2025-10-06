export interface Order {
  id: number;
  customer_id: number;
  vehicle_id: number;
  order_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  final_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  created_by: number;
  assigned_to?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  customer?: any;
  vehicle?: any;
  items?: OrderItem[];
  creator?: any;
  assignee?: any;
}

export interface OrderItem {
  id: number;
  order_id: number;
  item_type: 'service' | 'product';
  item_id: number;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  item?: any;
}

export interface CreateOrderData {
  customer_id: number;
  vehicle_id: number;
  order_date: string;
  items: {
    item_type: 'service' | 'product';
    item_id: number;
    quantity: number;
    unit_price: number;
    discount?: number;
  }[];
  discount_amount?: number;
  tax_amount?: number;
  notes?: string;
  assigned_to?: number;
}

