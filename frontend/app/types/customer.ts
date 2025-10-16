export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  user_id?: number;
  customer_code?: string; // ✅ Thêm customer_code
  insurance_company?: string;
  insurance_number?: string;
  insurance_expiry?: string;
  notes?: string;
  preferences?: string; // key=value|key=value
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: any;
  vehicles?: any[];
  vehicles_count?: number; // ✅ Thêm vehicles_count từ backend
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
  phone: string;
  email?: string;
  address?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  insurance_company?: string;
  insurance_number?: string;
  insurance_expiry?: string;
  notes?: string;
  is_active?: boolean;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  // No id field - it's passed as URL parameter
}
