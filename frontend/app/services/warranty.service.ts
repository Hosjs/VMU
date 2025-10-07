// Warranty API Service
import { apiClient } from '~/utils/api';
import type {
  Warranty,
  CreateWarrantyData,
  PaginatedResponse,
  TableQueryParams
} from '~/types';

export const warrantyService = {
  // Warranty CRUD
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<Warranty>> {
    const response = await apiClient.get('/warranties', { params });
    return response.data;
  },

  async getById(id: number): Promise<Warranty> {
    const response = await apiClient.get(`/warranties/${id}`);
    return response.data;
  },

  async getByWarrantyNumber(warrantyNumber: string): Promise<Warranty> {
    const response = await apiClient.get(`/warranties/number/${warrantyNumber}`);
    return response.data;
  },

  async getByCustomer(customerId: number): Promise<Warranty[]> {
    const response = await apiClient.get(`/customers/${customerId}/warranties`);
    return response.data;
  },

  async getByVehicle(vehicleId: number): Promise<Warranty[]> {
    const response = await apiClient.get(`/vehicles/${vehicleId}/warranties`);
    return response.data;
  },

  async getByOrder(orderId: number): Promise<Warranty[]> {
    const response = await apiClient.get(`/orders/${orderId}/warranties`);
    return response.data;
  },

  async create(data: CreateWarrantyData): Promise<Warranty> {
    const response = await apiClient.post('/warranties', data);
    return response.data;
  },

  async update(id: number, data: Partial<CreateWarrantyData>): Promise<Warranty> {
    const response = await apiClient.put(`/warranties/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/warranties/${id}`);
  },

  // Warranty Status Management
  async activate(id: number): Promise<Warranty> {
    const response = await apiClient.post(`/warranties/${id}/activate`);
    return response.data;
  },

  async use(id: number, notes: string): Promise<Warranty> {
    const response = await apiClient.post(`/warranties/${id}/use`, { notes });
    return response.data;
  },

  async cancel(id: number, reason: string): Promise<Warranty> {
    const response = await apiClient.post(`/warranties/${id}/cancel`, { reason });
    return response.data;
  },

  async extend(id: number, additionalMonths: number, reason: string): Promise<Warranty> {
    const response = await apiClient.post(`/warranties/${id}/extend`, {
      additional_months: additionalMonths,
      reason
    });
    return response.data;
  },

  // Warranty Checks & Validation
  async checkValidity(warrantyNumber: string): Promise<{ valid: boolean; warranty?: Warranty; message: string }> {
    const response = await apiClient.get(`/warranties/check/${warrantyNumber}`);
    return response.data;
  },

  async getRemainingUsage(id: number): Promise<{ remaining: number; max: number; used: number }> {
    const response = await apiClient.get(`/warranties/${id}/remaining-usage`);
    return response.data;
  },

  async validateWarrantyClaim(id: number, issue: string): Promise<{ valid: boolean; message: string; covered: boolean }> {
    const response = await apiClient.post(`/warranties/${id}/validate-claim`, { issue });
    return response.data;
  },

  // Warranty Reports
  async getActiveWarranties(): Promise<Warranty[]> {
    const response = await apiClient.get('/warranties/active');
    return response.data;
  },

  async getExpiringWarranties(days: number = 30): Promise<Warranty[]> {
    const response = await apiClient.get('/warranties/expiring', { params: { days } });
    return response.data;
  },

  async getExpiredWarranties(): Promise<Warranty[]> {
    const response = await apiClient.get('/warranties/expired');
    return response.data;
  },

  async getWarrantyUsageReport(startDate?: string, endDate?: string): Promise<any> {
    const response = await apiClient.get('/warranties/usage-report', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  async getWarrantyClaimsReport(startDate?: string, endDate?: string): Promise<any> {
    const response = await apiClient.get('/warranties/claims-report', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  // Notifications & Reminders
  async sendExpiryReminder(id: number): Promise<void> {
    await apiClient.post(`/warranties/${id}/send-reminder`);
  },

  async sendExpiryReminders(days: number = 30): Promise<{ sent: number }> {
    const response = await apiClient.post('/warranties/send-expiry-reminders', { days });
    return response.data;
  },

  // Export & Print
  async exportCertificate(id: number): Promise<Blob> {
    const response = await apiClient.get(`/warranties/${id}/certificate-pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async exportToExcel(params?: TableQueryParams): Promise<Blob> {
    const response = await apiClient.get('/warranties/export-excel', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};

