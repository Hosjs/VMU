import type { PaginatedResponse, TableQueryParams } from '~/types/common';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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

const TOKEN_KEY = 'auth_token';

function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

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

class ApiService {
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

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const token = getAuthToken();
    const queryString = params ? `?${this.buildQueryString(params)}` : '';
    const url = `${endpoint}${queryString}`;

    const response = await httpClient.get<{ success: boolean; data: T }>(url, token || undefined);
    return response.data;
  }

  async getPublic<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? `?${this.buildQueryString(params)}` : '';
    const url = `${endpoint}${queryString}`;

    const response = await httpClient.get<{ success: boolean; data: T }>(url);
    return response.data;
  }

  async getPaginated<T>(
    endpoint: string,
    params: TableQueryParams
  ): Promise<PaginatedResponse<T>> {
    const token = getAuthToken();
    const queryParams: Record<string, any> = {
      page: params.page,
      per_page: params.per_page,
    };

    // ✅ Add standard search/sort params
    if (params.search) queryParams.search = params.search;
    if (params.sort_by) queryParams.sort_by = params.sort_by;
    if (params.sort_direction) queryParams.sort_direction = params.sort_direction;

    // ✅ Add all filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams[key] = value;
        }
      });
    }

    // ✅ CRITICAL FIX: Also add any additional params that are not in filters
    // This handles cases where params like namVao, maNganh are passed directly
    Object.entries(params).forEach(([key, value]) => {
      if (
        key !== 'page' &&
        key !== 'per_page' &&
        key !== 'search' &&
        key !== 'sort_by' &&
        key !== 'sort_direction' &&
        key !== 'filters' &&
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        queryParams[key] = value;
      }
    });

    const queryString = this.buildQueryString(queryParams);
    const url = `${endpoint}?${queryString}`;

    const response = await httpClient.get<PaginatedResponse<T>>(url, token || undefined);
    return response;
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const token = getAuthToken();
    const response = await httpClient.post<{ success: boolean; data: T; message?: string }>(endpoint, data, token || undefined);
    return response.data;
  }

  async postPublic<T>(endpoint: string, data: any): Promise<T> {
    const response = await httpClient.post<{ success: boolean; data: T; message?: string }>(endpoint, data);
    return response.data;
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const token = getAuthToken();
    const response = await httpClient.put<{ success: boolean; data: T; message?: string }>(endpoint, data, token || undefined);
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const token = getAuthToken();
    const response = await httpClient.delete<{ success: boolean; data: T; message?: string }>(endpoint, token || undefined);
    return response.data;
  }

  get http() {
    return httpClient;
  }
}

export const apiService = new ApiService();
export const api = httpClient;
