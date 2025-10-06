import type {
  Service,
  ServiceRequest,
  CreateServiceRequestData
} from '~/types/service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import { api } from '~/utils/api';
import { authService } from '~/utils/auth';

export const serviceService = {
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<Service>> {
    const token = authService.getToken();
    const queryString = new URLSearchParams(params as any).toString();
    return api.get<PaginatedResponse<Service>>(
      `/services${queryString ? `?${queryString}` : ''}`,
      token || undefined
    );
  },

  async getById(id: number): Promise<Service> {
    const token = authService.getToken();
    return api.get<Service>(`/services/${id}`, token || undefined);
  },

  async create(data: Partial<Service>): Promise<Service> {
    const token = authService.getToken();
    return api.post<Service>('/services', data, token || undefined);
  },

  async update(id: number, data: Partial<Service>): Promise<Service> {
    const token = authService.getToken();
    return api.put<Service>(`/services/${id}`, data, token || undefined);
  },

  async delete(id: number): Promise<void> {
    const token = authService.getToken();
    return api.delete<void>(`/services/${id}`, token || undefined);
  },
};

export const serviceRequestService = {
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<ServiceRequest>> {
    const token = authService.getToken();
    const queryString = new URLSearchParams(params as any).toString();
    return api.get<PaginatedResponse<ServiceRequest>>(
      `/service-requests${queryString ? `?${queryString}` : ''}`,
      token || undefined
    );
  },

  async getById(id: number): Promise<ServiceRequest> {
    const token = authService.getToken();
    return api.get<ServiceRequest>(`/service-requests/${id}`, token || undefined);
  },

  async create(data: CreateServiceRequestData): Promise<ServiceRequest> {
    const token = authService.getToken();
    return api.post<ServiceRequest>('/service-requests', data, token || undefined);
  },

  async update(id: number, data: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const token = authService.getToken();
    return api.put<ServiceRequest>(`/service-requests/${id}`, data, token || undefined);
  },

  async updateStatus(
    id: number,
    status: 'pending' | 'approved' | 'rejected' | 'completed'
  ): Promise<ServiceRequest> {
    const token = authService.getToken();
    return api.post<ServiceRequest>(
      `/service-requests/${id}/status`,
      { status },
      token || undefined
    );
  },

  async delete(id: number): Promise<void> {
    const token = authService.getToken();
    return api.delete<void>(`/service-requests/${id}`, token || undefined);
  },
};

