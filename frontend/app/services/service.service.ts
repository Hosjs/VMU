import type {
  Service,
  ServiceRequest,
  CreateServiceRequestData
} from '~/types/service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import { apiService } from './api.service';

export const serviceService = {
  // Services CRUD
  async getServices(params?: TableQueryParams): Promise<PaginatedResponse<Service>> {
    const defaultParams: TableQueryParams = {
      page: 1,
      per_page: 15,
      ...params
    };
    return apiService.getPaginated<Service>('/admin/services', defaultParams);
  },

  async getServiceById(id: number): Promise<Service> {
    return apiService.get<Service>(`/admin/services/${id}`);
  },

  async createService(data: Partial<Service>): Promise<Service> {
    return apiService.post<Service>('/admin/services', data);
  },

  async updateService(id: number, data: Partial<Service>): Promise<Service> {
    return apiService.put<Service>(`/admin/services/${id}`, data);
  },

  async deleteService(id: number): Promise<void> {
    return apiService.delete<void>(`/admin/services/${id}`);
  },
};

export const serviceRequestService = {
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<ServiceRequest>> {
    const defaultParams: TableQueryParams = {
      page: 1,
      per_page: 15,
      ...params
    };
    return apiService.getPaginated<ServiceRequest>('/service-requests', defaultParams);
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
