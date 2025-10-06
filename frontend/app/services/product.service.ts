import type { Product, CreateProductData, UpdateProductData, Category } from '~/types/product';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import { api } from '~/utils/api';
import { authService } from '~/utils/auth';

export const productService = {
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<Product>> {
    const token = authService.getToken();
    const queryString = new URLSearchParams(params as any).toString();
    return api.get<PaginatedResponse<Product>>(
      `/products${queryString ? `?${queryString}` : ''}`,
      token || undefined
    );
  },

  async getById(id: number): Promise<Product> {
    const token = authService.getToken();
    return api.get<Product>(`/products/${id}`, token || undefined);
  },

  async create(data: CreateProductData): Promise<Product> {
    const token = authService.getToken();
    return api.post<Product>('/products', data, token || undefined);
  },

  async update(id: number, data: UpdateProductData): Promise<Product> {
    const token = authService.getToken();
    return api.put<Product>(`/products/${id}`, data, token || undefined);
  },

  async delete(id: number): Promise<void> {
    const token = authService.getToken();
    return api.delete<void>(`/products/${id}`, token || undefined);
  },

  async updateStock(id: number, quantity: number, type: 'add' | 'subtract'): Promise<Product> {
    const token = authService.getToken();
    return api.post<Product>(`/products/${id}/stock`, { quantity, type }, token || undefined);
  },

  async getLowStock(): Promise<Product[]> {
    const token = authService.getToken();
    return api.get<Product[]>('/products/low-stock', token || undefined);
  },
};

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const token = authService.getToken();
    return api.get<Category[]>('/categories', token || undefined);
  },

  async getById(id: number): Promise<Category> {
    const token = authService.getToken();
    return api.get<Category>(`/categories/${id}`, token || undefined);
  },

  async create(data: Partial<Category>): Promise<Category> {
    const token = authService.getToken();
    return api.post<Category>('/categories', data, token || undefined);
  },

  async update(id: number, data: Partial<Category>): Promise<Category> {
    const token = authService.getToken();
    return api.put<Category>(`/categories/${id}`, data, token || undefined);
  },

  async delete(id: number): Promise<void> {
    const token = authService.getToken();
    return api.delete<void>(`/categories/${id}`, token || undefined);
  },
};

