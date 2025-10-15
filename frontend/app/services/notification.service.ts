import { apiService } from './api.service';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  user_id?: number;
  recipient_roles?: string;
  sender_id?: number;
  sender?: {
    id: number;
    name: string;
  };
  notifiable_type?: string;
  notifiable_id?: number;
  notifiable?: any;
  additional_data?: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_recurring: boolean;
  scheduled_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationQueryParams {
  page?: number;
  per_page?: number;
  unread_only?: boolean;
  type?: string;
}

class NotificationService {
  /**
   * Get notifications
   */
  async getNotifications(params?: NotificationQueryParams) {
    const response = await apiService.get('/notifications', params);
    return response;
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<{ count: number }>('/notifications/unread-count');
    return response.count;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: number) {
    const response = await apiService.post(`/notifications/${id}/mark-as-read`, {});
    return response;
  }

  /**
   * Mark all as read
   */
  async markAllAsRead() {
    const response = await apiService.post('/notifications/mark-all-as-read', {});
    return response;
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: number) {
    const response = await apiService.delete(`/notifications/${id}`);
    return response;
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      service_request: '🔔',
      service_request_status: '📋',
      service_request_assigned: '👤',
      order_status: '📦',
      payment: '💰',
      low_stock: '⚠️',
      system: '⚙️',
    };
    return icons[type] || '📢';
  }

  /**
   * Get notification color based on priority
   */
  getNotificationColor(priority: string): string {
    const colors: Record<string, string> = {
      low: 'blue',
      normal: 'gray',
      high: 'orange',
      urgent: 'red',
    };
    return colors[priority] || 'gray';
  }
}

export const notificationService = new NotificationService();
