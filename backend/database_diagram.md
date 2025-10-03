// Database Schema for Gara Management System
// Compatible with dbdiagram.io

// Core User Management
Table users {
  id bigint [pk, increment]
  name varchar(255) [not null]
  email varchar(255) [unique, not null]
  phone varchar(20)
  avatar varchar(500)
  birth_date date
  gender enum('male', 'female', 'other')
  address text
  employee_code varchar(50) [unique]
  position varchar(100)
  department varchar(100)
  hire_date date
  salary decimal(15,2)
  is_active boolean [default: true]
  notes text
  email_verified_at timestamp
  password varchar(255) [not null]
  remember_token varchar(100)
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    phone
    employee_code
    (is_active, position)
  }
}

Table roles {
  id bigint [pk, increment]
  name varchar(50) [unique, not null]
  display_name varchar(100) [not null]
  description text
  permissions json
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table user_roles {
  id bigint [pk, increment]
  user_id bigint [ref: > users.id, not null]
  role_id bigint [ref: > roles.id, not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

// Customer Management
Table customers {
  id bigint [pk, increment]
  name varchar(255) [not null]
  phone varchar(20) [unique, not null]
  email varchar(255)
  address text
  birth_date date
  gender enum('male', 'female', 'other')
  user_id bigint [ref: > users.id]
  insurance_company varchar(255)
  insurance_number varchar(100)
  insurance_expiry date
  notes text
  preferences json
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    (phone, is_active)
    email
    insurance_expiry
  }
}

// Vehicle Management
Table vehicle_brands {
  id bigint [pk, increment]
  name varchar(100) [unique, not null]
  logo varchar(500)
  country varchar(100)
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table vehicle_models {
  id bigint [pk, increment]
  brand_id bigint [ref: > vehicle_brands.id, not null]
  name varchar(100) [not null]
  model_code varchar(50)
  year_from int
  year_to int
  fuel_type enum('gasoline', 'diesel', 'electric', 'hybrid')
  engine_capacity varchar(20)
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table vehicles {
  id bigint [pk, increment]
  customer_id bigint [ref: > customers.id, not null]
  brand_id bigint [ref: > vehicle_brands.id, not null]
  model_id bigint [ref: > vehicle_models.id, not null]
  license_plate varchar(20) [unique, not null]
  vin varchar(50) [unique]
  engine_number varchar(50)
  year int
  color varchar(50)
  mileage int [default: 0]
  insurance_company varchar(255)
  insurance_number varchar(100)
  insurance_expiry date
  registration_number varchar(50)
  registration_expiry date
  last_maintenance date
  next_maintenance date
  maintenance_interval int [default: 10000]
  images json
  notes text
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    (customer_id, is_active)
    (brand_id, model_id)
    license_plate
    insurance_expiry
    registration_expiry
    next_maintenance
  }
}

// Service & Product Categories
Table categories {
  id bigint [pk, increment]
  name varchar(255) [not null]
  description text
  parent_id bigint [ref: > categories.id]
  image varchar(500)
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table services {
  id bigint [pk, increment]
  name varchar(255) [not null]
  code varchar(50) [unique, not null]
  description text
  category_id bigint [ref: > categories.id, not null]
  quote_price decimal(15,2) [default: 0, note: 'Giá báo cho khách']
  settlement_price decimal(15,2) [default: 0, note: 'Giá thanh toán cho đối tác']
  unit varchar(20) [default: 'service']
  estimated_duration int
  requires_parts boolean [default: false]
  required_skills json
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    (category_id, is_active)
    code
  }
}

Table products {
  id bigint [pk, increment]
  name varchar(255) [not null]
  code varchar(50) [unique, not null]
  sku varchar(50) [unique, not null]
  description text
  category_id bigint [ref: > categories.id, not null]
  primary_warehouse_id bigint [ref: > warehouses.id]
  quote_price decimal(15,2) [default: 0, note: 'Giá báo cho khách']
  settlement_price decimal(15,2) [default: 0, note: 'Giá thanh toán cho đối tác']
  unit varchar(20) [default: 'piece']
  images json
  specifications text
  is_stockable boolean [default: true]
  track_by_serial boolean [default: false]
  track_by_batch boolean [default: false]
  shelf_life_days int
  auto_transfer_enabled boolean [default: true]
  transfer_threshold int [default: 5]
  track_stock boolean [default: true]
  has_warranty boolean [default: false]
  warranty_months int [default: 0]
  supplier_name varchar(255)
  supplier_code varchar(50)
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    (category_id, is_active)
    (code, sku)
    (primary_warehouse_id, is_stockable)
    (track_by_serial, track_by_batch)
  }
}

// Provider & Warehouse Management
Table providers {
  id bigint [pk, increment]
  code varchar(20) [unique, not null]
  name varchar(255) [not null]
  business_name varchar(255)
  tax_code varchar(20)
  contact_person varchar(255)
  phone varchar(20)
  email varchar(255)
  address text
  website varchar(500)
  bank_name varchar(255)
  bank_account varchar(50)
  bank_branch varchar(255)
  service_types json [note: 'repair, parts, both']
  specializations json [note: 'engine, electrical, bodywork, etc.']
  commission_rate decimal(5,2) [default: 0]
  payment_terms int [default: 30, note: 'Thời hạn thanh toán (ngày)']
  credit_limit decimal(15,2) [default: 0]
  payment_method enum('cash', 'transfer', 'check') [default: 'transfer']
  rating decimal(3,2) [default: 0, note: 'Điểm đánh giá 0-10']
  completed_orders int [default: 0]
  average_completion_time decimal(8,2) [default: 0, note: 'Thời gian hoàn thành trung bình (giờ)']
  status enum('active', 'inactive', 'suspended', 'blacklisted') [default: 'active']
  contract_start date
  contract_end date
  notes text
  attachments json
  managed_by bigint [ref: > users.id]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    (code, status)
    (status, rating)
    tax_code
    managed_by
  }
}

Table warehouses {
  id bigint [pk, increment]
  code varchar(10) [unique, not null]
  name varchar(255) [not null]
  type enum('main', 'partner') [note: 'main: Việt Nga, partner: các gara nhận dịch vụ']
  address text [not null]
  ward varchar(100)
  district varchar(100) [not null]
  province varchar(100) [not null]
  postal_code varchar(20)
  contact_person varchar(255)
  phone varchar(20)
  email varchar(255)
  provider_id bigint [ref: > providers.id]
  is_main_warehouse boolean [default: false, note: 'Việt Nga = true']
  can_receive_transfers boolean [default: true]
  can_send_transfers boolean [default: true]
  priority_order int [default: 1, note: 'Thứ tự ưu tiên lấy hàng']
  tax_exempt_transfers boolean [default: true]
  tax_registration varchar(50)
  is_active boolean [default: true]
  last_inventory_date datetime
  manager_id bigint [ref: > users.id]
  notes text
  operating_hours json
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    (type, is_active)
    (is_main_warehouse, is_active)
    provider_id
  }
}

