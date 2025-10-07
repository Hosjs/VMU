// Warehouse API Service
import { apiClient } from '~/utils/api';
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
    const response = await apiClient.get('/warehouses', { params });
    return response.data;
  },

  async getById(id: number): Promise<Warehouse> {
    const response = await apiClient.get(`/warehouses/${id}`);
    return response.data;
  },

  async create(data: CreateWarehouseData): Promise<Warehouse> {
    const response = await apiClient.post('/warehouses', data);
    return response.data;
  },

  async update(id: number, data: Partial<CreateWarehouseData>): Promise<Warehouse> {
    const response = await apiClient.put(`/warehouses/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/warehouses/${id}`);
  },

  // Warehouse Stock Management
  async getStocks(warehouseId: number, params?: TableQueryParams): Promise<PaginatedResponse<WarehouseStock>> {
    const response = await apiClient.get(`/warehouses/${warehouseId}/stocks`, { params });
    return response.data;
  },

  async getStockByProduct(warehouseId: number, productId: number): Promise<WarehouseStock> {
    const response = await apiClient.get(`/warehouses/${warehouseId}/stocks/${productId}`);
    return response.data;
  },

  async updateStock(warehouseId: number, productId: number, data: any): Promise<WarehouseStock> {
    const response = await apiClient.put(`/warehouses/${warehouseId}/stocks/${productId}`, data);
    return response.data;
  },

  async adjustStock(warehouseId: number, productId: number, quantity: number, reason: string): Promise<WarehouseStock> {
    const response = await apiClient.post(`/warehouses/${warehouseId}/stocks/${productId}/adjust`, {
      quantity,
      reason
    });
    return response.data;
  },

  // Stock Transfers
  async getTransfers(params?: TableQueryParams): Promise<PaginatedResponse<StockTransfer>> {
    const response = await apiClient.get('/stock-transfers', { params });
    return response.data;
  },

  async getTransferById(id: number): Promise<StockTransfer> {
    const response = await apiClient.get(`/stock-transfers/${id}`);
    return response.data;
  },

  async createTransfer(data: CreateStockTransferData): Promise<StockTransfer> {
    const response = await apiClient.post('/stock-transfers', data);
    return response.data;
  },

  async updateTransfer(id: number, data: Partial<CreateStockTransferData>): Promise<StockTransfer> {
    const response = await apiClient.put(`/stock-transfers/${id}`, data);
    return response.data;
  },

  async approveTransfer(id: number): Promise<StockTransfer> {
    const response = await apiClient.post(`/stock-transfers/${id}/approve`);
    return response.data;
  },

  async sendTransfer(id: number): Promise<StockTransfer> {
    const response = await apiClient.post(`/stock-transfers/${id}/send`);
    return response.data;
  },

  async receiveTransfer(id: number, receivedItems: any[]): Promise<StockTransfer> {
    const response = await apiClient.post(`/stock-transfers/${id}/receive`, { items: receivedItems });
    return response.data;
  },

  async cancelTransfer(id: number, reason: string): Promise<StockTransfer> {
    const response = await apiClient.post(`/stock-transfers/${id}/cancel`, { reason });
    return response.data;
  },

  // Stock Movements (History)
  async getMovements(params?: TableQueryParams): Promise<PaginatedResponse<StockMovement>> {
    const response = await apiClient.get('/stock-movements', { params });
    return response.data;
  },

  async getMovementsByWarehouse(warehouseId: number, params?: TableQueryParams): Promise<PaginatedResponse<StockMovement>> {
    const response = await apiClient.get(`/warehouses/${warehouseId}/movements`, { params });
    return response.data;
  },

  async getMovementsByProduct(productId: number, params?: TableQueryParams): Promise<PaginatedResponse<StockMovement>> {
    const response = await apiClient.get(`/products/${productId}/movements`, { params });
    return response.data;
  },

  // Warehouse Reports
  async getInventoryReport(warehouseId: number, options?: any): Promise<any> {
    const response = await apiClient.get(`/warehouses/${warehouseId}/inventory-report`, { params: options });
    return response.data;
  },

  async getLowStockProducts(warehouseId: number): Promise<WarehouseStock[]> {
    const response = await apiClient.get(`/warehouses/${warehouseId}/low-stock`);
    return response.data;
  },

  async getExpiringSoonProducts(warehouseId: number, days: number = 30): Promise<WarehouseStock[]> {
    const response = await apiClient.get(`/warehouses/${warehouseId}/expiring-soon`, { params: { days } });
    return response.data;
  },

  async getStockValueReport(warehouseId: number): Promise<any> {
    const response = await apiClient.get(`/warehouses/${warehouseId}/stock-value`);
    return response.data;
  },

  // Inventory Checking
  async startStocktake(warehouseId: number): Promise<any> {
    const response = await apiClient.post(`/warehouses/${warehouseId}/stocktake/start`);
    return response.data;
  },

  async submitStocktakeCount(warehouseId: number, productId: number, count: number): Promise<any> {
    const response = await apiClient.post(`/warehouses/${warehouseId}/stocktake/count`, {
      product_id: productId,
      counted_quantity: count
    });
    return response.data;
  },

  async completeStocktake(warehouseId: number): Promise<any> {
    const response = await apiClient.post(`/warehouses/${warehouseId}/stocktake/complete`);
    return response.data;
  },
};

