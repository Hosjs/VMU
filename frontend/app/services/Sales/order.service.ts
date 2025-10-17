import { apiService } from '../api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import type { Order } from '~/types/order';

export interface OrderStatistics {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  total_revenue: number;
}

class OrderService {
  private readonly BASE_PATH = '/sales/orders';

  constructor() {
    // ✅ Bind methods
    this.getOrders = this.getOrders.bind(this);
    this.getOrderById = this.getOrderById.bind(this);
    this.updateOrderStatus = this.updateOrderStatus.bind(this);
    this.assignStaff = this.assignStaff.bind(this);
    this.cancelOrder = this.cancelOrder.bind(this);
    this.getStatistics = this.getStatistics.bind(this);
  }

  async getOrders(params: TableQueryParams): Promise<PaginatedResponse<Order>> {
    return apiService.getPaginated<Order>(this.BASE_PATH, params);
  }

  async getOrderById(id: number): Promise<Order> {
    return apiService.get<Order>(`${this.BASE_PATH}/${id}`);
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    return apiService.post<Order>(`${this.BASE_PATH}/${id}/status`, { status });
  }

  async assignStaff(id: number, staffId: number): Promise<Order> {
    return apiService.post<Order>(`${this.BASE_PATH}/${id}/assign`, { staff_id: staffId });
  }

  async cancelOrder(id: number, reason?: string): Promise<Order> {
    return apiService.post<Order>(`${this.BASE_PATH}/${id}/cancel`, { reason });
  }

  async getStatistics(): Promise<OrderStatistics> {
    return apiService.get<OrderStatistics>(`${this.BASE_PATH}/statistics`);
  }
}

export const orderService = new OrderService();