Table warehouse_stocks {
  id bigint [pk, increment]
  warehouse_id bigint [ref: > warehouses.id, not null]
  product_id bigint [ref: > products.id, not null]
  quantity int [default: 0]
  reserved_quantity int [default: 0]
  available_quantity int [default: 0]
  unit_cost decimal(15,2) [default: 0]
  total_value decimal(15,2) [default: 0]
  min_stock int [default: 0]
  max_stock int [default: 0]
  reorder_point int [default: 0]
  economic_order_quantity int [default: 0]
  location_code varchar(20)
  shelf varchar(10)
  row varchar(10)
  position varchar(10)
  last_movement_date datetime
  last_stocktake_date datetime
  movement_count int [default: 0]
  is_locked boolean [default: false]
  is_damaged boolean [default: false]
  is_expired boolean [default: false]
  expiry_date date
  notes text
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    (warehouse_id, product_id) [unique]
    (warehouse_id, available_quantity)
    (product_id, quantity)
    (min_stock, quantity)
    location_code
  }
}

// Service Requests & Workflow (NGHIỆP VỤ MỚI)
Table service_requests {
  id bigint [pk, increment]
  code varchar(50) [unique, not null]
  customer_name varchar(255) [not null]
  customer_phone varchar(20) [not null]
  customer_email varchar(255)
  customer_address text
  customer_id bigint [ref: > customers.id]
  vehicle_brand varchar(100)
  vehicle_model varchar(100)
  vehicle_name varchar(100)
  license_plate varchar(20)
  vehicle_year int
  requested_services json
  description text
  preferred_date datetime
  status enum('pending', 'contacted', 'scheduled', 'in_progress', 'completed', 'cancelled') [default: 'pending']
  processing_stage enum('customer_submitted', 'admin_reviewing', 'finding_partner', 'partner_quoting', 'admin_pricing', 'customer_approving', 'work_assigned', 'parts_sourcing', 'work_in_progress', 'settlement_pending', 'completed') [default: 'customer_submitted']
  assigned_to bigint [ref: > users.id]
  admin_handler bigint [ref: > users.id, note: 'Admin phụ trách xử lý']
  selected_provider_id bigint [ref: > providers.id, note: 'Gara liên kết được chọn']
  contacted_at datetime
  scheduled_at datetime
  admin_reviewed_at datetime
  partner_found_at datetime
  partner_quoted_at datetime
  customer_quoted_at datetime
  admin_notes text
  priority enum('low', 'normal', 'high', 'urgent') [default: 'normal']
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    (status, priority)
    (customer_phone, status)
    (assigned_to, status)
    preferred_date
  }
}

