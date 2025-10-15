export interface Category {
  id: number;
  name: string;
  code: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: Category;
  children?: Category[];
  products_count?: number;
}

export interface Product {
  id: number;
  name: string;
  code: string;
  sku: string;
  description?: string;
  category_id: number;
  primary_warehouse_id?: number;
  vehicle_brand_id?: number;
  vehicle_model_id?: number;
  compatible_years?: string;
  is_universal: boolean;
  cost_price: number; // Giá nhập (admin only)
  suggested_price: number; // Giá đề xuất bán
  unit: string;
  main_image?: string;
  gallery_images?: string; // URL|URL|URL
  specifications?: string;
  is_stockable: boolean;
  track_by_serial: boolean;
  track_by_batch: boolean;
  shelf_life_days?: number;
  track_stock: boolean;
  has_warranty: boolean;
  warranty_months: number;
  supplier_id?: number;
  supplier_code?: string;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  primary_warehouse?: any;
  vehicle_brand?: any;
  vehicle_model?: any;
  supplier?: any;
  warehouse_stocks?: any[];
  total_stock?: number;
  available_stock?: number;
  reserved_stock?: number;
}

export interface CreateProductData {
  category_id: number;
  name: string;
  code: string;
  sku?: string;
  description?: string;
  primary_warehouse_id?: number;
  vehicle_brand_id?: number;
  vehicle_model_id?: number;
  compatible_years?: string;
  is_universal?: boolean;
  cost_price: number;
  suggested_price: number;
  unit: string;
  main_image?: string;
  gallery_images?: string;
  specifications?: string;
  is_stockable?: boolean;
  track_by_serial?: boolean;
  track_by_batch?: boolean;
  shelf_life_days?: number;
  track_stock?: boolean;
  has_warranty?: boolean;
  warranty_months?: number;
  supplier_id?: number;
  supplier_code?: string;
  min_stock_level?: number;
  max_stock_level?: number;
  reorder_point?: number;
  is_active?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {}
