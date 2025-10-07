# API ADMIN - DOCUMENTATION

## Tổng quan hệ thống API Admin cho Garage Management System

Hệ thống API được thiết kế đầy đủ cho quản lý xưởng sửa xe với các module:
- User & Role Management
- Customer Management
- Services & Products Management
- Order Management
- Warehouse & Inventory Management
- Provider (Partner) Management
- Invoice & Payment Management
- Dashboard & Reports

---

## Authentication

Tất cả các API Admin yêu cầu JWT token trong header:

```
Authorization: Bearer {your-jwt-token}
```

### Đăng nhập
```
POST /api/auth/login
{
    "email": "admin@example.com",
    "password": "password"
}
```

---

## 1. DASHBOARD APIs

### Tổng quan Dashboard
```
GET /api/admin/dashboard/overview?date_from=2024-01-01&date_to=2024-12-31
```

**Response:**
- Orders statistics (total, pending, completed, revenue)
- Payments statistics
- Customers statistics
- Inventory statistics
- Recent orders & payments
- Revenue trend (7 days)

### Báo cáo Doanh thu
```
GET /api/admin/dashboard/revenue-report?date_from=2024-01-01&date_to=2024-12-31&group_by=day
```
Params: `group_by` = day|week|month

### Báo cáo Lợi nhuận
```
GET /api/admin/dashboard/profit-report?date_from=2024-01-01&date_to=2024-12-31
```

### Top Customers
```
GET /api/admin/dashboard/top-customers?limit=10
```

### Top Services/Products
```
GET /api/admin/dashboard/top-services?limit=10
GET /api/admin/dashboard/top-products?limit=10
```

---

## 2. USER MANAGEMENT APIs

### Danh sách Users
```
GET /api/admin/users?per_page=15&search=&role_id=&is_active=&department=&sort_by=created_at&sort_order=desc
```

### Tạo User mới
```
POST /api/admin/users
{
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "password": "password123",
    "phone": "0123456789",
    "role_id": 1,
    "employee_code": "EMP001",
    "position": "Nhân viên",
    "department": "Kỹ thuật",
    "hire_date": "2024-01-01",
    "salary": 10000000,
    "birth_date": "1990-01-01",
    "gender": "male",
    "address": "Hà Nội",
    "is_active": true,
    "notes": "Ghi chú"
}
```

### Xem chi tiết User
```
GET /api/admin/users/{id}
```

### Cập nhật User
```
PUT /api/admin/users/{id}
{
    // Same fields as create
}
```

### Xóa User (Deactivate)
```
DELETE /api/admin/users/{id}
```

### Kích hoạt lại User
```
POST /api/admin/users/{id}/activate
```

### Lấy danh sách Departments
```
GET /api/admin/users-departments
```

### Lấy danh sách Positions
```
GET /api/admin/users-positions
```

### Thống kê Users
```
GET /api/admin/users-statistics
```

---

## 3. ROLE MANAGEMENT APIs

### Danh sách Roles
```
GET /api/admin/roles?is_active=1&search=
```

### Tạo Role mới
```
POST /api/admin/roles
{
    "name": "manager",
    "display_name": "Quản lý",
    "description": "Quản lý cửa hàng",
    "permissions": {
        "orders": ["view", "create", "edit"],
        "customers": ["view", "create", "edit"]
    },
    "is_active": true
}
```

### Xem chi tiết Role
```
GET /api/admin/roles/{id}
```

### Cập nhật Role
```
PUT /api/admin/roles/{id}
```

### Xóa Role
```
DELETE /api/admin/roles/{id}
```

### Danh sách Permissions
```
GET /api/admin/roles-permissions
```

---

## 4. CUSTOMER MANAGEMENT APIs

### Danh sách Customers
```
GET /api/admin/customers?per_page=15&search=&is_active=1
```

### Tạo Customer mới
```
POST /api/admin/customers
{
    "name": "Nguyễn Văn B",
    "phone": "0987654321",
    "email": "customer@example.com",
    "address": "123 ABC Street",
    "birth_date": "1985-05-15",
    "gender": "male",
    "insurance_company": "Bảo hiểm ABC",
    "insurance_number": "INS123456",
    "insurance_expiry": "2025-12-31",
    "notes": "Khách hàng VIP",
    "is_active": true
}
```

### Xem chi tiết Customer
```
GET /api/admin/customers/{id}
```
Includes: vehicles, recent orders, invoices, service requests

### Cập nhật Customer
```
PUT /api/admin/customers/{id}
```

### Xóa Customer (Deactivate)
```
DELETE /api/admin/customers/{id}
```

### Thống kê Customers
```
GET /api/admin/customers-statistics
```

---

## 5. SERVICE MANAGEMENT APIs

### Danh sách Services
```
GET /api/admin/services?per_page=15&search=&category_id=&is_active=1&has_warranty=
```

