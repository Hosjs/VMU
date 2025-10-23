import { apiService } from './api.service';
import type { DashboardData } from '~/types/dashboard';

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    return apiService.get<DashboardData>('/dashboard');
  }

  async getUserDashboard(): Promise<any> {
    return apiService.get<any>('/dashboard/user');
  }
}

export const dashboardService = new DashboardService();

