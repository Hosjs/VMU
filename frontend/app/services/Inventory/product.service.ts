import { apiService } from '../api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import type { Product } from '~/types/product';

export interface ProductFormData {
  name: string;
  sku: string;
  category_id: number;
  unit: string;
  price: number;
  stock_quantity: number;
  min_stock_level?: number;
  description?: string;
}

class ProductService {
  private readonly BASE_PATH = '/inventory/products';

  async getProducts(params: TableQueryParams): Promise<PaginatedResponse<Product>> {
    return apiService.getPaginated<Product>(this.BASE_PATH, params);
  }

  async getProductById(id: number): Promise<Product> {
    return apiService.get<Product>(`${this.BASE_PATH}/${id}`);
  }

  async getLowStockProducts(): Promise<Product[]> {
    return apiService.get<Product[]>(`${this.BASE_PATH}/low-stock`);
  }

  async createProduct(data: ProductFormData): Promise<Product> {
    return apiService.post<Product>(this.BASE_PATH, data);
  }

  async updateProduct(id: number, data: Partial<ProductFormData>): Promise<Product> {
    return apiService.put<Product>(`${this.BASE_PATH}/${id}`, data);
  }

  async deleteProduct(id: number): Promise<void> {
    return apiService.delete<void>(`${this.BASE_PATH}/${id}`);
  }
}

export const productService = new ProductService();

