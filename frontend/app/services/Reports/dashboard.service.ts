import { apiService } from '../api.service';
import type { PaginatedResponse } from '~/types/common';

export interface DashboardOverview {
  // Đơn hàng
  total_orders: number;
  pending_orders: number;
  in_progress_orders: number;
  completed_orders: number;
  orders_need_attention: number;

  // Doanh thu
  total_revenue: number;
  today_revenue: number;
  this_month_revenue: number;

  // Lợi nhuận
  total_profit: number;

  // Khách hàng
  total_customers: number;
  active_customers: number;
  new_customers_this_month: number;

  // Cảnh báo
  low_stock_products: number;
}

export interface RevenueChartData {
  period: string;
  revenue: number;
  profit: number;
  count: number;
}

export interface RevenueReport {
  chart_data: RevenueChartData[];
  summary: {
    total_revenue: number;
    total_profit: number;
    period: {
      start: string;
      end: string;
    };
  };
}

export interface TopCustomer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  orders_count: number;
  total_spent: number;
}

export interface TopService {
  id: number;
  name: string;
  price: number;
  service_requests_count: number;
}

export interface TopProduct {
  id: number;
  name: string;
  code: string;
  order_items_count: number;
  total_quantity: number;
}

class DashboardService {
  private readonly BASE_PATH = '/reports';

  constructor() {
    // ✅ Bind methods để giữ context this
    this.getOverview = this.getOverview.bind(this);
    this.getRecentOrders = this.getRecentOrders.bind(this);
    this.getRecentInvoices = this.getRecentInvoices.bind(this);
    this.getRevenueReport = this.getRevenueReport.bind(this);
    this.getTopCustomers = this.getTopCustomers.bind(this);
    this.getTopServices = this.getTopServices.bind(this);
    this.getTopProducts = this.getTopProducts.bind(this);
  }

  // ✅ Hàm thông thường thay vì arrow function
  async getOverview(): Promise<DashboardOverview> {
    const response = await apiService.get<{ data: DashboardOverview }>(`${this.BASE_PATH}/dashboard/overview`);
    return response.data;
  }

  async getRecentOrders(params?: { per_page?: number }): Promise<PaginatedResponse<any>> {
    return apiService.getPaginated<any>(`${this.BASE_PATH}/dashboard/recent-orders`, params);
  }

  async getRecentInvoices(params?: { per_page?: number }): Promise<PaginatedResponse<any>> {
    return apiService.getPaginated<any>(`${this.BASE_PATH}/dashboard/recent-invoices`, params);
  }

  async getRevenueReport(params?: {
    start_date?: string;
    end_date?: string;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<RevenueReport> {
    const response = await apiService.get<{ data: RevenueReport }>(`${this.BASE_PATH}/revenue`, params);
    return response.data;
  }

  async getTopCustomers(params?: { limit?: number }): Promise<TopCustomer[]> {
    const response = await apiService.get<{ data: TopCustomer[] }>(`${this.BASE_PATH}/top-customers`, params);
    return response.data;
  }

  async getTopServices(params?: { limit?: number }): Promise<TopService[]> {
    const response = await apiService.get<{ data: TopService[] }>(`${this.BASE_PATH}/top-services`, params);
    return response.data;
  }

  async getTopProducts(params?: { limit?: number }): Promise<TopProduct[]> {
    const response = await apiService.get<{ data: TopProduct[] }>(`${this.BASE_PATH}/top-products`, params);
    return response.data;
  }
}

export const dashboardService = new DashboardService();
