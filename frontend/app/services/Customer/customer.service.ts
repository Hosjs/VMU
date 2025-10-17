import { apiService } from '../api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';
import type { Customer, CreateCustomerData, UpdateCustomerData } from '~/types/customer';

export interface CustomerStatistics {
  total: number;
  active: number;
  inactive: number;
  with_insurance: number;
  total_orders: number;
  total_revenue: number;
}

class CustomerService {
  private readonly BASE_PATH = '/customers';

  constructor() {
    // ✅ Bind tất cả methods để giữ context
    this.getCustomers = this.getCustomers.bind(this);
    this.getCustomerById = this.getCustomerById.bind(this);
    this.createCustomer = this.createCustomer.bind(this);
    this.updateCustomer = this.updateCustomer.bind(this);
    this.deleteCustomer = this.deleteCustomer.bind(this);
    this.getStatistics = this.getStatistics.bind(this);
  }

  async getCustomers(params: TableQueryParams): Promise<PaginatedResponse<Customer>> {
    return apiService.getPaginated<Customer>(this.BASE_PATH, params);
  }

  async getCustomerById(id: number): Promise<Customer> {
    return apiService.get<Customer>(`${this.BASE_PATH}/${id}`);
  }

  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    return apiService.post<Customer>(this.BASE_PATH, data);
  }

  async updateCustomer(id: number, data: UpdateCustomerData): Promise<Customer> {
    return apiService.put<Customer>(`${this.BASE_PATH}/${id}`, data);
  }

  async deleteCustomer(id: number): Promise<void> {
    return apiService.delete<void>(`${this.BASE_PATH}/${id}`);
  }

  async getStatistics(): Promise<CustomerStatistics> {
    return apiService.get<CustomerStatistics>(`${this.BASE_PATH}/statistics`);
  }
}

export const customerService = new CustomerService();
