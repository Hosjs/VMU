// Provider API Service
import { apiService } from './api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types';

export interface Provider {
  id: number;
  code: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: 'active' | 'inactive' | 'suspended' | 'blacklisted';
  rating: number;
  completed_orders: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProviderFormData {
  name: string;
  code: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: string;
  is_active: boolean;
}

export const providerService = {
  async getProviders(params?: TableQueryParams): Promise<PaginatedResponse<Provider>> {
    return apiService.getPaginated<Provider>('/admin/providers', params);
  },

  async getProvider(id: number): Promise<Provider> {
    return apiService.get<Provider>(`/admin/providers/${id}`);
  },

  async createProvider(data: ProviderFormData): Promise<Provider> {
    return apiService.post<Provider>('/admin/providers', data);
  },

  async updateProvider(id: number, data: Partial<ProviderFormData>): Promise<Provider> {
    return apiService.put<Provider>(`/admin/providers/${id}`, data);
  },

  async deleteProvider(id: number): Promise<void> {
    await apiService.delete(`/admin/providers/${id}`);
  },
};
