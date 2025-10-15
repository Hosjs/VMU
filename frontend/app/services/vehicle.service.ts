// Vehicle API Service
import { apiService } from './api.service';
import type {
  Vehicle,
  VehicleBrand,
  VehicleModel,
  VehicleInspection,
  PartnerVehicleHandover,
  CreateVehicleData,
  PaginatedResponse,
  TableQueryParams
} from '~/types';

export const vehicleService = {
  // Vehicle Brands
  async getBrands(params?: TableQueryParams): Promise<PaginatedResponse<VehicleBrand>> {
    return apiService.getPaginated<VehicleBrand>('/admin/vehicle-brands', params);
  },

  async getBrandById(id: number): Promise<VehicleBrand> {
    return apiService.get<VehicleBrand>(`/admin/vehicle-brands/${id}`);
  },

  async createBrand(data: any): Promise<VehicleBrand> {
    return apiService.post<VehicleBrand>('/admin/vehicle-brands', data);
  },

  async updateBrand(id: number, data: any): Promise<VehicleBrand> {
    return apiService.put<VehicleBrand>(`/admin/vehicle-brands/${id}`, data);
  },

  // Vehicle Models
  async getModels(params?: TableQueryParams): Promise<PaginatedResponse<VehicleModel>> {
    return apiService.getPaginated<VehicleModel>('/admin/vehicle-models', params);
  },

  async getModelsByBrand(brandId: number): Promise<VehicleModel[]> {
    return apiService.get<VehicleModel[]>(`/admin/vehicle-brands/${brandId}/models`);
  },

  async getModelById(id: number): Promise<VehicleModel> {
    return apiService.get<VehicleModel>(`/admin/vehicle-models/${id}`);
  },

  async createModel(data: any): Promise<VehicleModel> {
    return apiService.post<VehicleModel>('/admin/vehicle-models', data);
  },

  async updateModel(id: number, data: any): Promise<VehicleModel> {
    return apiService.put<VehicleModel>(`/admin/vehicle-models/${id}`, data);
  },

  // Vehicles
  async getVehicles(params?: TableQueryParams): Promise<PaginatedResponse<Vehicle>> {
    return apiService.getPaginated<Vehicle>('/admin/vehicles', params);
  },

  async getVehicle(id: number): Promise<Vehicle> {
    return apiService.get<Vehicle>(`/admin/vehicles/${id}`);
  },

  async getByLicensePlate(licensePlate: string): Promise<Vehicle> {
    return apiService.get<Vehicle>(`/admin/vehicles/license-plate/${licensePlate}`);
  },

  async getByCustomer(customerId: number): Promise<Vehicle[]> {
    return apiService.get<Vehicle[]>(`/admin/customers/${customerId}/vehicles`);
  },

  async createVehicle(data: CreateVehicleData): Promise<Vehicle> {
    return apiService.post<Vehicle>('/admin/vehicles', data);
  },

  async updateVehicle(id: number, data: Partial<CreateVehicleData>): Promise<Vehicle> {
    return apiService.put<Vehicle>(`/admin/vehicles/${id}`, data);
  },

  async deleteVehicle(id: number): Promise<void> {
    await apiService.delete(`/admin/vehicles/${id}`);
  },

  async updateMileage(id: number, mileage: number): Promise<Vehicle> {
    return apiService.post<Vehicle>(`/admin/vehicles/${id}/update-mileage`, { mileage });
  },

  async updateMaintenance(id: number, lastMaintenance: string, nextMaintenance: string): Promise<Vehicle> {
    return apiService.post<Vehicle>(`/admin/vehicles/${id}/update-maintenance`, {
      last_maintenance: lastMaintenance,
      next_maintenance: nextMaintenance
    });
  },

  // Vehicle Inspections
  async getInspections(vehicleId: number): Promise<VehicleInspection[]> {
    return apiService.get<VehicleInspection[]>(`/vehicles/${vehicleId}/inspections`);
  },

  async getInspectionById(id: number): Promise<VehicleInspection> {
    return apiService.get<VehicleInspection>(`/vehicle-inspections/${id}`);
  },

  async createInspection(data: any): Promise<VehicleInspection> {
    return apiService.post<VehicleInspection>('/vehicle-inspections', data);
  },

  async updateInspection(id: number, data: any): Promise<VehicleInspection> {
    return apiService.put<VehicleInspection>(`/vehicle-inspections/${id}`, data);
  },

  async acknowledgeInspection(id: number, signature: string): Promise<VehicleInspection> {
    return apiService.post<VehicleInspection>(`/vehicle-inspections/${id}/acknowledge`, { signature });
  },

  // Partner Vehicle Handovers
  async getHandovers(params?: TableQueryParams): Promise<PaginatedResponse<PartnerVehicleHandover>> {
    return apiService.getPaginated<PartnerVehicleHandover>('/partner-vehicle-handovers', params);
  },

  async getHandoverById(id: number): Promise<PartnerVehicleHandover> {
    return apiService.get<PartnerVehicleHandover>(`/partner-vehicle-handovers/${id}`);
  },

  async getHandoversByOrder(orderId: number): Promise<PartnerVehicleHandover[]> {
    return apiService.get<PartnerVehicleHandover[]>(`/orders/${orderId}/vehicle-handovers`);
  },

  async getHandoversByProvider(providerId: number): Promise<PartnerVehicleHandover[]> {
    return apiService.get<PartnerVehicleHandover[]>(`/providers/${providerId}/vehicle-handovers`);
  },

  async createHandover(data: any): Promise<PartnerVehicleHandover> {
    return apiService.post<PartnerVehicleHandover>('/partner-vehicle-handovers', data);
  },

  async updateHandover(id: number, data: any): Promise<PartnerVehicleHandover> {
    return apiService.put<PartnerVehicleHandover>(`/partner-vehicle-handovers/${id}`, data);
  },

  async acknowledgeHandover(id: number, signature: string, notes?: string): Promise<PartnerVehicleHandover> {
    return apiService.post<PartnerVehicleHandover>(`/partner-vehicle-handovers/${id}/acknowledge`, {
      signature,
      notes
    });
  },

  async confirmHandover(id: number): Promise<PartnerVehicleHandover> {
    return apiService.post<PartnerVehicleHandover>(`/partner-vehicle-handovers/${id}/confirm`);
  },

  async completeHandover(id: number): Promise<PartnerVehicleHandover> {
    return apiService.post<PartnerVehicleHandover>(`/partner-vehicle-handovers/${id}/complete`);
  },

  // Vehicle History & Reports
  async getServiceHistory(vehicleId: number): Promise<any[]> {
    return apiService.get<any[]>(`/vehicles/${vehicleId}/service-history`);
  },

  async getMaintenanceSchedule(vehicleId: number): Promise<any> {
    return apiService.get<any>(`/vehicles/${vehicleId}/maintenance-schedule`);
  },

  async getUpcomingMaintenances(days: number = 30): Promise<Vehicle[]> {
    return apiService.get<Vehicle[]>('/vehicles/upcoming-maintenance', { days });
  },

  async getExpiringInsurances(days: number = 30): Promise<Vehicle[]> {
    return apiService.get<Vehicle[]>('/vehicles/expiring-insurance', { days });
  },

  async getExpiringRegistrations(days: number = 30): Promise<Vehicle[]> {
    return apiService.get<Vehicle[]>('/vehicles/expiring-registration', { days });
  },
};
