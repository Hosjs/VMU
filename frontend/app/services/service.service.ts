import type {
  Service,
  ServiceRequest,
  CreateServiceRequestData
} from '~/types/service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import { apiService } from './api.service';

export const serviceService = {
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<Service>> {
    return apiService.getPaginated<Service>('/services', params);
  },

  async getById(id: number): Promise<Service> {
    return apiService.get<Service>(`/services/${id}`);
  },

  async create(data: Partial<Service>): Promise<Service> {
    return apiService.post<Service>('/services', data);
  },

  async update(id: number, data: Partial<Service>): Promise<Service> {
    return apiService.put<Service>(`/services/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`/services/${id}`);
  },
};

export const serviceRequestService = {
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<ServiceRequest>> {
    return apiService.getPaginated<ServiceRequest>('/service-requests', params);
  },

  async getById(id: number): Promise<ServiceRequest> {
    return apiService.get<ServiceRequest>(`/service-requests/${id}`);
  },

  async create(data: CreateServiceRequestData): Promise<ServiceRequest> {
    return apiService.post<ServiceRequest>('/service-requests', data);
  },

  async update(id: number, data: Partial<ServiceRequest>): Promise<ServiceRequest> {
    return apiService.put<ServiceRequest>(`/service-requests/${id}`, data);
  },

  async updateStatus(
    id: number,
    status: 'pending' | 'approved' | 'rejected' | 'completed'
  ): Promise<ServiceRequest> {
    return apiService.post<ServiceRequest>(
      `/service-requests/${id}/status`,
      { status }
    );
  },

  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`/service-requests/${id}`);
  },
};
