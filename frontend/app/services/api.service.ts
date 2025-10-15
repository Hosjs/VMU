/**
 * ============================================
 * UNIFIED API SERVICE
 * ============================================
 * Gộp utils/api.ts + services/api.service.ts
 * - HTTP Client (GET, POST, PUT, DELETE)
 * - Error Handling
 * - Auto Authentication
 * - Query Builder & Pagination
 *
 * @version 2.0 - Unified & Optimized
 */

import type { PaginatedResponse, TableQueryParams } from '~/types/common';

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ============================================
// ERROR HANDLING
// ============================================

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new ApiError(
      error.message || `HTTP ${response.status}`,
      response.status,
      error
    );
  }
  return response.json();
}

// ============================================
// TOKEN MANAGEMENT
// ============================================

const TOKEN_KEY = 'auth_token';

function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// ============================================
// LOW-LEVEL HTTP CLIENT
// ============================================

const httpClient = {
  get: async <T>(endpoint: string, token?: string): Promise<T> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, data?: any, token?: string): Promise<T> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return handleResponse<T>(response);
  },

  put: async <T>(endpoint: string, data?: any, token?: string): Promise<T> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string, token?: string): Promise<T> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    return handleResponse<T>(response);
  },
};

// ============================================
// HIGH-LEVEL API SERVICE (WITH AUTO AUTH)
// ============================================

class ApiService {
  /**
   * Build query string from params object
   */
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
   * GET request with auto authentication
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const token = getAuthToken();
    const queryString = params ? `?${this.buildQueryString(params)}` : '';
    const url = `${endpoint}${queryString}`;

    const response = await httpClient.get<{ success: boolean; data: T }>(url, token || undefined);
    return response.data;
  }

  /**
   * GET request without auth (for public endpoints)
   */
  async getPublic<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? `?${this.buildQueryString(params)}` : '';
    const url = `${endpoint}${queryString}`;

    const response = await httpClient.get<{ success: boolean; data: T }>(url);
    return response.data;
  }

  /**
   * GET request that returns paginated data
   * Backend trả về trực tiếp Laravel pagination response (không wrap)
   */
  async getPaginated<T>(
    endpoint: string,
    params: TableQueryParams
  ): Promise<PaginatedResponse<T>> {
    const token = getAuthToken();
    const queryParams: Record<string, any> = {
      page: params.page,
      per_page: params.per_page,
    };

    if (params.search) queryParams.search = params.search;
    if (params.sort_by) queryParams.sort_by = params.sort_by;
    if (params.sort_direction) queryParams.sort_direction = params.sort_direction; // ✅ ĐÚNG: sort_direction
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        queryParams[key] = value;
      });
    }

    const queryString = this.buildQueryString(queryParams);
    const url = `${endpoint}?${queryString}`;

    // Backend trả về trực tiếp pagination response, không wrap trong {success, data}
    const response = await httpClient.get<PaginatedResponse<T>>(url, token || undefined);
    return response;
  }

  /**
   * POST request with auto authentication
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    const token = getAuthToken();
    const response = await httpClient.post<{ success: boolean; data: T; message?: string }>(endpoint, data, token || undefined);
    return response.data;
  }

  /**
   * POST request without auth (for public endpoints like login/register)
   */
  async postPublic<T>(endpoint: string, data: any): Promise<T> {
    const response = await httpClient.post<{ success: boolean; data: T; message?: string }>(endpoint, data);
    return response.data;
  }

  /**
   * PUT request with auto authentication
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    const token = getAuthToken();
    const response = await httpClient.put<{ success: boolean; data: T; message?: string }>(endpoint, data, token || undefined);
    return response.data;
  }

  /**
   * DELETE request with auto authentication
   */
  async delete<T>(endpoint: string): Promise<T> {
    const token = getAuthToken();
    const response = await httpClient.delete<{ success: boolean; data: T; message?: string }>(endpoint, token || undefined);
    return response.data;
  }

  /**
   * Direct access to low-level HTTP client (for special cases)
   */
  get http() {
    return httpClient;
  }
}

// ============================================
// EXPORTS
// ============================================

export const apiService = new ApiService();

// Export for backward compatibility
export const api = httpClient;
