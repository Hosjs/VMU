import { apiService } from '../api.service';

export interface DashboardOverview {
  orders: {
    total: number;
    pending: number;
    in_progress: number;
  };
  revenue: {
    today: number;
    this_month: number;
  };
  customers: {
    total: number;
    new_this_month: number;
  };
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
    console.log('🔍 Calling dashboard API:', `${this.BASE_PATH}/dashboard/overview`);
    try {
      const response = await apiService.get<DashboardOverview>(`${this.BASE_PATH}/dashboard/overview`);
      console.log('✅ Dashboard API Response:', response);
      return response;
    } catch (error) {
      console.error('❌ Dashboard API Error:', error);
      throw error;
    }
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