Table quotation_requests {
  id bigint [pk, increment]
  request_number varchar(50) [unique, not null, note: 'YC-YYYYMMDD-001']
  service_request_id bigint [ref: > service_requests.id, not null]
  provider_id bigint [ref: > providers.id, not null]
  admin_id bigint [ref: > users.id, not null]
  required_services json
  required_parts json
  work_description text [not null]
  special_requirements text
  requested_at datetime [not null]
  deadline datetime
  responded_at datetime
  status enum('sent', 'received', 'quoted', 'accepted', 'rejected', 'expired') [default: 'sent']
  admin_notes text
  attachments json
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    (service_request_id, status)
    (provider_id, status)
    (admin_id, status)
    (requested_at, status)
    (deadline, status)
  }
}

Table partner_quotations {
  id bigint [pk, increment]
  quotation_number varchar(50) [unique, not null, note: 'BG-[MaGara]-YYYYMMDD-001']
  quotation_request_id bigint [ref: > quotation_requests.id, not null]
  provider_id bigint [ref: > providers.id, not null]
  service_cost decimal(15,2) [default: 0, note: 'Chi phí dịch vụ - CHỈ ADMIN XEM']
  parts_cost decimal(15,2) [default: 0, note: 'Chi phí phụ tùng - CHỈ ADMIN XEM']
  labor_cost decimal(15,2) [default: 0, note: 'Chi phí nhân công - CHỈ ADMIN XEM']
  other_costs decimal(15,2) [default: 0, note: 'Chi phí khác - CHỈ ADMIN XEM']
  total_cost decimal(15,2) [not null, note: 'Tổng chi phí (GIÁ QUYẾT TOÁN VỚI THẮNG TRƯỜNG) - CHỈ ADMIN XEM']
  parts_breakdown json
  parts_source enum('partner_stock', 'need_from_viet_nga', 'external_purchase')
  estimated_hours int
  estimated_completion datetime
  terms_conditions text
  warranty_months int [default: 0]
  status enum('draft', 'submitted', 'under_review', 'accepted', 'rejected') [default: 'draft']
  admin_only_pricing boolean [default: true, note: 'Chỉ admin xem giá quyết toán']
  provider_contact_person varchar(255)
  submitted_at datetime
  reviewed_by bigint [ref: > users.id]
  reviewed_at datetime
  provider_notes text
  admin_notes text
  attachments json
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    (quotation_request_id, status)
    (provider_id, status)
    parts_source
    (submitted_at, status)
    (admin_only_pricing, status)
  }
}

