// Vehicle API Service
import { apiService } from './api.service';
import type {
  Vehicle,
  VehicleBrand,
  VehicleModel,
  VehicleInspection,
  PartnerVehicleHandover,
  CreateVehicleData,
  CreateVehicleHandoverData,
  PaginatedResponse,
  TableQueryParams
} from '~/types';

export const vehicleService = {
  // Vehicle Brands
  async getBrands(params?: TableQueryParams): Promise<PaginatedResponse<VehicleBrand>> {
    return apiService.getPaginated<VehicleBrand>('/vehicle-brands', params);
  },

  async getBrandById(id: number): Promise<VehicleBrand> {
    return apiService.get<VehicleBrand>(`/vehicle-brands/${id}`);
  },

  async createBrand(data: any): Promise<VehicleBrand> {
    return apiService.post<VehicleBrand>('/vehicle-brands', data);
  },

  async updateBrand(id: number, data: any): Promise<VehicleBrand> {
    return apiService.put<VehicleBrand>(`/vehicle-brands/${id}`, data);
  },

  // Vehicle Models
  async getModels(params?: TableQueryParams): Promise<PaginatedResponse<VehicleModel>> {
    const response = await apiClient.get('/vehicle-models', { params });
    return response.data;
  },

  async getModelsByBrand(brandId: number): Promise<VehicleModel[]> {
    const response = await apiClient.get(`/vehicle-brands/${brandId}/models`);
    return response.data;
  },

  async getModelById(id: number): Promise<VehicleModel> {
    const response = await apiClient.get(`/vehicle-models/${id}`);
    return response.data;
  },

  async createModel(data: any): Promise<VehicleModel> {
    const response = await apiClient.post('/vehicle-models', data);
    return response.data;
  },

  async updateModel(id: number, data: any): Promise<VehicleModel> {
    const response = await apiClient.put(`/vehicle-models/${id}`, data);
    return response.data;
  },

  // Vehicles
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<Vehicle>> {
    const response = await apiClient.get('/vehicles', { params });
    return response.data;
  },

  async getById(id: number): Promise<Vehicle> {
    const response = await apiClient.get(`/vehicles/${id}`);
    return response.data;
  },

  async getByLicensePlate(licensePlate: string): Promise<Vehicle> {
    const response = await apiClient.get(`/vehicles/license-plate/${licensePlate}`);
    return response.data;
  },

  async getByCustomer(customerId: number): Promise<Vehicle[]> {
    const response = await apiClient.get(`/customers/${customerId}/vehicles`);
    return response.data;
  },

  async create(data: CreateVehicleData): Promise<Vehicle> {
    const response = await apiClient.post('/vehicles', data);
    return response.data;
  },

  async update(id: number, data: Partial<CreateVehicleData>): Promise<Vehicle> {
    const response = await apiClient.put(`/vehicles/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/vehicles/${id}`);
  },

  async updateMileage(id: number, mileage: number): Promise<Vehicle> {
    const response = await apiClient.post(`/vehicles/${id}/update-mileage`, { mileage });
    return response.data;
  },

  async updateMaintenance(id: number, lastMaintenance: string, nextMaintenance: string): Promise<Vehicle> {
    const response = await apiClient.post(`/vehicles/${id}/update-maintenance`, {
      last_maintenance: lastMaintenance,
      next_maintenance: nextMaintenance
    });
    return response.data;
  },

  // Vehicle Inspections
  async getInspections(vehicleId: number): Promise<VehicleInspection[]> {
    const response = await apiClient.get(`/vehicles/${vehicleId}/inspections`);
    return response.data;
  },

  async getInspectionById(id: number): Promise<VehicleInspection> {
    const response = await apiClient.get(`/vehicle-inspections/${id}`);
    return response.data;
  },

  async createInspection(data: any): Promise<VehicleInspection> {
    const response = await apiClient.post('/vehicle-inspections', data);
    return response.data;
  },

  async updateInspection(id: number, data: any): Promise<VehicleInspection> {
    const response = await apiClient.put(`/vehicle-inspections/${id}`, data);
    return response.data;
  },

  async acknowledgeInspection(id: number, signature: string): Promise<VehicleInspection> {
    const response = await apiClient.post(`/vehicle-inspections/${id}/acknowledge`, { signature });
    return response.data;
  },

  // Partner Vehicle Handovers
  async getHandovers(params?: TableQueryParams): Promise<PaginatedResponse<PartnerVehicleHandover>> {
    const response = await apiClient.get('/partner-vehicle-handovers', { params });
    return response.data;
  },

  async getHandoverById(id: number): Promise<PartnerVehicleHandover> {
    const response = await apiClient.get(`/partner-vehicle-handovers/${id}`);
    return response.data;
  },

  async getHandoversByOrder(orderId: number): Promise<PartnerVehicleHandover[]> {
    const response = await apiClient.get(`/orders/${orderId}/vehicle-handovers`);
    return response.data;
  },

  async getHandoversByProvider(providerId: number): Promise<PartnerVehicleHandover[]> {
    const response = await apiClient.get(`/providers/${providerId}/vehicle-handovers`);
    return response.data;
  },

  async createHandover(data: CreateVehicleHandoverData): Promise<PartnerVehicleHandover> {
    const response = await apiClient.post('/partner-vehicle-handovers', data);
    return response.data;
  },

  async updateHandover(id: number, data: Partial<CreateVehicleHandoverData>): Promise<PartnerVehicleHandover> {
    const response = await apiClient.put(`/partner-vehicle-handovers/${id}`, data);
    return response.data;
  },

  async acknowledgeHandover(id: number, signature: string, notes?: string): Promise<PartnerVehicleHandover> {
    const response = await apiClient.post(`/partner-vehicle-handovers/${id}/acknowledge`, {
      signature,
      notes
    });
    return response.data;
  },

  async confirmHandover(id: number): Promise<PartnerVehicleHandover> {
    const response = await apiClient.post(`/partner-vehicle-handovers/${id}/confirm`);
    return response.data;
  },

  async completeHandover(id: number): Promise<PartnerVehicleHandover> {
    const response = await apiClient.post(`/partner-vehicle-handovers/${id}/complete`);
    return response.data;
  },

  // Vehicle History & Reports
  async getServiceHistory(vehicleId: number): Promise<any[]> {
    const response = await apiClient.get(`/vehicles/${vehicleId}/service-history`);
    return response.data;
  },

  async getMaintenanceSchedule(vehicleId: number): Promise<any> {
    const response = await apiClient.get(`/vehicles/${vehicleId}/maintenance-schedule`);
    return response.data;
  },

  async getUpcomingMaintenances(days: number = 30): Promise<Vehicle[]> {
    const response = await apiClient.get('/vehicles/upcoming-maintenance', { params: { days } });
    return response.data;
  },

  async getExpiringInsurances(days: number = 30): Promise<Vehicle[]> {
    const response = await apiClient.get('/vehicles/expiring-insurance', { params: { days } });
    return response.data;
  },

  async getExpiringRegistrations(days: number = 30): Promise<Vehicle[]> {
    const response = await apiClient.get('/vehicles/expiring-registration', { params: { days } });
    return response.data;
  },
};
// Provider API Service
import { apiClient } from '~/utils/api';
import type {
  Provider,
  CreateProviderData,
  UpdateProviderData,
  PartnerQuotation,
  CreatePartnerQuotationData,
  PaginatedResponse,
  TableQueryParams
} from '~/types';

