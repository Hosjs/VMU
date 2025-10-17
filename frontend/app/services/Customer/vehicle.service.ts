import { apiService } from '../api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import type { Vehicle } from '~/types/vehicle';

export interface CreateVehicleData {
  customer_id: number;
  license_plate: string;
  brand_id?: number;
  model_id?: number;
  year?: number;
  color?: string;
  vin?: string;
  engine_number?: string;
  notes?: string;
}

class VehicleService {
  private readonly BASE_PATH = '/vehicles';

  constructor() {
    // ✅ Bind methods để giữ context
    this.getVehicles = this.getVehicles.bind(this);
    this.getVehicle = this.getVehicle.bind(this);
    this.getByLicensePlate = this.getByLicensePlate.bind(this);
    this.getByCustomer = this.getByCustomer.bind(this);
    this.createVehicle = this.createVehicle.bind(this);
    this.updateVehicle = this.updateVehicle.bind(this);
    this.deleteVehicle = this.deleteVehicle.bind(this);
  }

  async getVehicles(params?: TableQueryParams): Promise<PaginatedResponse<Vehicle>> {
    return apiService.getPaginated<Vehicle>(this.BASE_PATH, params || { page: 1, per_page: 10 });
  }

  async getVehicle(id: number): Promise<Vehicle> {
    return apiService.get<Vehicle>(`${this.BASE_PATH}/${id}`);
  }

  async getByLicensePlate(licensePlate: string): Promise<Vehicle> {
    return apiService.get<Vehicle>(`${this.BASE_PATH}/license-plate/${licensePlate}`);
  }

  async getByCustomer(customerId: number): Promise<Vehicle[]> {
    return apiService.get<Vehicle[]>(`/customers/${customerId}/vehicles`);
  }

  async createVehicle(data: CreateVehicleData): Promise<Vehicle> {
    return apiService.post<Vehicle>(this.BASE_PATH, data);
  }

  async updateVehicle(id: number, data: Partial<CreateVehicleData>): Promise<Vehicle> {
    return apiService.put<Vehicle>(`${this.BASE_PATH}/${id}`, data);
  }

  async deleteVehicle(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }
}

export const vehicleService = new VehicleService();