Table parts_transfer_requests {
  id bigint [pk, increment]
  transfer_number varchar(50) [unique, not null, note: 'CK-YYYYMMDD-001']
  order_id bigint [ref: > orders.id, not null]
  partner_quotation_id bigint [ref: > partner_quotations.id, not null]
  from_warehouse_id bigint [ref: > warehouses.id, not null, note: 'Kho Việt Nga']
  to_provider_id bigint [ref: > providers.id, not null, note: 'Gara liên kết']
  parts_list json [note: 'Danh sách phụ tùng cần chuyển (CHỈ ADMIN XEM GIÁ)']
  total_value decimal(15,2) [note: 'Tổng giá trị (CHỈ ADMIN XEM)']
  transfer_type enum('direct_to_partner', 'via_thang_truong') [default: 'via_thang_truong']
  admin_only_access boolean [default: true, note: 'Chỉ admin xem được']
  status enum('requested', 'approved', 'prepared', 'shipped', 'received', 'completed') [default: 'requested']
  requested_at datetime [not null]
  approved_at datetime
  shipped_at datetime
  received_at datetime
  requested_by bigint [ref: > users.id, not null]
  approved_by bigint [ref: > users.id]
  shipped_by bigint [ref: > users.id]
  notes text
  shipping_info json
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    (order_id, status)
    (from_warehouse_id, status)
    (to_provider_id, status)
    (requested_at, status)
    (admin_only_access, status)
  }
}

// Orders & Sales
Table orders {
  id bigint [pk, increment]
  order_number varchar(50) [unique, not null]
  customer_id bigint [ref: > customers.id, not null]
  vehicle_id bigint [ref: > vehicles.id]
  service_request_id bigint [ref: > service_requests.id]
  partner_quotation_id bigint [ref: > partner_quotations.id]
  type enum('service', 'product', 'mixed') [not null]
  invoice_issuer enum('thang_truong', 'viet_nga') [default: 'thang_truong']
  parts_fulfillment enum('no_parts', 'from_viet_nga', 'from_partner', 'mixed') [default: 'no_parts']
  status enum('draft', 'quoted', 'confirmed', 'in_progress', 'completed', 'delivered', 'paid', 'cancelled') [default: 'draft']
  quote_total decimal(15,2) [default: 0, note: 'Tổng báo giá cho khách']
  settlement_total decimal(15,2) [default: 0, note: 'Tổng thanh toán cho đối tác']
  discount decimal(15,2) [default: 0]
  tax_amount decimal(15,2) [default: 0]
  final_amount decimal(15,2) [default: 0, note: 'Số tiền cuối cùng khách trả']
  partner_settlement_cost decimal(15,2) [default: 0, note: 'Chi phí quyết toán với gara liên kết (CHỈ ADMIN THẤY)']
  thang_truong_profit decimal(15,2) [default: 0, note: 'Lợi nhuận Thắng Trường']
  admin_controlled boolean [default: false, note: 'true: chỉ admin kiểm soát, false: nhân viên có thể xem một số thông tin']
  payment_status enum('pending', 'partial', 'paid', 'refunded') [default: 'pending']
  payment_method enum('cash', 'transfer', 'card', 'installment')
  paid_amount decimal(15,2) [default: 0]
  salesperson_id bigint [ref: > users.id]
  technician_id bigint [ref: > users.id]
  accountant_id bigint [ref: > users.id]
  quote_date datetime
  confirmed_date datetime
  start_date datetime
  completion_date datetime
  delivery_date datetime
  notes text
  attachments json
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    (customer_id, status)
    (order_number, status)
    (type, status)
    payment_status
    (salesperson_id, status)
  }
}