export const providerService = {
  // Provider CRUD
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<Provider>> {
    const response = await apiClient.get('/providers', { params });
    return response.data;
  },

  async getById(id: number): Promise<Provider> {
    const response = await apiClient.get(`/providers/${id}`);
    return response.data;
  },

  async create(data: CreateProviderData): Promise<Provider> {
    const response = await apiClient.post('/providers', data);
    return response.data;
  },

  async update(id: number, data: UpdateProviderData): Promise<Provider> {
    const response = await apiClient.put(`/providers/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/providers/${id}`);
  },

  // Provider stats and search
  async search(query: string): Promise<Provider[]> {
    const response = await apiClient.get('/providers/search', { params: { q: query } });
    return response.data;
  },

  async getStats(id: number): Promise<any> {
    const response = await apiClient.get(`/providers/${id}/stats`);
    return response.data;
  },

  async updateRating(id: number, rating: number, notes?: string): Promise<Provider> {
    const response = await apiClient.post(`/providers/${id}/rating`, { rating, notes });
    return response.data;
  },

  // Partner Quotations
  async getQuotations(providerId: number): Promise<PartnerQuotation[]> {
    const response = await apiClient.get(`/providers/${providerId}/quotations`);
    return response.data;
  },

  async createQuotation(data: CreatePartnerQuotationData): Promise<PartnerQuotation> {
    const response = await apiClient.post('/partner-quotations', data);
    return response.data;
  },

  async getQuotationById(id: number): Promise<PartnerQuotation> {
    const response = await apiClient.get(`/partner-quotations/${id}`);
    return response.data;
  },

  async updateQuotation(id: number, data: Partial<CreatePartnerQuotationData>): Promise<PartnerQuotation> {
    const response = await apiClient.put(`/partner-quotations/${id}`, data);
    return response.data;
  },

  async acceptQuotation(id: number): Promise<PartnerQuotation> {
    const response = await apiClient.post(`/partner-quotations/${id}/accept`);
    return response.data;
  },

  async rejectQuotation(id: number, reason: string): Promise<PartnerQuotation> {
    const response = await apiClient.post(`/partner-quotations/${id}/reject`, { reason });
    return response.data;
  },

  // Provider performance
  async getPerformanceMetrics(id: number, startDate?: string, endDate?: string): Promise<any> {
    const response = await apiClient.get(`/providers/${id}/performance`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  // Provider status management
  async activate(id: number): Promise<Provider> {
    const response = await apiClient.post(`/providers/${id}/activate`);
    return response.data;
  },

  async deactivate(id: number): Promise<Provider> {
    const response = await apiClient.post(`/providers/${id}/deactivate`);
    return response.data;
  },

  async suspend(id: number, reason: string): Promise<Provider> {
    const response = await apiClient.post(`/providers/${id}/suspend`, { reason });
    return response.data;
  },

  async blacklist(id: number, reason: string): Promise<Provider> {
    const response = await apiClient.post(`/providers/${id}/blacklist`, { reason });
    return response.data;
  },
};