### Tạo Service mới
```
POST /api/admin/services
{
    "name": "Thay dầu động cơ",
    "code": "SV001",
    "description": "Thay dầu động cơ chính hãng",
    "category_id": 1,
    "quote_price": 500000,
    "settlement_price": 350000,
    "unit": "lần",
    "estimated_time": 60,
    "main_image": "/images/service.jpg",
    "gallery_images": "img1.jpg|img2.jpg",
    "has_warranty": true,
    "warranty_months": 6,
    "is_active": true
}
```

### Xem chi tiết Service
```
GET /api/admin/services/{id}
```

### Cập nhật Service
```
PUT /api/admin/services/{id}
```

### Xóa Service (Deactivate)
```
DELETE /api/admin/services/{id}
```

### Thống kê Services
```
GET /api/admin/services-statistics
```

---

## 6. PRODUCT MANAGEMENT APIs

### Danh sách Products
```
GET /api/admin/products?per_page=15&search=&category_id=&is_active=1&is_stockable=&track_stock=
```

### Tạo Product mới
```
POST /api/admin/products
{
    "name": "Lốp xe Michelin",
    "code": "PRD001",
    "sku": "MICH-195-65-R15",
    "description": "Lốp xe Michelin 195/65R15",
    "category_id": 2,
    "primary_warehouse_id": 1,
    "quote_price": 1500000,
    "settlement_price": 1200000,
    "unit": "cái",
    "is_stockable": true,
    "track_stock": true,
    "has_warranty": true,
    "warranty_months": 12,
    "supplier_name": "Nhà cung cấp ABC",
    "is_active": true
}
```

### Xem chi tiết Product
```
GET /api/admin/products/{id}
```
Includes: warehouse stocks

### Cập nhật Product
```
PUT /api/admin/products/{id}
```

### Xóa Product (Deactivate)
```
DELETE /api/admin/products/{id}
```

### Thống kê Products
```
GET /api/admin/products-statistics
```

### Sản phẩm sắp hết hàng
```
GET /api/admin/products-low-stock?per_page=15
```

---

## 7. CATEGORY MANAGEMENT APIs

### Danh sách Categories
```
GET /api/admin/categories?search=&type=&is_active=1
```
Type: service|product|both

### Tạo Category mới
```
POST /api/admin/categories
{
    "name": "Bảo dưỡng định kỳ",
    "code": "CAT001",
    "type": "service",
    "description": "Các dịch vụ bảo dưỡng định kỳ",
    "parent_id": null,
    "icon": "wrench",
    "display_order": 1,
    "is_active": true
}
```

### Xem chi tiết Category
```
GET /api/admin/categories/{id}
```

### Cập nhật Category
```
PUT /api/admin/categories/{id}
```

### Xóa Category
```
DELETE /api/admin/categories/{id}
```

### Cập nhật thứ tự hiển thị
```
POST /api/admin/categories/update-order
{
    "categories": [
        {"id": 1, "display_order": 1},
        {"id": 2, "display_order": 2}
    ]
}
```

---

## 8. ORDER MANAGEMENT APIs

### Danh sách Orders
```
GET /api/admin/orders?per_page=15&search=&status=&payment_status=&type=&customer_id=&date_from=&date_to=
```

Status: pending|confirmed|in_progress|completed|cancelled|partner_processing|partner_completed
Payment Status: unpaid|partial|paid|refunded
Type: repair|maintenance|warranty|partner

### Xem chi tiết Order
```
GET /api/admin/orders/{id}
```

### Cập nhật trạng thái Order
```
POST /api/admin/orders/{id}/update-status
{
    "status": "confirmed",
    "notes": "Đã xác nhận đơn hàng"
}
```

### Cập nhật trạng thái Thanh toán
```
POST /api/admin/orders/{id}/update-payment-status
{
    "payment_status": "paid",
    "paid_amount": 5000000,
    "payment_method": "cash"
}
```

### Gán nhân viên cho Order
```
POST /api/admin/orders/{id}/assign-staff
{
    "salesperson_id": 1,
    "technician_id": 2,
    "accountant_id": 3
}
```

### Hủy Order
```
POST /api/admin/orders/{id}/cancel
{
    "cancel_reason": "Khách hàng hủy đơn"
}
```

### Thống kê Orders
```
GET /api/admin/orders-statistics?date_from=2024-01-01&date_to=2024-12-31
```

---

## 9. WAREHOUSE MANAGEMENT APIs

### Danh sách Warehouses
```
GET /api/admin/warehouses?per_page=15&search=&type=&is_active=1&provider_id=
```

Type: main|branch|partner|virtual

### Tạo Warehouse mới
```
POST /api/admin/warehouses
{
    "code": "WH001",
    "name": "Kho chính Hà Nội",
    "type": "main",
    "address": "123 ABC Street",
    "province": "Hà Nội",
    "phone": "0123456789",
    "is_main_warehouse": true,
    "can_receive_transfers": true,
    "can_send_transfers": true,
    "manager_id": 1,
    "is_active": true
}
```

