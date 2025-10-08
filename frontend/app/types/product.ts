export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type: string; // 'service' hoặc 'product'
  image?: string;
  parent_id?: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: Category;
  children?: Category[];
}

export interface Product {
  id: number;
  name: string;
  code: string;
  sku: string;
  description?: string;
  category_id: number;
  primary_warehouse_id?: number;
  quote_price: number; // Giá báo cho khách
  settlement_price: number; // Giá thanh toán cho đối tác - CHỈ ADMIN XEM
  unit: string;
  main_image?: string;
  gallery_images?: string; // URL|URL|URL
  specifications?: string;
  is_stockable: boolean;
  track_by_serial: boolean;
  track_by_batch: boolean;
  shelf_life_days?: number;
  auto_transfer_enabled: boolean;
  transfer_threshold: number;
  track_stock: boolean;
  has_warranty: boolean;
  warranty_months: number;
  supplier_name?: string;
  supplier_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  primary_warehouse?: any;
}

export interface CreateProductData {
  category_id: number;
  name: string;
  code: string;
  sku?: string; // Make sku optional to match backend validation
  description?: string;
  primary_warehouse_id?: number;
  quote_price: number;
  settlement_price: number;
  unit: string;
  specifications?: string;
  is_stockable?: boolean;
  track_by_serial?: boolean;
  track_by_batch?: boolean;
  shelf_life_days?: number;
  auto_transfer_enabled?: boolean;
  transfer_threshold?: number;
  track_stock?: boolean;
  has_warranty?: boolean;
  warranty_months?: number;
  supplier_name?: string;
  supplier_code?: string;
  is_active?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  // No need for id in update data, it's in the URL
}
