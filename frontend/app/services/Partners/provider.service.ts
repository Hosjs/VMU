import { apiService } from '../api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import type { Provider } from '~/types/provider';

export interface ProviderFormData {
  name: string;
  code: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  tax_code?: string;
  commission_rate?: number;
}

export interface ProviderStatistics {
  total: number;
  active: number;
  total_orders: number;
  total_settlements: number;
}

class ProviderService {
  private readonly BASE_PATH = '/partners/providers';

  async getProviders(params: TableQueryParams): Promise<PaginatedResponse<Provider>> {
    return apiService.getPaginated<Provider>(this.BASE_PATH, params);
  }

  async getProviderById(id: number): Promise<Provider> {
    return apiService.get<Provider>(`${this.BASE_PATH}/${id}`);
  }

  async createProvider(data: ProviderFormData): Promise<Provider> {
    return apiService.post<Provider>(this.BASE_PATH, data);
  }

  async updateProvider(id: number, data: Partial<ProviderFormData>): Promise<Provider> {
    return apiService.put<Provider>(`${this.BASE_PATH}/${id}`, data);
  }

  async deleteProvider(id: number): Promise<void> {
    return apiService.delete<void>(`${this.BASE_PATH}/${id}`);
  }

  async updateRating(id: number, rating: number): Promise<Provider> {
    return apiService.post<Provider>(`${this.BASE_PATH}/${id}/update-rating`, { rating });
  }

  async getStatistics(): Promise<ProviderStatistics> {
    return apiService.get<ProviderStatistics>(`${this.BASE_PATH}/statistics`);
  }
}

export const providerService = new ProviderService();

