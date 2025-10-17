import { apiService } from '../api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

export interface ServiceRequest {
  id: number;
  customer_id: number;
  vehicle_id: number;
  requested_date: string;
  preferred_time?: string;
  service_type: string;
  description: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: number;
  estimated_cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: number;
    name: string;
    phone: string;
    email?: string;
  };
  vehicle?: {
    id: number;
    license_plate: string;
    brand: string;
    model: string;
  };
  assigned_staff?: {
    id: number;
    name: string;
    position: string;
  };
}

export interface ServiceRequestFormData {
  customer_id: number;
  vehicle_id: number;
  requested_date: string;
  preferred_time?: string;
  service_type: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimated_cost?: number;
  notes?: string;
}

export interface ServiceRequestStatistics {
  total: number;
  pending: number;
  approved: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

class ServiceRequestService {
  private readonly BASE_PATH = '/sales/service-requests';

  constructor() {
    // ✅ Bind methods để giữ context
    this.getServiceRequests = this.getServiceRequests.bind(this);
    this.getServiceRequestById = this.getServiceRequestById.bind(this);
    this.createServiceRequest = this.createServiceRequest.bind(this);
    this.updateServiceRequest = this.updateServiceRequest.bind(this);
    this.deleteServiceRequest = this.deleteServiceRequest.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.assignStaff = this.assignStaff.bind(this);
    this.approveRequest = this.approveRequest.bind(this);
    this.cancelRequest = this.cancelRequest.bind(this);
    this.convertToOrder = this.convertToOrder.bind(this);
    this.getStatistics = this.getStatistics.bind(this);
  }

  async getServiceRequests(params: TableQueryParams): Promise<PaginatedResponse<ServiceRequest>> {
    return apiService.getPaginated<ServiceRequest>(this.BASE_PATH, params);
  }

  async getServiceRequestById(id: number): Promise<ServiceRequest> {
    return apiService.get<ServiceRequest>(`${this.BASE_PATH}/${id}`);
  }

  async createServiceRequest(data: ServiceRequestFormData): Promise<ServiceRequest> {
    return apiService.post<ServiceRequest>(this.BASE_PATH, data);
  }

  async updateServiceRequest(id: number, data: Partial<ServiceRequestFormData>): Promise<ServiceRequest> {
    return apiService.put<ServiceRequest>(`${this.BASE_PATH}/${id}`, data);
  }

  async deleteServiceRequest(id: number): Promise<void> {
    return apiService.delete<void>(`${this.BASE_PATH}/${id}`);
  }

  async updateStatus(id: number, status: ServiceRequest['status']): Promise<ServiceRequest> {
    return apiService.post<ServiceRequest>(`${this.BASE_PATH}/${id}/status`, { status });
  }

  async assignStaff(id: number, staffId: number): Promise<ServiceRequest> {
    return apiService.post<ServiceRequest>(`${this.BASE_PATH}/${id}/assign`, { staff_id: staffId });
  }

  async approveRequest(id: number): Promise<ServiceRequest> {
    return apiService.post<ServiceRequest>(`${this.BASE_PATH}/${id}/approve`, {});
  }

  async cancelRequest(id: number, reason?: string): Promise<ServiceRequest> {
    return apiService.post<ServiceRequest>(`${this.BASE_PATH}/${id}/cancel`, { reason });
  }

  async convertToOrder(id: number): Promise<{ order_id: number }> {
    return apiService.post<{ order_id: number }>(`${this.BASE_PATH}/${id}/convert-to-order`, {});
  }

  async getStatistics(): Promise<ServiceRequestStatistics> {
    return apiService.get<ServiceRequestStatistics>(`${this.BASE_PATH}/statistics`);
  }
}

export const serviceRequestService = new ServiceRequestService();
