export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  company_name?: string;
  tax_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerVehicle {
  id: number;
  customer_id: number;
  license_plate: string;
  brand: string;
  model: string;
  year?: number;
  vin?: string;
  engine_number?: string;
  color?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export interface CreateCustomerData {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  company_name?: string;
  tax_code?: string;
  notes?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: number;
}

