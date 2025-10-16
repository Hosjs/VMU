import { apiService } from '../api.service';

export interface DashboardOverview {
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  total_profit: number;
  pending_orders: number;
  low_stock_products: number;
}

export interface RevenueReport {
  date: string;
  revenue: number;
  orders: number;
}

export interface ProfitReport {
  date: string;
  profit: number;
  margin_percent: number;
}

export interface TopCustomer {
  id: number;
  name: string;
  total_orders: number;
  total_spent: number;
}

class DashboardService {
  private readonly BASE_PATH = '/reports';

  async getOverview(): Promise<DashboardOverview> {
    return apiService.get<DashboardOverview>(`${this.BASE_PATH}/dashboard/overview`);
  }

  async getRevenueReport(params?: { from?: string; to?: string }): Promise<RevenueReport[]> {
    return apiService.get<RevenueReport[]>(`${this.BASE_PATH}/revenue`, params);
  }

  async getProfitReport(params?: { from?: string; to?: string }): Promise<ProfitReport[]> {
    return apiService.get<ProfitReport[]>(`${this.BASE_PATH}/profit`, params);
  }

  async getTopCustomers(limit: number = 10): Promise<TopCustomer[]> {
    return apiService.get<TopCustomer[]>(`${this.BASE_PATH}/top-customers`, { limit });
  }
}

export const dashboardService = new DashboardService();

