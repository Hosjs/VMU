import type {
  Invoice,
  Payment,
  CreateInvoiceData,
  CreatePaymentData
} from '~/types/invoice';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import { api } from '~/utils/api';
import { authService } from '~/utils/auth';

export const invoiceService = {
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<Invoice>> {
    const token = authService.getToken();
    const queryString = new URLSearchParams(params as any).toString();
    return api.get<PaginatedResponse<Invoice>>(
      `/invoices${queryString ? `?${queryString}` : ''}`,
      token || undefined
    );
  },

  async getById(id: number): Promise<Invoice> {
    const token = authService.getToken();
    return api.get<Invoice>(`/invoices/${id}`, token || undefined);
  },

  async create(data: CreateInvoiceData): Promise<Invoice> {
    const token = authService.getToken();
    return api.post<Invoice>('/invoices', data, token || undefined);
  },

  async update(id: number, data: Partial<Invoice>): Promise<Invoice> {
    const token = authService.getToken();
    return api.put<Invoice>(`/invoices/${id}`, data, token || undefined);
  },

  async updateStatus(
    id: number,
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  ): Promise<Invoice> {
    const token = authService.getToken();
    return api.post<Invoice>(`/invoices/${id}/status`, { status }, token || undefined);
  },

  async delete(id: number): Promise<void> {
    const token = authService.getToken();
    return api.delete<void>(`/invoices/${id}`, token || undefined);
  },

  async downloadPdf(id: number): Promise<Blob> {
    const token = authService.getToken();
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/invoices/${id}/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.blob();
  },
};

export const paymentService = {
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<Payment>> {
    const token = authService.getToken();
    const queryString = new URLSearchParams(params as any).toString();
    return api.get<PaginatedResponse<Payment>>(
      `/payments${queryString ? `?${queryString}` : ''}`,
      token || undefined
    );
  },

  async getById(id: number): Promise<Payment> {
    const token = authService.getToken();
    return api.get<Payment>(`/payments/${id}`, token || undefined);
  },

  async create(data: CreatePaymentData): Promise<Payment> {
    const token = authService.getToken();
    return api.post<Payment>('/payments', data, token || undefined);
  },

  async delete(id: number): Promise<void> {
    const token = authService.getToken();
    return api.delete<void>(`/payments/${id}`, token || undefined);
  },

  async getByInvoice(invoiceId: number): Promise<Payment[]> {
    const token = authService.getToken();
    return api.get<Payment[]>(`/invoices/${invoiceId}/payments`, token || undefined);
  },
};
import type {
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerVehicle
} from '~/types/customer';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import { api } from './api';
import { authService } from './auth';

export const customerService = {
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<Customer>> {
    const token = authService.getToken();
    const queryString = new URLSearchParams(params as any).toString();
    return api.get<PaginatedResponse<Customer>>(
      `/customers${queryString ? `?${queryString}` : ''}`,
      token || undefined
    );
  },

  async getById(id: number): Promise<Customer> {
    const token = authService.getToken();
    return api.get<Customer>(`/customers/${id}`, token || undefined);
  },

  async create(data: CreateCustomerData): Promise<Customer> {
    const token = authService.getToken();
    return api.post<Customer>('/customers', data, token || undefined);
  },

  async update(id: number, data: UpdateCustomerData): Promise<Customer> {
    const token = authService.getToken();
    return api.put<Customer>(`/customers/${id}`, data, token || undefined);
  },

  async delete(id: number): Promise<void> {
    const token = authService.getToken();
    return api.delete<void>(`/customers/${id}`, token || undefined);
  },

  async getVehicles(customerId: number): Promise<CustomerVehicle[]> {
    const token = authService.getToken();
    return api.get<CustomerVehicle[]>(`/customers/${customerId}/vehicles`, token || undefined);
  },
};

