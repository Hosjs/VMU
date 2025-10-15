export interface Service {
  id: number;
  name: string;
  code: string;
  description?: string;
  unit: string; // 'lần', 'giờ', etc.
  estimated_time: number; // Thời gian ước tính (phút)
  main_image?: string;
  gallery_images?: string; // URL|URL|URL
  notes?: string;
  has_warranty: boolean;
  warranty_months: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: number;
  code: string; // Mã yêu cầu dịch vụ
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  customer_id?: number; // Liên kết khách hàng đã đăng ký
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_name?: string;
  license_plate?: string;
  vehicle_year?: number;
  description?: string;
  preferred_date?: string;
  status: 'pending' | 'contacted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: number;
  admin_handler?: number; // Admin phụ trách
  selected_provider_id?: number; // Gara liên kết được chọn
  contacted_at?: string;
  scheduled_at?: string;
  admin_notes?: string;
  attachment_urls?: string; // URL file, ngăn cách bởi |
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  customer?: any;
  assigned_user?: any;
  admin?: any;
  selected_provider?: any;
}

export interface CreateServiceRequestData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_name?: string;
  license_plate?: string;
  vehicle_year?: number;
  description?: string;
  preferred_date?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface UpdateServiceRequestData extends Partial<CreateServiceRequestData> {
  id: number;
  status?: 'pending' | 'contacted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: number;
  admin_handler?: number;
  selected_provider_id?: number;
  admin_notes?: string;
}
