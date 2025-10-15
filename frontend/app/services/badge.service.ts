import { api } from './api.service';

export interface BadgeCounts {
  orders: number;
  invoices: number;
  service_requests: number;
  work_orders: number;
  notifications: number;
}

export interface BadgeCountResponse {
  success: boolean;
  data: BadgeCounts;
  role: string;
}

export interface SingleBadgeCountResponse {
  success: boolean;
  type: string;
  count: number;
  role: string;
}

class BadgeService {
  /**
   * Lấy tất cả số đếm badge cho sidebar menu
   */
  async getCounts(): Promise<BadgeCounts> {
    const response = await api.get<BadgeCountResponse>('/badges/counts');
    return response.data;
  }

  /**
   * Lấy số đếm cho một loại badge cụ thể
   */
  async getCount(type: 'orders' | 'invoices' | 'service_requests' | 'work_orders' | 'notifications'): Promise<number> {
    const response = await api.get<SingleBadgeCountResponse>(`/badges/count/${type}`);
    return response.count;
  }
}

export const badgeService = new BadgeService();

