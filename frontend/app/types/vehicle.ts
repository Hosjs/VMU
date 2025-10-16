// Vehicle related types
export interface VehicleBrand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  country?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleModel {
  id: number;
  name: string;
  slug: string;
  brand_id: number;
  type?: string; // sedan, suv, hatchback, etc.
  year_start?: number;
  year_end?: number;
  engine_type?: string;
  fuel_type?: string;
  image_urls?: string; // URL|URL|URL
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  brand?: VehicleBrand;
}

export interface Vehicle {
  id: number;
  customer_id: number;
  brand_id: number;
  model_id: number;
  license_plate: string;
  vin?: string; // Số khung
  engine_number?: string; // Số máy
  year?: number;
  color?: string;
  mileage: number; // Số km đã đi
  insurance_company?: string;
  insurance_number?: string;
  insurance_expiry?: string;
  registration_number?: string;
  registration_expiry?: string; // Hạn đăng kiểm
  last_maintenance?: string;
  next_maintenance?: string;
  maintenance_interval: number; // Chu kỳ bảo dưỡng (km)
  image_urls?: string; // URL|URL|URL
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  customer?: any;
  brand?: VehicleBrand;
  model?: VehicleModel;
}

export interface VehicleInspection {
  id: number;
  inspection_number: string;
  order_id: number;
  vehicle_id: number;
  customer_id: number;
  type: 'receive' | 'return'; // Nhận xe hoặc trả xe
  inspector_id: number;
  customer_representative_id?: number;
  mileage: number;
  fuel_level?: number; // 0-100%
  exterior_condition?: string; // part:condition|part:condition
  exterior_damages?: string; // part:damage_type:severity|...
  interior_condition?: string;
  interior_damages?: string;
  functional_checks?: string; // function:status|function:status
  functional_issues?: string;
  personal_items?: string; // Danh sách đồ vật, ngăn cách bởi |
  vehicle_accessories?: string; // phụ kiện:status, ngăn cách bởi |
  image_urls?: string; // URL|URL|URL
  video_urls?: string; // URL|URL|URL
  inspector_notes?: string;
  customer_notes?: string;
  customer_acknowledged: boolean;
  customer_acknowledged_at?: string;
  customer_signature?: string;
  inspector_signature?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'disputed';
  inspection_date: string;
  created_at: string;
  updated_at: string;
  order?: any;
  vehicle?: Vehicle;
  customer?: any;
  inspector?: any;
}

export interface PartnerVehicleHandover {
  id: number;
  handover_number: string; // BG-YYYYMMDD-001
  order_id: number;
  vehicle_id: number;
  provider_id: number;
  handover_type: 'delivery' | 'return'; // delivery: giao xe, return: nhận lại xe
  delivered_by?: number; // Nhân viên Thắng Trường giao xe
  delivered_by_name?: string;
  delivered_by_phone?: string;
  received_by_technician?: number;
  received_by_name: string; // Tên kỹ thuật viên nhận xe
  received_by_phone: string;
  received_by_position?: string; // technician, foreman, manager
  technician_license_number?: string;
  mileage: number;
  fuel_level?: number; // 0-100%
  vehicle_condition?: string; // good|fair|poor
  included_items?: string; // Đồ dùng kèm theo, ngăn cách bởi |
  vehicle_documents?: string; // registration|insurance
  work_description: string; // Mô tả công việc cần làm
  special_instructions?: string;
  expected_completion?: string;
  handover_image_urls?: string; // URL ảnh xe, ngăn cách bởi |
  damage_image_urls?: string;
  delivered_by_signature?: string;
  received_by_signature?: string;
  is_acknowledged: boolean;
  acknowledged_at?: string;
  delivery_notes?: string;
  receive_notes?: string;
  admin_notes?: string;
  status: 'draft' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'disputed';
  handover_date: string;
  planned_return_date?: string;
  created_at: string;
  updated_at: string;
  order?: any;
  vehicle?: Vehicle;
  provider?: any;
}

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

