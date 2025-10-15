import { apiService } from './api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import type { Category } from '~/types/product';

export interface CategoryFormData {
  name: string;
  code: string;
  slug: string;
  description?: string;
  parent_id?: number;
  image?: string;
  sort_order?: number;
  is_active?: boolean;
}

class CategoryService {
  private readonly BASE_PATH = '/admin/categories';

  /**
   * Get paginated list of categories (for admin management)
   */
  async getCategoriesPaginated(params: TableQueryParams): Promise<PaginatedResponse<Category>> {
    return apiService.getPaginated<Category>(this.BASE_PATH, params);
  }

  /**
   * Get all categories (for dropdowns/selects) - requests high per_page
   */
  async getCategories(params?: {
    search?: string;
    parent_id?: number | null;
    is_active?: boolean;
  }): Promise<Category[]> {
    const queryParams = {
      page: 1,
      per_page: 1000, // Get all categories for dropdowns
      ...params,
    };
    const response = await apiService.getPaginated<Category>(this.BASE_PATH, queryParams);
    return response.data; // Return just the data array
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
  async updateCategoryOrder(categories: Array<{ id: number; sort_order: number }>): Promise<void> {
    return apiService.post<void>(`${this.BASE_PATH}/update-order`, { categories });
  }
}

export const categoryService = new CategoryService();