### Xem chi tiết Warehouse
```
GET /api/admin/warehouses/{id}
```

### Cập nhật Warehouse
```
PUT /api/admin/warehouses/{id}
```

### Xóa Warehouse (Deactivate)
```
DELETE /api/admin/warehouses/{id}
```

### Lấy tồn kho của Warehouse
```
GET /api/admin/warehouses/{id}/stocks?per_page=15&search=&low_stock=1
```

### Kiểm kê kho
```
POST /api/admin/warehouses/{id}/stocktake
{
    "items": [
        {
            "product_id": 1,
            "actual_quantity": 100,
            "notes": "Kiểm kê định kỳ"
        }
    ]
}
```

### Thống kê Warehouses
```
GET /api/admin/warehouses-statistics
```

---

## 10. PROVIDER (PARTNER) MANAGEMENT APIs

### Danh sách Providers
```
GET /api/admin/providers?per_page=15&search=&status=&service_type=
```

Status: active|inactive|suspended

### Tạo Provider mới
```
POST /api/admin/providers
{
    "code": "PRV001",
    "name": "Đối tác ABC",
    "business_name": "Công ty TNHH ABC",
    "tax_code": "0123456789",
    "contact_person": "Nguyễn Văn A",
    "phone": "0123456789",
    "email": "partner@example.com",
    "address": "123 Street",
    "service_types": "repair,maintenance",
    "commission_rate": 15,
    "payment_terms": 30,
    "credit_limit": 50000000,
    "rating": 4.5,
    "status": "active",
    "managed_by": 1
}
```

### Xem chi tiết Provider
```
GET /api/admin/providers/{id}
```

### Cập nhật Provider
```
PUT /api/admin/providers/{id}
```

### Xóa Provider (Deactivate)
```
DELETE /api/admin/providers/{id}
```

### Cập nhật đánh giá Provider
```
POST /api/admin/providers/{id}/update-rating
{
    "rating": 4.5,
    "notes": "Làm việc tốt"
}
```

### Thống kê Providers
```
GET /api/admin/providers-statistics
```

---

## 11. INVOICE MANAGEMENT APIs

### Danh sách Invoices
```
GET /api/admin/invoices?per_page=15&search=&status=&type=&customer_id=&date_from=&date_to=
```

Status: draft|issued|paid|cancelled|refunded
Type: retail|wholesale|warranty

### Xem chi tiết Invoice
```
GET /api/admin/invoices/{id}
```

### Cập nhật trạng thái Invoice
```
POST /api/admin/invoices/{id}/update-status
{
    "status": "paid",
    "notes": "Đã thanh toán đầy đủ"
}
```

### Hủy Invoice
```
POST /api/admin/invoices/{id}/cancel
{
    "cancel_reason": "Đơn hàng bị hủy"
}
```

### Thống kê Invoices
```
GET /api/admin/invoices-statistics?date_from=2024-01-01&date_to=2024-12-31
```

---

## 12. PAYMENT MANAGEMENT APIs

### Danh sách Payments
```
GET /api/admin/payments?per_page=15&search=&status=&method=&customer_id=&date_from=&date_to=
```

Status: pending|completed|failed|cancelled|refunded
Method: cash|bank_transfer|credit_card|ewallet

### Xem chi tiết Payment
```
GET /api/admin/payments/{id}
```

### Xác nhận Payment
```
POST /api/admin/payments/{id}/confirm
{
    "confirmed_amount": 5000000,
    "notes": "Đã nhận tiền mặt"
}
```

### Hủy Payment
```
POST /api/admin/payments/{id}/cancel
{
    "cancel_reason": "Lỗi giao dịch"
}
```

### Thống kê Payments
```
GET /api/admin/payments-statistics?date_from=2024-01-01&date_to=2024-12-31
```

---

## Response Format

### Success Response
```json
{
    "success": true,
    "data": {...},
    "message": "Operation successful"
}
```

### Error Response
```json
{
    "success": false,
    "message": "Error message",
    "errors": {...}
}
```

### Pagination Response
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [...],
        "total": 100,
        "per_page": 15,
        "last_page": 7
    }
}
```

---

## HTTP Status Codes

- `200` OK - Request successful
- `201` Created - Resource created successfully
- `400` Bad Request - Invalid request
- `401` Unauthorized - Authentication required
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `422` Unprocessable Entity - Validation errors
- `500` Internal Server Error - Server error

---

## Notes

1. Tất cả date/datetime sử dụng định dạng: `Y-m-d` hoặc `Y-m-d H:i:s`
2. Tất cả số tiền (amount) sử dụng decimal(10,2)
3. Pagination mặc định: 15 items/page
4. Sort order: asc|desc
5. Search hỗ trợ tìm kiếm theo nhiều fields liên quan
6. Các action "delete" thường là "deactivate" để giữ dữ liệu lịch sử


