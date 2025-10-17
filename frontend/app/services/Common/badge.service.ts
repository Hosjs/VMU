import { apiService } from '../api.service';

export interface BadgeCounts {
  orders: number;
  invoices: number;
  service_requests: number;
  work_orders: number;
  notifications: number;
}

class BadgeService {
  constructor() {
    // ✅ Bind methods để giữ context
    this.getCounts = this.getCounts.bind(this);
  }

  async getCounts(): Promise<BadgeCounts> {
    return apiService.get<BadgeCounts>('/badges/counts');
  }
}

export const badgeService = new BadgeService();