Table order_items {
  id bigint [pk, increment]
  order_id bigint [ref: > orders.id, not null]
  product_id bigint [ref: > products.id]
  service_id bigint [ref: > services.id]
  item_name varchar(255) [not null]
  quantity int [not null]
  unit_price decimal(15,2) [not null]
  total_price decimal(15,2) [not null]
  settlement_price decimal(15,2) [note: 'Giá quyết toán với đối tác']
  description text
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

// Invoicing & Financial
Table invoices {
  id bigint [pk, increment]
  invoice_number varchar(50) [unique, not null]
  order_id bigint [ref: > orders.id, not null]
  customer_id bigint [ref: > customers.id, not null]
  vehicle_id bigint [ref: > vehicles.id]
  issuer enum('thang_truong', 'viet_nga') [default: 'thang_truong', note: 'Ai xuất hóa đơn']
  admin_only_access boolean [default: false, note: 'Chỉ admin được xem/sửa - QUAN TRỌNG cho hóa đơn từ Việt Nga']
  issuing_warehouse_id bigint [ref: > warehouses.id]
  invoice_date date [not null]
  due_date date
  customer_name varchar(255) [not null]
  customer_phone varchar(20) [not null]
  customer_email varchar(255)
  customer_address text
  customer_tax_code varchar(20)
  vehicle_info varchar(500)
  subtotal decimal(15,2) [not null, note: 'Tổng tiền trước thuế và giảm giá']
  discount_amount decimal(15,2) [default: 0]
  discount_percent decimal(5,2) [default: 0]
  tax_amount decimal(15,2) [default: 0]
  tax_percent decimal(5,2) [default: 10]
  total_amount decimal(15,2) [not null, note: 'Tổng tiền cuối cùng']
  actual_cost decimal(15,2) [note: 'Chi phí thực tế - CHỈ ADMIN XEM ĐƯỢC']
  actual_profit decimal(15,2) [note: 'Lợi nhuận thực tế - CHỈ ADMIN XEM ĐƯỢC']
  partner_settlement_cost decimal(15,2) [default: 0, note: 'Chi phí quyết toán với gara liên kết - CHỈ ADMIN XEM']
  status enum('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled') [default: 'draft']
  paid_amount decimal(15,2) [default: 0]
  remaining_amount decimal(15,2) [default: 0]
  payment_status enum('unpaid', 'partial', 'paid', 'overpaid') [default: 'unpaid']
  created_by bigint [ref: > users.id, not null]
  approved_by bigint [ref: > users.id]
  approved_at datetime
  notes text
  customer_notes text
  terms_conditions text
  attachments json
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    (customer_id, status)
    (invoice_date, status)
    (due_date, payment_status)
    invoice_number
    (issuer, admin_only_access)
    (issuing_warehouse_id, status)
  }
}

Table settlements {
  id bigint [pk, increment]
  settlement_number varchar(50) [unique, not null]
  order_id bigint [ref: > orders.id, not null]
  invoice_id bigint [ref: > invoices.id]
  provider_id bigint [ref: > providers.id]
  partner_quotation_id bigint [ref: > partner_quotations.id]
  provider_name varchar(255) [not null]
  provider_code varchar(20)
  provider_contact varchar(255)
  provider_phone varchar(20)
  provider_email varchar(255)
  provider_address text
  provider_tax_code varchar(20)
  provider_bank_account varchar(50)
  type enum('service', 'product', 'mixed') [not null]
  settlement_with enum('thang_truong_partner', 'viet_nga_partner', 'internal') [note: 'thang_truong_partner: Thắng Trường quyết toán với gara liên kết, viet_nga_partner: Việt Nga quyết toán với gara liên kết (CHỈ ADMIN XEM), internal: quyết toán nội bộ']
  work_description text
  work_start_date date
  work_completion_date date
  settlement_subtotal decimal(15,2) [not null, note: 'Tổng tiền trước thuế']
  settlement_tax_amount decimal(15,2) [default: 0]
  settlement_tax_percent decimal(5,2) [default: 10]
  settlement_total decimal(15,2) [not null, note: 'Tổng tiền quyết toán']
  commission_amount decimal(15,2) [default: 0]
  commission_percent decimal(5,2) [default: 0]
  deduction_amount decimal(15,2) [default: 0]
  final_payment decimal(15,2) [not null, note: 'Số tiền thực trả']
  parts_transfer_cost decimal(15,2) [default: 0, note: 'Chi phí chuyển phụ tùng (nếu có) - CHỈ ADMIN XEM']
  total_actual_cost decimal(15,2) [default: 0, note: 'Tổng chi phí thực tế - CHỈ ADMIN XEM']
  customer_quoted_total decimal(15,2)
  profit_margin decimal(15,2)
  profit_percent decimal(5,2)
  customer_payment_amount decimal(15,2)
  net_profit_after_settlement decimal(15,2) [default: 0]
  admin_only_access boolean [default: false, note: 'true khi settlement_with = viet_nga_partner']
  status enum('draft', 'pending_approval', 'approved', 'paid', 'completed', 'disputed') [default: 'draft']
  payment_status enum('unpaid', 'partial', 'paid') [default: 'unpaid']
  paid_amount decimal(15,2) [default: 0]
  payment_method enum('cash', 'transfer', 'check')
  payment_due_date date
  payment_date date
  created_by bigint [ref: > users.id, not null]
  approved_by bigint [ref: > users.id]
  accountant_id bigint [ref: > users.id]
  approved_at datetime
  notes text
  provider_notes text
  attachments json
  work_evidence json
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    (order_id, status)
    (provider_code, status)
    (payment_status, payment_due_date)
    (type, status)
    settlement_number
  }
}

