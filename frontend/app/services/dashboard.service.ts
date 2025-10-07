import { apiService } from './api.service';

export interface DashboardOverview {
  orders: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    total_revenue: number;
    total_profit: number;
  };
  payments: {
    total: number;
    paid: number;
    pending: number;
    total_amount: number;
  };
  customers: {
    total: number;
    new_this_month: number;
    active: number;
  };
  inventory: {
    total_products: number;
    low_stock_count: number;
    out_of_stock_count: number;
  };
  recent_orders: Array<{
    id: number;
    order_number: string;
    customer_name: string;
    status: string;
    final_amount: number;
    created_at: string;
  }>;
  recent_payments: Array<{
    id: number;
    invoice_number: string;
    customer_name: string;
    amount: number;
    payment_method: string;
    created_at: string;
  }>;
  revenue_trend: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface RevenueReport {
  period: string;
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
    average_order_value: number;
  }>;
  summary: {
    total_revenue: number;
    total_orders: number;
    average_order_value: number;
  };
}

export interface ProfitReport {
  period: string;
  data: Array<{
    date: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
  summary: {
    total_revenue: number;
    total_cost: number;
    total_profit: number;
    average_margin: number;
  };
}

export interface TopCustomer {
  id: number;
  name: string;
  total_orders: number;
  total_amount: number;
  last_order_date: string;
}

export interface TopItem {
  id: number;
  name: string;
  code: string;
  total_quantity: number;
  total_revenue: number;
  total_profit: number;
}

class DashboardService {
  private readonly BASE_PATH = '/admin/dashboard';

  /**
   * Get dashboard overview
   */
  async getOverview(params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<DashboardOverview> {
    return apiService.get<DashboardOverview>(`${this.BASE_PATH}/overview`, params);
  }

  /**
   * Get revenue report
   */
  async getRevenueReport(params: {
    date_from: string;
    date_to: string;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<RevenueReport> {
    return apiService.get<RevenueReport>(`${this.BASE_PATH}/revenue-report`, params);
  }

  /**
   * Get profit report
   */
  async getProfitReport(params: {
    date_from: string;
    date_to: string;
  }): Promise<ProfitReport> {
    return apiService.get<ProfitReport>(`${this.BASE_PATH}/profit-report`, params);
  }

  /**
   * Get top customers
   */
  async getTopCustomers(params?: {
    limit?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<TopCustomer[]> {
    return apiService.get<TopCustomer[]>(`${this.BASE_PATH}/top-customers`, params);
  }

  /**
   * Get top services
   */
  async getTopServices(params?: {
    limit?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<TopItem[]> {
    return apiService.get<TopItem[]>(`${this.BASE_PATH}/top-services`, params);
  }

  /**
   * Get top products
   */
  async getTopProducts(params?: {
    limit?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<TopItem[]> {
    return apiService.get<TopItem[]>(`${this.BASE_PATH}/top-products`, params);
  }
}

export const dashboardService = new DashboardService();

