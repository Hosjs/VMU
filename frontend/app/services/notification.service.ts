// Notification API Service
import { apiClient } from '~/utils/api';
import type {
  Notification,
  CreateNotificationData,
  PaginatedResponse,
  TableQueryParams
} from '~/types';

export const notificationService = {
  // Get notifications
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<Notification>> {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  async getById(id: number): Promise<Notification> {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data;
  },

  async getUnread(): Promise<Notification[]> {
    const response = await apiClient.get('/notifications/unread');
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  async getRecent(limit: number = 10): Promise<Notification[]> {
    const response = await apiClient.get('/notifications/recent', { params: { limit } });
    return response.data;
  },

  async getByType(type: string, params?: TableQueryParams): Promise<PaginatedResponse<Notification>> {
    const response = await apiClient.get(`/notifications/type/${type}`, { params });
    return response.data;
  },

  // Create notifications
  async create(data: CreateNotificationData): Promise<Notification> {
    const response = await apiClient.post('/notifications', data);
    return response.data;
  },

  async createBulk(data: CreateNotificationData[]): Promise<Notification[]> {
    const response = await apiClient.post('/notifications/bulk', { notifications: data });
    return response.data;
  },

  async sendToRole(role: string, data: Omit<CreateNotificationData, 'recipient_roles'>): Promise<Notification[]> {
    const response = await apiClient.post('/notifications/send-to-role', { role, ...data });
    return response.data;
  },

  async sendToUser(userId: number, data: Omit<CreateNotificationData, 'user_id'>): Promise<Notification> {
    const response = await apiClient.post(`/notifications/send-to-user/${userId}`, data);
    return response.data;
  },

  // Mark as read/unread
  async markAsRead(id: number): Promise<Notification> {
    const response = await apiClient.post(`/notifications/${id}/read`);
    return response.data;
  },

  async markAsUnread(id: number): Promise<Notification> {
    const response = await apiClient.post(`/notifications/${id}/unread`);
    return response.data;
  },

  async markAllAsRead(): Promise<{ updated: number }> {
    const response = await apiClient.post('/notifications/mark-all-read');
    return response.data;
  },

  async markMultipleAsRead(ids: number[]): Promise<{ updated: number }> {
    const response = await apiClient.post('/notifications/mark-multiple-read', { ids });
    return response.data;
  },

  // Delete notifications
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  async deleteMultiple(ids: number[]): Promise<{ deleted: number }> {
    const response = await apiClient.post('/notifications/delete-multiple', { ids });
    return response.data;
  },

  async deleteAll(): Promise<{ deleted: number }> {
    const response = await apiClient.delete('/notifications/all');
    return response.data;
  },

  async deleteRead(): Promise<{ deleted: number }> {
    const response = await apiClient.delete('/notifications/read');
    return response.data;
  },

  async deleteOlderThan(days: number): Promise<{ deleted: number }> {
    const response = await apiClient.delete(`/notifications/older-than/${days}`);
    return response.data;
  },

  // Notification preferences
  async getPreferences(): Promise<any> {
    const response = await apiClient.get('/notifications/preferences');
    return response.data;
  },

  async updatePreferences(preferences: any): Promise<any> {
    const response = await apiClient.put('/notifications/preferences', preferences);
    return response.data;
  },

  async enableNotificationType(type: string): Promise<void> {
    await apiClient.post(`/notifications/preferences/enable/${type}`);
  },

  async disableNotificationType(type: string): Promise<void> {
    await apiClient.post(`/notifications/preferences/disable/${type}`);
  },

  // Real-time notifications (WebSocket/Pusher)
  async subscribe(): Promise<any> {
    const response = await apiClient.get('/notifications/subscribe');
    return response.data;
  },

  async unsubscribe(): Promise<void> {
    await apiClient.post('/notifications/unsubscribe');
  },

  // System notifications
  async sendMaintenanceReminders(): Promise<{ sent: number }> {
    const response = await apiClient.post('/notifications/send-maintenance-reminders');
    return response.data;
  },

  async sendInsuranceExpiryReminders(): Promise<{ sent: number }> {
    const response = await apiClient.post('/notifications/send-insurance-reminders');
    return response.data;
  },

  async sendWarrantyExpiryReminders(): Promise<{ sent: number }> {
    const response = await apiClient.post('/notifications/send-warranty-reminders');
    return response.data;
  },

  async sendLowStockAlerts(): Promise<{ sent: number }> {
    const response = await apiClient.post('/notifications/send-low-stock-alerts');
    return response.data;
  },

  // Statistics
  async getStats(): Promise<any> {
    const response = await apiClient.get('/notifications/stats');
    return response.data;
  },
};
// Settlement API Service
import { apiClient } from '~/utils/api';
import type {
  Settlement,
  SettlementPayment,
  CreateSettlementData,
  CreateSettlementPaymentData,
  PaginatedResponse,
  TableQueryParams
} from '~/types';

export const settlementService = {
  // Settlement CRUD
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<Settlement>> {
    const response = await apiClient.get('/settlements', { params });
    return response.data;
  },

  async getById(id: number): Promise<Settlement> {
    const response = await apiClient.get(`/settlements/${id}`);
    return response.data;
  },

  async getByOrder(orderId: number): Promise<Settlement[]> {
    const response = await apiClient.get(`/orders/${orderId}/settlements`);
    return response.data;
  },

  async getByProvider(providerId: number, params?: TableQueryParams): Promise<PaginatedResponse<Settlement>> {
    const response = await apiClient.get(`/providers/${providerId}/settlements`, { params });
    return response.data;
  },

  async create(data: CreateSettlementData): Promise<Settlement> {
    const response = await apiClient.post('/settlements', data);
    return response.data;
  },

  async update(id: number, data: Partial<CreateSettlementData>): Promise<Settlement> {
    const response = await apiClient.put(`/settlements/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/settlements/${id}`);
  },

  // Settlement Status Management
  async submitForApproval(id: number): Promise<Settlement> {
    const response = await apiClient.post(`/settlements/${id}/submit`);
    return response.data;
  },

  async approve(id: number, notes?: string): Promise<Settlement> {
    const response = await apiClient.post(`/settlements/${id}/approve`, { notes });
    return response.data;
  },

  async reject(id: number, reason: string): Promise<Settlement> {
    const response = await apiClient.post(`/settlements/${id}/reject`, { reason });
    return response.data;
  },

  async markAsPaid(id: number): Promise<Settlement> {
    const response = await apiClient.post(`/settlements/${id}/mark-paid`);
    return response.data;
  },

  async complete(id: number): Promise<Settlement> {
    const response = await apiClient.post(`/settlements/${id}/complete`);
    return response.data;
  },

  async dispute(id: number, reason: string): Promise<Settlement> {
    const response = await apiClient.post(`/settlements/${id}/dispute`, { reason });
    return response.data;
  },

  // Settlement Payments
  async getPayments(settlementId: number): Promise<SettlementPayment[]> {
    const response = await apiClient.get(`/settlements/${settlementId}/payments`);
    return response.data;
  },

  async createPayment(data: CreateSettlementPaymentData): Promise<SettlementPayment> {
    const response = await apiClient.post('/settlement-payments', data);
    return response.data;
  },

  async getPaymentById(id: number): Promise<SettlementPayment> {
    const response = await apiClient.get(`/settlement-payments/${id}`);
    return response.data;
  },

  async updatePayment(id: number, data: Partial<CreateSettlementPaymentData>): Promise<SettlementPayment> {
    const response = await apiClient.put(`/settlement-payments/${id}`, data);
    return response.data;
  },

  async approvePayment(id: number, notes?: string): Promise<SettlementPayment> {
    const response = await apiClient.post(`/settlement-payments/${id}/approve`, { notes });
    return response.data;
  },

  async rejectPayment(id: number, reason: string): Promise<SettlementPayment> {
    const response = await apiClient.post(`/settlement-payments/${id}/reject`, { reason });
    return response.data;
  },

  async processPayment(id: number): Promise<SettlementPayment> {
    const response = await apiClient.post(`/settlement-payments/${id}/process`);
    return response.data;
  },

  async confirmPayment(id: number): Promise<SettlementPayment> {
    const response = await apiClient.post(`/settlement-payments/${id}/confirm`);
    return response.data;
  },

  async cancelPayment(id: number, reason: string): Promise<SettlementPayment> {
    const response = await apiClient.post(`/settlement-payments/${id}/cancel`, { reason });
    return response.data;
  },

  // Settlement Reports & Analytics
  async getOverdueSettlements(): Promise<Settlement[]> {
    const response = await apiClient.get('/settlements/overdue');
    return response.data;
  },

  async getPendingSettlements(): Promise<Settlement[]> {
    const response = await apiClient.get('/settlements/pending');
    return response.data;
  },

  async getSettlementSummary(startDate?: string, endDate?: string): Promise<any> {
    const response = await apiClient.get('/settlements/summary', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  async getProviderSettlementSummary(providerId: number, startDate?: string, endDate?: string): Promise<any> {
    const response = await apiClient.get(`/providers/${providerId}/settlement-summary`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  async calculateProfit(id: number): Promise<any> {
    const response = await apiClient.get(`/settlements/${id}/profit-calculation`);
    return response.data;
  },

  // Export & Print
  async exportToPdf(id: number): Promise<Blob> {
    const response = await apiClient.get(`/settlements/${id}/export-pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async exportToExcel(params?: TableQueryParams): Promise<Blob> {
    const response = await apiClient.get('/settlements/export-excel', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};