Table payments {
  id bigint [pk, increment]
  payment_number varchar(50) [unique, not null]
  order_id bigint [ref: > orders.id, not null]
  customer_id bigint [ref: > customers.id, not null]
  amount decimal(15,2) [not null]
  method enum('cash', 'transfer', 'card', 'check') [not null]
  status enum('pending', 'processing', 'completed', 'failed', 'cancelled') [not null]
  payment_date date [not null]
  reference_number varchar(100)
  notes text
  processed_by bigint [ref: > users.id]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table settlement_payments {
  id bigint [pk, increment]
  settlement_id bigint [ref: > settlements.id, not null]
  amount decimal(15,2) [not null]
  method enum('cash', 'transfer', 'check') [not null]
  status enum('pending', 'processing', 'completed', 'failed', 'cancelled') [not null]
  payment_date date [not null]
  reference_number varchar(100)
  notes text
  processed_by bigint [ref: > users.id]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

// Stock Management
Table stock_transfers {
  id bigint [pk, increment]
  transfer_number varchar(50) [unique, not null]
  from_warehouse_id bigint [ref: > warehouses.id, not null]
  to_warehouse_id bigint [ref: > warehouses.id, not null]
  type enum('internal', 'inter_company') [not null]
  reason enum('restock', 'customer_request', 'maintenance', 'return', 'adjustment') [not null]
  order_id bigint [ref: > orders.id]
  status enum('draft', 'pending', 'in_transit', 'received', 'completed', 'cancelled') [default: 'draft']
  transfer_date date [not null]
  expected_arrival date
  actual_arrival date
  transport_method varchar(100)
  tracking_number varchar(50)
  is_tax_exempt boolean [default: true]
  tax_exemption_code varchar(50)
  tax_amount decimal(15,2) [default: 0]
  tax_notes text
  total_cost decimal(15,2) [default: 0]
  shipping_cost decimal(15,2) [default: 0]
  insurance_cost decimal(15,2) [default: 0]
  created_by bigint [ref: > users.id, not null]
  approved_by bigint [ref: > users.id]
  sent_by bigint [ref: > users.id]
  received_by bigint [ref: > users.id]
  approved_at datetime
  sent_at datetime
  received_at datetime
  notes text
  shipping_instructions text
  attachments json
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    (from_warehouse_id, status)
    (to_warehouse_id, status)
    (transfer_date, status)
    order_id
    (is_tax_exempt, type)
  }
}

Table stock_movements {
  id bigint [pk, increment]
  warehouse_id bigint [ref: > warehouses.id, not null]
  product_id bigint [ref: > products.id, not null]
  type enum('in', 'out', 'transfer_in', 'transfer_out', 'adjustment') [not null]
  quantity int [not null]
  unit_cost decimal(15,2) [default: 0]
  total_cost decimal(15,2) [default: 0]
  reference_number varchar(50)
  order_id bigint [ref: > orders.id]
  transfer_id bigint [ref: > stock_transfers.id]
  reason text
  created_by bigint [ref: > users.id, not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

// Additional Tables
Table warranties {
  id bigint [pk, increment]
  order_id bigint [ref: > orders.id, not null]
  product_id bigint [ref: > products.id]
  service_id bigint [ref: > services.id]
  warranty_number varchar(50) [unique, not null]
  start_date date [not null]
  end_date date [not null]
  terms text
  status enum('active', 'expired', 'claimed', 'voided') [not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table vehicle_inspections {
  id bigint [pk, increment]
  vehicle_id bigint [ref: > vehicles.id, not null]
  order_id bigint [ref: > orders.id]
  inspection_date date [not null]
  findings text
  checklist_results json
  mileage_at_inspection decimal(10,2)
  inspector_id bigint [ref: > users.id, not null]
  recommendations text
  photos json
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table notifications {
  id bigint [pk, increment]
  user_id bigint [ref: > users.id, not null]
  type varchar(50) [not null]
  title varchar(255) [not null]
  message text
  data json
  read_at datetime
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}
