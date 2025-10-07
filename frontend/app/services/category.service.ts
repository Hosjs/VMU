import { apiService } from './api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import type { Category } from '~/types/product';

export interface CategoryFormData {
  name: string;
  code?: string;
  type: 'service' | 'product' | 'both';
  description?: string;
  parent_id?: number;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
}

class CategoryService {
  private readonly BASE_PATH = '/admin/categories';

  /**
   * Get all categories (without pagination)
   */
  async getCategories(params?: {
    search?: string;
    type?: string;
    is_active?: boolean;
  }): Promise<Category[]> {
    return apiService.get<Category[]>(this.BASE_PATH, params);
  }

  /**
   * Get single category by ID
   */
  async getCategoryById(id: number): Promise<Category> {
    return apiService.get<Category>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Create new category
   */
  async createCategory(data: CategoryFormData): Promise<Category> {
    return apiService.post<Category>(this.BASE_PATH, data);
  }

  /**
   * Update existing category
   */
  async updateCategory(id: number, data: Partial<CategoryFormData>): Promise<Category> {
    return apiService.put<Category>(`${this.BASE_PATH}/${id}`, data);
  }

  /**
   * Delete category
   */
  async deleteCategory(id: number): Promise<void> {
    return apiService.delete<void>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Update category display order
   */
  async updateOrder(categories: Array<{ id: number; display_order: number }>): Promise<void> {
    return apiService.post<void>(`${this.BASE_PATH}/update-order`, { categories });
  }
}

export const categoryService = new CategoryService();

