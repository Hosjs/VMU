import type { Order, CreateOrderData } from '~/types/order';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import { apiService } from './api.service';

export const orderService = {
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<Order>> {
    return apiService.getPaginated<Order>('/admin/orders', params);
  },

  async getById(id: number): Promise<Order> {
    return apiService.get<Order>(`/admin/orders/${id}`);
  },

  async create(data: CreateOrderData): Promise<Order> {
    return apiService.post<Order>('/admin/orders', data);
  },

  async update(id: number, data: Partial<Order>): Promise<Order> {
    return apiService.put<Order>(`/admin/orders/${id}`, data);
  },

  async updateStatus(
    id: number,
    status: Order['status']
  ): Promise<Order> {
    return apiService.post<Order>(`/admin/orders/${id}/update-status`, { status });
  },

  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`/admin/orders/${id}`);
  },

  async getByCustomer(customerId: number): Promise<Order[]> {
    return apiService.get<Order[]>(`/admin/customers/${customerId}/orders`);
  },
};
