import { apiService } from '../api.service';

export interface BadgeCounts {
  orders: number;
  invoices: number;
  service_requests: number;
  work_orders: number;
  notifications: number;
}

class BadgeService {
  async getCounts(): Promise<BadgeCounts> {
    return apiService.get<BadgeCounts>('/badges/counts');
  }
}

export const badgeService = new BadgeService();
