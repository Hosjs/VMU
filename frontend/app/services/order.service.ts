import type { Order, CreateOrderData } from '~/types/order';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import { apiService } from './api.service';

export const orderService = {
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<Order>> {
    return apiService.getPaginated<Order>('/orders', params);
  },

  async getById(id: number): Promise<Order> {
    return apiService.get<Order>(`/orders/${id}`);
  },

  async create(data: CreateOrderData): Promise<Order> {
    return apiService.post<Order>('/orders', data);
  },

  async update(id: number, data: Partial<Order>): Promise<Order> {
    return apiService.put<Order>(`/orders/${id}`, data);
  },

  async updateStatus(
    id: number,
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  ): Promise<Order> {
    return apiService.post<Order>(`/orders/${id}/status`, { status });
  },

  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`/orders/${id}`);
  },

  async getByCustomer(customerId: number): Promise<Order[]> {
    return apiService.get<Order[]>(`/customers/${customerId}/orders`);
  },
};
