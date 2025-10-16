export * from './badge.service';
export * from './notification.service';
import { apiService } from '../api.service';

export interface BadgeCounts {
  notifications: number;
  pending_orders: number;
  pending_invoices: number;
  pending_settlements: number;
  low_stock_products: number;
}

class BadgeService {
  async getCounts(): Promise<BadgeCounts> {
    return apiService.get<BadgeCounts>('/badges/counts');
  }
}

export const badgeService = new BadgeService();

