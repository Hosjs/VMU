import { apiService } from '../api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

export interface Payment {
  id: number;
  invoice_id: number;
  payment_method: string;
  amount: number;
  status: string;
  created_at: string;
  confirmed_at?: string;
}

export interface PaymentStatistics {
  total: number;
  confirmed: number;
  pending: number;
  total_amount: number;
}

class PaymentService {
  private readonly BASE_PATH = '/financial/payments';

  constructor() {
    // ✅ Bind methods để giữ context
    this.getPayments = this.getPayments.bind(this);
    this.getPaymentById = this.getPaymentById.bind(this);
    this.confirmPayment = this.confirmPayment.bind(this);
    this.cancelPayment = this.cancelPayment.bind(this);
    this.getStatistics = this.getStatistics.bind(this);
  }

  async getPayments(params: TableQueryParams): Promise<PaginatedResponse<Payment>> {
    return apiService.getPaginated<Payment>(this.BASE_PATH, params);
  }

  async getPaymentById(id: number): Promise<Payment> {
    return apiService.get<Payment>(`${this.BASE_PATH}/${id}`);
  }

  async confirmPayment(id: number): Promise<Payment> {
    return apiService.post<Payment>(`${this.BASE_PATH}/${id}/confirm`, {});
  }

  async cancelPayment(id: number, reason?: string): Promise<Payment> {
    return apiService.post<Payment>(`${this.BASE_PATH}/${id}/cancel`, { reason });
  }

  async getStatistics(): Promise<PaymentStatistics> {
    return apiService.get<PaymentStatistics>(`${this.BASE_PATH}/statistics`);
  }
}

export const paymentService = new PaymentService();
