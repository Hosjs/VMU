// Warehouse API Service
import { apiService } from './api.service';
import type {
  Warehouse,
  WarehouseStock,
  StockTransfer,
  StockMovement,
  CreateWarehouseData,
  CreateStockTransferData,
  PaginatedResponse,
  TableQueryParams
} from '~/types';

export const warehouseService = {
  // Warehouse CRUD
  async getAll(params?: TableQueryParams): Promise<PaginatedResponse<Warehouse>> {
    return apiService.getPaginated<Warehouse>('/admin/warehouses', params);
  },

  async getById(id: number): Promise<Warehouse> {
    return apiService.get<Warehouse>(`/admin/warehouses/${id}`);
  },

  async create(data: CreateWarehouseData): Promise<Warehouse> {
    return apiService.post<Warehouse>('/admin/warehouses', data);
  },

  async update(id: number, data: Partial<CreateWarehouseData>): Promise<Warehouse> {
    return apiService.put<Warehouse>(`/admin/warehouses/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    await apiService.delete(`/admin/warehouses/${id}`);
  },

  // Warehouse Stock Management
  async getStocks(warehouseId: number, params?: TableQueryParams): Promise<PaginatedResponse<WarehouseStock>> {
    return apiService.getPaginated<WarehouseStock>(`/admin/warehouses/${warehouseId}/stocks`, params);
  },

  async getStockByProduct(warehouseId: number, productId: number): Promise<WarehouseStock> {
    return apiService.get<WarehouseStock>(`/admin/warehouses/${warehouseId}/stocks/${productId}`);
  },

  async updateStock(warehouseId: number, productId: number, data: any): Promise<WarehouseStock> {
    return apiService.put<WarehouseStock>(`/admin/warehouses/${warehouseId}/stocks/${productId}`, data);
  },

  async adjustStock(warehouseId: number, productId: number, quantity: number, reason: string): Promise<WarehouseStock> {
    const response = await apiService.post<WarehouseStock>(`/admin/warehouses/${warehouseId}/stocks/${productId}/adjust`, {
      quantity,
      reason
    });
    return response.data;
  },

  // Stock Transfers
  async getTransfers(params?: TableQueryParams): Promise<PaginatedResponse<StockTransfer>> {
    const response = await apiService.getPaginated<StockTransfer>('/stock-transfers', params);
    return response.data;
  },

  async getTransferById(id: number): Promise<StockTransfer> {
    const response = await apiService.get<StockTransfer>(`/stock-transfers/${id}`);
    return response.data;
  },

  async createTransfer(data: CreateStockTransferData): Promise<StockTransfer> {
    const response = await apiService.post<StockTransfer>('/stock-transfers', data);
    return response.data;
  },

  async updateTransfer(id: number, data: Partial<CreateStockTransferData>): Promise<StockTransfer> {
    const response = await apiService.put<StockTransfer>(`/stock-transfers/${id}`, data);
    return response.data;
  },

  async approveTransfer(id: number): Promise<StockTransfer> {
    const response = await apiService.post<StockTransfer>(`/stock-transfers/${id}/approve`);
    return response.data;
  },

  async sendTransfer(id: number): Promise<StockTransfer> {
    const response = await apiService.post<StockTransfer>(`/stock-transfers/${id}/send`);
    return response.data;
  },

  async receiveTransfer(id: number, receivedItems: any[]): Promise<StockTransfer> {
    const response = await apiService.post<StockTransfer>(`/stock-transfers/${id}/receive`, { items: receivedItems });
    return response.data;
  },

  async cancelTransfer(id: number, reason: string): Promise<StockTransfer> {
    const response = await apiService.post<StockTransfer>(`/stock-transfers/${id}/cancel`, { reason });
    return response.data;
  },

  // Stock Movements (History)
  async getMovements(params?: TableQueryParams): Promise<PaginatedResponse<StockMovement>> {
    const response = await apiService.getPaginated<StockMovement>('/stock-movements', params);
    return response.data;
  },

  async getMovementsByWarehouse(warehouseId: number, params?: TableQueryParams): Promise<PaginatedResponse<StockMovement>> {
    const response = await apiService.getPaginated<StockMovement>(`/warehouses/${warehouseId}/movements`, params);
    return response.data;
  },

  async getMovementsByProduct(productId: number, params?: TableQueryParams): Promise<PaginatedResponse<StockMovement>> {
    const response = await apiService.getPaginated<StockMovement>(`/products/${productId}/movements`, params);
    return response.data;
  },

  // Warehouse Reports
  async getInventoryReport(warehouseId: number, options?: any): Promise<any> {
    const response = await apiService.get<any>(`/warehouses/${warehouseId}/inventory-report`, { params: options });
    return response.data;
  },

  async getLowStockProducts(warehouseId: number): Promise<WarehouseStock[]> {
    const response = await apiService.get<WarehouseStock[]>(`/warehouses/${warehouseId}/low-stock`);
    return response.data;
  },

  async getExpiringSoonProducts(warehouseId: number, days: number = 30): Promise<WarehouseStock[]> {
    const response = await apiService.get<WarehouseStock[]>(`/warehouses/${warehouseId}/expiring-soon`, { params: { days } });
    return response.data;
  },

  async getStockValueReport(warehouseId: number): Promise<any> {
    const response = await apiService.get<any>(`/warehouses/${warehouseId}/stock-value`);
    return response.data;
  },

  // Inventory Checking
  async startStocktake(warehouseId: number): Promise<any> {
    const response = await apiService.post<any>(`/warehouses/${warehouseId}/stocktake/start`);
    return response.data;
  },

  async submitStocktakeCount(warehouseId: number, productId: number, count: number): Promise<any> {
    const response = await apiService.post<any>(`/warehouses/${warehouseId}/stocktake/count`, {
      product_id: productId,
      counted_quantity: count
    });
    return response.data;
  },

  async completeStocktake(warehouseId: number): Promise<any> {
    const response = await apiService.post<any>(`/warehouses/${warehouseId}/stocktake/complete`);
    return response.data;
  },
};
