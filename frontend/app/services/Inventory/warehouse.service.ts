import { apiService } from '../api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import type { Warehouse } from '~/types/warehouse';

export interface WarehouseFormData {
  name: string;
  code: string;
  location: string;
  capacity?: number;
  manager_id?: number;
}

class WarehouseService {
  private readonly BASE_PATH = '/inventory/warehouses';

  constructor() {
    // ✅ Bind methods
    this.getWarehouses = this.getWarehouses.bind(this);
    this.getWarehouseById = this.getWarehouseById.bind(this);
    this.createWarehouse = this.createWarehouse.bind(this);
    this.updateWarehouse = this.updateWarehouse.bind(this);
  }

  async getWarehouses(params?: TableQueryParams): Promise<PaginatedResponse<Warehouse>> {
    return apiService.getPaginated<Warehouse>(this.BASE_PATH, params || { page: 1, per_page: 10 });
  }

  async getWarehouseById(id: number): Promise<Warehouse> {
    return apiService.get<Warehouse>(`${this.BASE_PATH}/${id}`);
  }

  async createWarehouse(data: WarehouseFormData): Promise<Warehouse> {
    return apiService.post<Warehouse>(this.BASE_PATH, data);
  }

  async updateWarehouse(id: number, data: Partial<WarehouseFormData>): Promise<Warehouse> {
    return apiService.put<Warehouse>(`${this.BASE_PATH}/${id}`, data);
  }
}

export const warehouseService = new WarehouseService();
