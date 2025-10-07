import { apiService } from './api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import type { Product, CreateProductData, UpdateProductData } from '~/types/product';

export interface ProductStatistics {
  total: number;
  active: number;
  inactive: number;
  stockable: number;
  with_warranty: number;
  total_value: number;
  low_stock_count: number;
}

class ProductService {
  private readonly BASE_PATH = '/admin/products';

  /**
   * Get paginated list of products
   */
  async getProducts(params: TableQueryParams): Promise<PaginatedResponse<Product>> {
    return apiService.getPaginated<Product>(this.BASE_PATH, params);
  }

  /**
   * Get single product by ID
   */
  async getProductById(id: number): Promise<Product> {
    return apiService.get<Product>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Create new product
   */
  async createProduct(data: CreateProductData): Promise<Product> {
    return apiService.post<Product>(this.BASE_PATH, data);
  }

  /**
   * Update existing product
   */
  async updateProduct(id: number, data: UpdateProductData): Promise<Product> {
    return apiService.put<Product>(`${this.BASE_PATH}/${id}`, data);
  }

  /**
   * Delete product (deactivate)
   */
  async deleteProduct(id: number): Promise<void> {
    return apiService.delete<void>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Get product statistics
   */
  async getStatistics(): Promise<ProductStatistics> {
    return apiService.get<ProductStatistics>(`${this.BASE_PATH}-statistics`);
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(params: TableQueryParams): Promise<PaginatedResponse<Product>> {
    return apiService.getPaginated<Product>(`${this.BASE_PATH}-low-stock`, params);
  }
}

export const productService = new ProductService();

