import { api } from '~/utils/api';
import { authService } from '~/utils/auth';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

/**
 * Base API Service
 * Handles common API operations with authentication
 */
class ApiService {
  private getAuthToken(): string {
    return authService.getToken() || '';
  }

  private buildQueryString(params: Record<string, any>): string {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object') {
          query.append(key, JSON.stringify(value));
        } else {
          query.append(key, String(value));
        }
      }
    });

    return query.toString();
  }

  /**
   * GET request with authentication
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const token = this.getAuthToken();
    const queryString = params ? `?${this.buildQueryString(params)}` : '';
    const url = `${endpoint}${queryString}`;

    const response = await api.get<{ success: boolean; data: T }>(url, token);
    return response.data;
  }

  /**
   * GET request that returns paginated data
   */
  async getPaginated<T>(
    endpoint: string,
    params: TableQueryParams
  ): Promise<PaginatedResponse<T>> {
    const token = this.getAuthToken();
    const queryParams: Record<string, any> = {
      page: params.page,
      per_page: params.per_page,
    };

    if (params.search) queryParams.search = params.search;
    if (params.sort_by) queryParams.sort_by = params.sort_by;
    if (params.sort_direction) queryParams.sort_order = params.sort_direction;
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        queryParams[key] = value;
      });
    }

    const queryString = this.buildQueryString(queryParams);
    const url = `${endpoint}?${queryString}`;

    const response = await api.get<{ success: boolean; data: PaginatedResponse<T> }>(url, token);
    return response.data;
  }

  /**
   * POST request with authentication
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    const token = this.getAuthToken();
    const response = await api.post<{ success: boolean; data: T; message?: string }>(endpoint, data, token);
    return response.data;
  }

  /**
   * PUT request with authentication
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    const token = this.getAuthToken();
    const response = await api.put<{ success: boolean; data: T; message?: string }>(endpoint, data, token);
    return response.data;
  }

  /**
   * DELETE request with authentication
   */
  async delete<T>(endpoint: string): Promise<T> {
    const token = this.getAuthToken();
    const response = await api.delete<{ success: boolean; data: T; message?: string }>(endpoint, token);
    return response.data;
  }
}

export const apiService = new ApiService();

