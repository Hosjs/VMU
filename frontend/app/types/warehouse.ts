// Warehouse and Stock Management types
export interface Warehouse {
  id: number;
  code: string; // VN (Việt Nga), GT1, GT2, etc.
  name: string;
  type: 'main' | 'partner'; // main: Việt Nga, partner: gara liên kết
  address: string;
  ward?: string;
  district: string;
  province: string;
  postal_code?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  provider_id?: number;
  is_main_warehouse: boolean; // Việt Nga = true
  can_receive_transfers: boolean;
  can_send_transfers: boolean;
  priority_order: number;
  tax_exempt_transfers: boolean;
  tax_registration?: string;
  is_active: boolean;
  last_inventory_date?: string;
  manager_id?: number;
  notes?: string;
  operating_hours?: string; // Mon:08:00-17:00|Tue:08:00-17:00
  created_at: string;
  updated_at: string;
  provider?: any;
  manager?: any;
}

export interface WarehouseStock {
  id: number;
  warehouse_id: number;
  product_id: number;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  unit_cost: number;
  total_value: number;
  min_stock: number;
  max_stock: number;
  reorder_point: number;
  economic_order_quantity: number;
  location_code?: string; // A-01-01
  shelf?: string;
  row?: string;
  position?: string;
  last_movement_date?: string;
  last_stocktake_date?: string;
  movement_count: number;
  is_locked: boolean;
  is_damaged: boolean;
  is_expired: boolean;
  expiry_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  warehouse?: Warehouse;
  product?: any;
}

export interface StockTransfer {
  id: number;
  transfer_number: string;
  from_warehouse_id: number;
  to_warehouse_id: number;
  type: 'internal' | 'inter_company';
  reason: 'restock' | 'customer_request' | 'maintenance' | 'return' | 'adjustment';
  order_id?: number;
  status: 'draft' | 'pending' | 'in_transit' | 'received' | 'completed' | 'cancelled';
  transfer_date: string;
  expected_arrival?: string;
  actual_arrival?: string;
  transport_method?: string;
  tracking_number?: string;
  is_tax_exempt: boolean;
  tax_exemption_code?: string;
  tax_amount: number;
  tax_notes?: string;
  total_cost: number;
  shipping_cost: number;
  insurance_cost: number;
  created_by: number;
  approved_by?: number;
  sent_by?: number;
  received_by?: number;
  approved_at?: string;
  sent_at?: string;
  received_at?: string;
  notes?: string;
  shipping_instructions?: string;
  attachment_urls?: string; // URL|URL|URL
  created_at: string;
  updated_at: string;
  from_warehouse?: Warehouse;
  to_warehouse?: Warehouse;
  items?: StockTransferItem[];
}

export interface StockTransferItem {
  id: number;
  stock_transfer_id: number;
  product_id: number;
  requested_quantity: number;
  sent_quantity: number;
  received_quantity: number;
  damaged_quantity: number;
  unit_cost: number;
  total_cost: number;
  product_name: string;
  product_code: string;
  product_sku: string;
  from_location?: string;
  to_location?: string;
  status: 'pending' | 'packed' | 'shipped' | 'received' | 'damaged' | 'lost';
  batch_number?: string;
  serial_number?: string;
  expiry_date?: string;
  packing_notes?: string;
  packed_by?: number;
  received_by?: number;
  packed_at?: string;
  received_at?: string;
  notes?: string;
  quality_check_result?: string;
  quality_check_notes?: string;
  created_at: string;
  updated_at: string;
  product?: any;
}

export interface StockMovement {
  id: number;
  warehouse_id: number;
  product_id: number;
  type: 'in' | 'out' | 'transfer_in' | 'transfer_out' | 'adjustment' | 'return';
  quantity: number; // Âm nếu xuất, dương nếu nhập
  unit_cost: number;
  total_cost: number;
  stock_after: number;
  order_id?: number;
  stock_transfer_id?: number;
  invoice_id?: number;
  direct_sale_id?: number;
  reference_number?: string;
  movement_reason: 'sale' | 'purchase' | 'transfer' | 'return' | 'damage' | 'expired' | 'theft' | 'adjustment' | 'direct_sale' | 'service_use';
  is_taxable: boolean;
  tax_amount: number;
  tax_rate: number;
  created_by: number;
  movement_date: string;
  notes?: string;
  batch_number?: string;
  serial_numbers?: string; // Ngăn cách bởi dấu phẩy
  expiry_date?: string;
  created_at: string;
  updated_at: string;
  warehouse?: Warehouse;
  product?: any;
}

export interface CreateWarehouseData {
  code: string;
  name: string;
  type: 'main' | 'partner';
  address: string;
  ward?: string;
  district: string;
  province: string;
  postal_code?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  provider_id?: number;
  is_main_warehouse?: boolean;
  manager_id?: number;
  notes?: string;
}

export interface CreateStockTransferData {
  from_warehouse_id: number;
  to_warehouse_id: number;
  type: 'internal' | 'inter_company';
  reason: 'restock' | 'customer_request' | 'maintenance' | 'return' | 'adjustment';
  order_id?: number;
  transfer_date: string;
  expected_arrival?: string;
  notes?: string;
  items: {
    product_id: number;
    requested_quantity: number;
    unit_cost: number;
  }[];
}

