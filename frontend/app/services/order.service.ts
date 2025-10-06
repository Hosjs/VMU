import type { Order, CreateOrderData } from '~/types/order';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import { api } from '~/utils/api';
import { authService } from '~/utils/auth';

export const orderService = {
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<Order>> {
    const token = authService.getToken();
    const queryString = new URLSearchParams(params as any).toString();
    return api.get<PaginatedResponse<Order>>(
      `/orders${queryString ? `?${queryString}` : ''}`,
      token || undefined
    );
  },

  async getById(id: number): Promise<Order> {
    const token = authService.getToken();
    return api.get<Order>(`/orders/${id}`, token || undefined);
  },

  async create(data: CreateOrderData): Promise<Order> {
    const token = authService.getToken();
    return api.post<Order>('/orders', data, token || undefined);
  },

  async update(id: number, data: Partial<Order>): Promise<Order> {
    const token = authService.getToken();
    return api.put<Order>(`/orders/${id}`, data, token || undefined);
  },

  async updateStatus(
    id: number,
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  ): Promise<Order> {
    const token = authService.getToken();
    return api.post<Order>(`/orders/${id}/status`, { status }, token || undefined);
  },

  async delete(id: number): Promise<void> {
    const token = authService.getToken();
    return api.delete<void>(`/orders/${id}`, token || undefined);
  },

  async getByCustomer(customerId: number): Promise<Order[]> {
    const token = authService.getToken();
    return api.get<Order[]>(`/customers/${customerId}/orders`, token || undefined);
  },
};

