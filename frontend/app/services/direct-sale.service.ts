// Direct Sale API Service
import { apiService } from './api.service';
import type {
  DirectSale,
  CreateDirectSaleData,
  PaginatedResponse,
  TableQueryParams
} from '~/types';

export const directSaleService = {
  // Direct Sale CRUD
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<DirectSale>> {
    return apiService.getPaginated<DirectSale>('/direct-sales', params);
  },

  async getById(id: number): Promise<DirectSale> {
    return apiService.get<DirectSale>(`/direct-sales/${id}`);
  },

  async getBySaleNumber(saleNumber: string): Promise<DirectSale> {
    return apiService.get<DirectSale>(`/direct-sales/number/${saleNumber}`);
  },

  async getByWarehouse(warehouseId: number, params?: TableQueryParams): Promise<PaginatedResponse<DirectSale>> {
    return apiService.getPaginated<DirectSale>(`/warehouses/${warehouseId}/direct-sales`, params);
  },

  async getByCustomer(customerId: number, params?: TableQueryParams): Promise<PaginatedResponse<DirectSale>> {
    return apiService.getPaginated<DirectSale>(`/customers/${customerId}/direct-sales`, params);
  },

  async create(data: CreateDirectSaleData): Promise<DirectSale> {
    const response = await apiService.post<DirectSale>('/direct-sales', data);
    return response.data;
  },

  async update(id: number, data: Partial<CreateDirectSaleData>): Promise<DirectSale> {
    const response = await apiService.put<DirectSale>(`/direct-sales/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiService.delete(`/direct-sales/${id}`);
  },

  // Direct Sale Status Management
  async submitForApproval(id: number): Promise<DirectSale> {
    const response = await apiService.post<DirectSale>(`/direct-sales/${id}/submit`);
    return response.data;
  },

  async approve(id: number, notes?: string): Promise<DirectSale> {
    const response = await apiService.post<DirectSale>(`/direct-sales/${id}/approve`, { notes });
    return response.data;
  },

  async reject(id: number, reason: string): Promise<DirectSale> {
    const response = await apiService.post<DirectSale>(`/direct-sales/${id}/reject`, { reason });
    return response.data;
  },

  async markAsPaid(id: number, paymentMethod: string, amount: number): Promise<DirectSale> {
    const response = await apiService.post<DirectSale>(`/direct-sales/${id}/mark-paid`, {
      payment_method: paymentMethod,
      amount
    });
    return response.data;
  },

  async recordPartialPayment(id: number, amount: number, paymentMethod: string, notes?: string): Promise<DirectSale> {
    const response = await apiService.post<DirectSale>(`/direct-sales/${id}/partial-payment`, {
      amount,
      payment_method: paymentMethod,
      notes
    });
    return response.data;
  },

  // Item Management
  async updateItemStatus(saleId: number, itemId: number, status: string): Promise<DirectSale> {
    const response = await apiService.post<DirectSale>(`/direct-sales/${saleId}/items/${itemId}/status`, { status });
    return response.data;
  },

  async pickItems(saleId: number, itemIds: number[]): Promise<DirectSale> {
    const response = await apiService.post<DirectSale>(`/direct-sales/${saleId}/pick-items`, { item_ids: itemIds });
    return response.data;
  },

  async packItems(saleId: number, itemIds: number[]): Promise<DirectSale> {
    const response = await apiService.post<DirectSale>(`/direct-sales/${saleId}/pack-items`, { item_ids: itemIds });
    return response.data;
  },

  async deliverSale(id: number, deliveryDate: string, deliveryNotes?: string): Promise<DirectSale> {
    const response = await apiService.post<DirectSale>(`/direct-sales/${id}/deliver`, {
      delivery_date: deliveryDate,
      notes: deliveryNotes
    });
    return response.data;
  },

  // Reports & Analytics (Admin Only)
  async getSalesSummary(startDate?: string, endDate?: string): Promise<any> {
    const response = await apiService.get('/direct-sales/summary', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  async getProfitReport(startDate?: string, endDate?: string): Promise<any> {
    const response = await apiService.get('/direct-sales/profit-report', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  async getSalespersonPerformance(salespersonId: number, startDate?: string, endDate?: string): Promise<any> {
    const response = await apiService.get(`/direct-sales/salesperson/${salespersonId}/performance`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  async getTopSellingProducts(limit: number = 10, startDate?: string, endDate?: string): Promise<any> {
    const response = await apiService.get('/direct-sales/top-products', {
      params: { limit, start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  async getCustomerPurchaseHistory(customerId: number): Promise<DirectSale[]> {
    const response = await apiService.get(`/customers/${customerId}/purchase-history`);
    return response.data;
  },

  // Export & Print
  async exportToPdf(id: number): Promise<Blob> {
    const response = await apiService.get(`/direct-sales/${id}/export-pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async exportInvoice(id: number): Promise<Blob> {
    const response = await apiService.get(`/direct-sales/${id}/invoice-pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async exportToExcel(params?: TableQueryParams): Promise<Blob> {
    const response = await apiService.get('/direct-sales/export-excel', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  async printReceipt(id: number): Promise<Blob> {
    const response = await apiService.get(`/direct-sales/${id}/receipt-pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },
};
