import { apiService } from '../api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import type { Settlement } from '~/types/settlement';

export interface SettlementFormData {
  order_id: number;
  provider_id: number;
  type: 'service' | 'product' | 'mixed';
  work_description: string;
  settlement_subtotal: number;
  settlement_tax_percent?: number;
  commission_percent?: number;
  deduction_amount?: number;
  notes?: string;
}

class SettlementService {
  private readonly BASE_PATH = '/financial/settlements';

  async getSettlements(params: TableQueryParams): Promise<PaginatedResponse<Settlement>> {
    return apiService.getPaginated<Settlement>(this.BASE_PATH, params);
  }

  async getSettlementById(id: number): Promise<Settlement> {
    return apiService.get<Settlement>(`${this.BASE_PATH}/${id}`);
  }

  async createSettlement(data: SettlementFormData): Promise<Settlement> {
    return apiService.post<Settlement>(this.BASE_PATH, data);
  }

  async approveSettlement(id: number): Promise<Settlement> {
    return apiService.post<Settlement>(`${this.BASE_PATH}/${id}/approve`, {});
  }
}

export const settlementService = new SettlementService();
