import { apiService } from '../api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import type { Notification } from '~/types/notification';

class NotificationService {
  private readonly BASE_PATH = '/notifications';

  constructor() {
    // ✅ Bind methods để giữ context
    this.getNotifications = this.getNotifications.bind(this);
    this.getUnreadCount = this.getUnreadCount.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
    this.markAllAsRead = this.markAllAsRead.bind(this);
    this.deleteNotification = this.deleteNotification.bind(this);
    this.getNotificationIcon = this.getNotificationIcon.bind(this);
  }

  async getNotifications(params?: Partial<TableQueryParams> & { unread_only?: boolean; type?: string }): Promise<PaginatedResponse<Notification>> {
    const defaultParams: TableQueryParams = { page: 1, per_page: 10 };
    return apiService.getPaginated<Notification>(this.BASE_PATH, { ...defaultParams, ...params });
  }

  async getUnreadCount(): Promise<number> {
    const result = await apiService.get<{ count: number }>(`${this.BASE_PATH}/unread-count`);
    return result.count;
  }

  async markAsRead(id: number): Promise<void> {
    await apiService.post(`${this.BASE_PATH}/${id}/mark-as-read`, {});
  }

  async markAllAsRead(): Promise<void> {
    await apiService.post(`${this.BASE_PATH}/mark-all-as-read`, {});
  }

  async deleteNotification(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      'order_created': '🛒',
      'payment_received': '💰',
      'service_completed': '✅',
      'invoice_sent': '📄',
      'reminder': '⏰',
      'warning': '⚠️',
      'info': 'ℹ️',
    };
    return icons[type] || '📢';
  }
}

export const notificationService = new NotificationService();
export type { Notification } from '~/types/notification';