export interface CreateVehicleHandoverData {
  order_id: number;
  vehicle_id: number;
  provider_id: number;
  handover_type: 'delivery' | 'return';
  delivered_by?: number;
  delivered_by_name?: string;
  delivered_by_phone?: string;
  received_by_name: string;
  received_by_phone: string;
  received_by_position?: string;
  mileage: number;
  fuel_level?: number;
  work_description: string;
  handover_date: string;
  expected_completion?: string;
}
// Provider (Gara liên kết) types
export interface Provider {
  id: number;
  code: string;
  name: string;
  business_name?: string;
  tax_code?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  bank_name?: string;
  bank_account?: string;
  bank_branch?: string;
  service_types?: string; // 'repair,parts,maintenance'
  specializations?: string; // 'engine,electrical,bodywork'
  commission_rate: number;
  payment_terms: number; // Thời hạn thanh toán (ngày)
  credit_limit: number;
  payment_method: 'cash' | 'transfer' | 'check';
  rating: number; // 0-10
  completed_orders: number;
  average_completion_time: number; // Giờ
  status: 'active' | 'inactive' | 'suspended' | 'blacklisted';
  contract_start?: string;
  contract_end?: string;
  notes?: string;
  attachment_urls?: string; // URL|URL|URL
  managed_by?: number;
  created_at: string;
  updated_at: string;
  manager?: any; // User
}

export interface CreateProviderData {
  code: string;
  name: string;
  business_name?: string;
  tax_code?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  bank_name?: string;
  bank_account?: string;
  bank_branch?: string;
  service_types?: string;
  specializations?: string;
  commission_rate?: number;
  payment_terms?: number;
  credit_limit?: number;
  payment_method?: 'cash' | 'transfer' | 'check';
  contract_start?: string;
  contract_end?: string;
  notes?: string;
  managed_by?: number;
}

export interface UpdateProviderData extends Partial<CreateProviderData> {
  id: number;
}

export interface QuotationRequest {
  id: number;
  request_number: string; // YC-YYYYMMDD-001
  service_request_id: number;
  provider_id: number;
  admin_id: number;
  required_services?: any; // JSON
  required_parts?: any; // JSON
  work_description: string;
  special_requirements?: string;
  requested_at: string;
  deadline?: string;
  responded_at?: string;
  status: 'sent' | 'received' | 'quoted' | 'accepted' | 'rejected' | 'expired';
  admin_notes?: string;
  attachments?: any; // JSON
  created_at: string;
  updated_at: string;
}

export interface PartnerQuotation {
  id: number;
  quotation_number: string; // BG-[MaGara]-YYYYMMDD-001
  quotation_request_id: number;
  provider_id: number;
  service_cost: number; // CHỈ ADMIN XEM
  parts_cost: number; // CHỈ ADMIN XEM
  labor_cost: number; // CHỈ ADMIN XEM
  other_costs: number; // CHỈ ADMIN XEM
  total_cost: number; // Tổng chi phí - CHỈ ADMIN XEM
  parts_breakdown?: any; // JSON
  parts_source?: 'partner_stock' | 'need_from_viet_nga' | 'external_purchase';
  estimated_hours?: number;
  estimated_completion?: string;
  terms_conditions?: string;
  warranty_months: number;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  admin_only_pricing: boolean; // Chỉ admin xem giá
  provider_contact_person?: string;
  submitted_at?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  provider_notes?: string;
  admin_notes?: string;
  attachments?: any; // JSON
  created_at: string;
  updated_at: string;
}

export interface CreatePartnerQuotationData {
  quotation_request_id: number;
  provider_id: number;
  service_cost: number;
  parts_cost: number;
  labor_cost: number;
  other_costs?: number;
  parts_breakdown?: any;
  parts_source?: 'partner_stock' | 'need_from_viet_nga' | 'external_purchase';
  estimated_hours?: number;
  estimated_completion?: string;
  terms_conditions?: string;
  warranty_months?: number;
  provider_notes?: string;
}
