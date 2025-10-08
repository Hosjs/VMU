import type {
  Invoice,
  Payment,
  CreateInvoiceData,
  CreatePaymentData
} from '~/types/invoice';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import { apiService } from './api.service';

export const invoiceService = {
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<Invoice>> {
    return apiService.getPaginated<Invoice>('/invoices', params);
  },

  async getById(id: number): Promise<Invoice> {
    return apiService.get<Invoice>(`/invoices/${id}`);
  },

  async create(data: CreateInvoiceData): Promise<Invoice> {
    return apiService.post<Invoice>('/invoices', data);
  },

  async update(id: number, data: Partial<Invoice>): Promise<Invoice> {
    return apiService.put<Invoice>(`/invoices/${id}`, data);
  },

  async updateStatus(
    id: number,
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  ): Promise<Invoice> {
    return apiService.post<Invoice>(`/invoices/${id}/status`, { status });
  },

  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`/invoices/${id}`);
  },

  async downloadPdf(id: number): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/invoices/${id}/pdf`);
    return response.blob();
  },
};

export const paymentService = {
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<Payment>> {
    return apiService.getPaginated<Payment>('/payments', params);
  },

  async getById(id: number): Promise<Payment> {
    return apiService.get<Payment>(`/payments/${id}`);
  },

  async create(data: CreatePaymentData): Promise<Payment> {
    return apiService.post<Payment>('/payments', data);
  },

  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`/payments/${id}`);
  },

  async getByInvoice(invoiceId: number): Promise<Payment[]> {
    return apiService.get<Payment[]>(`/invoices/${invoiceId}/payments`);
  },
};
