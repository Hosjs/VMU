import { apiService } from '../api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

export interface PartnerVehicleHandover {
  id: number;
  order_id: number;
  partner_id: number;
  vehicle_id: number;
  handover_date: string;
  expected_return_date: string;
  actual_return_date?: string;
  handover_notes?: string;
  return_notes?: string;
  condition_on_handover: string;
  condition_on_return?: string;
  status: 'pending' | 'handed_over' | 'in_progress' | 'returned' | 'cancelled';
  acknowledged_by?: number;
  acknowledged_at?: string;
  created_at: string;
  updated_at: string;
  order?: {
    id: number;
    order_code: string;
    status: string;
  };
  partner?: {
    id: number;
    name: string;
    phone: string;
  };
  vehicle?: {
    id: number;
    license_plate: string;
    brand: string;
    model: string;
  };
}

export interface VehicleHandoverFormData {
  order_id: number;
  partner_id: number;
  vehicle_id: number;
  handover_date: string;
  expected_return_date: string;
  handover_notes?: string;
  condition_on_handover: string;
}

class VehicleHandoverService {
  private readonly BASE_PATH = '/partners/vehicle-handovers';

  constructor() {
    // ✅ Bind methods để giữ context
    this.getHandovers = this.getHandovers.bind(this);
    this.getHandoverById = this.getHandoverById.bind(this);
    this.createHandover = this.createHandover.bind(this);
    this.updateHandover = this.updateHandover.bind(this);
    this.deleteHandover = this.deleteHandover.bind(this);
    this.acknowledgeHandover = this.acknowledgeHandover.bind(this);
    this.returnVehicle = this.returnVehicle.bind(this);
  }

  async getHandovers(params: TableQueryParams): Promise<PaginatedResponse<PartnerVehicleHandover>> {
    return apiService.getPaginated<PartnerVehicleHandover>(this.BASE_PATH, params);
  }

  async getHandoverById(id: number): Promise<PartnerVehicleHandover> {
    return apiService.get<PartnerVehicleHandover>(`${this.BASE_PATH}/${id}`);
  }

  async createHandover(data: VehicleHandoverFormData): Promise<PartnerVehicleHandover> {
    return apiService.post<PartnerVehicleHandover>(this.BASE_PATH, data);
  }

  async updateHandover(id: number, data: Partial<VehicleHandoverFormData>): Promise<PartnerVehicleHandover> {
    return apiService.put<PartnerVehicleHandover>(`${this.BASE_PATH}/${id}`, data);
  }

  async deleteHandover(id: number): Promise<void> {
    return apiService.delete<void>(`${this.BASE_PATH}/${id}`);
  }

  async acknowledgeHandover(id: number): Promise<PartnerVehicleHandover> {
    return apiService.post<PartnerVehicleHandover>(`${this.BASE_PATH}/${id}/acknowledge`, {});
  }

  async returnVehicle(id: number, data: {
    actual_return_date: string;
    condition_on_return: string;
    return_notes?: string;
  }): Promise<PartnerVehicleHandover> {
    return apiService.post<PartnerVehicleHandover>(`${this.BASE_PATH}/${id}/return`, data);
  }
}

export const vehicleHandoverService = new VehicleHandoverService();
