export * from './invoice.service';
export * from './payment.service';
export * from './settlement.service';
import { apiService } from '../api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import type { Invoice } from '~/types/invoice';

export interface InvoiceStatistics {
  total: number;
  pending: number;
  paid: number;
  cancelled: number;
  total_revenue: number;
}

class InvoiceService {
  private readonly BASE_PATH = '/financial/invoices';

  async getInvoices(params: TableQueryParams): Promise<PaginatedResponse<Invoice>> {
    return apiService.getPaginated<Invoice>(this.BASE_PATH, params);
  }

  async getInvoiceById(id: number): Promise<Invoice> {
    return apiService.get<Invoice>(`${this.BASE_PATH}/${id}`);
  }

  async updateInvoiceStatus(id: number, status: string): Promise<Invoice> {
    return apiService.post<Invoice>(`${this.BASE_PATH}/${id}/status`, { status });
  }

  async cancelInvoice(id: number, reason?: string): Promise<Invoice> {
    return apiService.post<Invoice>(`${this.BASE_PATH}/${id}/cancel`, { reason });
  }

  async getStatistics(): Promise<InvoiceStatistics> {
    return apiService.get<InvoiceStatistics>(`${this.BASE_PATH}/statistics`);
  }
}

export const invoiceService = new InvoiceService();

