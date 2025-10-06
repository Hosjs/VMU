export interface Category {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: Category;
  children?: Category[];
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  sku: string;
  description?: string;
  unit: string;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  location?: string;
  barcode?: string;
  supplier_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  supplier?: any;
}

export interface CreateProductData {
  category_id: number;
  name: string;
  sku: string;
  description?: string;
  unit: string;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  location?: string;
  barcode?: string;
  supplier_id?: number;
  is_active?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: number;
}

