export interface Service {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  unit: string;
  category?: string;
  estimated_time?: number; // in minutes
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: number;
  customer_id: number;
  vehicle_id: number;
  request_date: string;
  requested_services: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'high';
  estimated_cost?: number;
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  customer?: any;
  vehicle?: any;
  services?: ServiceRequestService[];
}

export interface ServiceRequestService {
  id: number;
  service_request_id: number;
  service_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  service?: Service;
}

export interface CreateServiceRequestData {
  customer_id: number;
  vehicle_id: number;
  request_date: string;
  requested_services: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  services: {
    service_id: number;
    quantity: number;
    unit_price?: number;
  }[];
}

