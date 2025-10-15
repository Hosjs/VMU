# Hệ thống Badge Counts Động cho Sidebar Menu

## Tổng quan

Hệ thống hiển thị số đếm động trên các menu item trong sidebar, cập nhật tự động theo thời gian thực dựa trên dữ liệu từ database.

## Kiến trúc

### Backend (Laravel)

#### 1. BadgeController (`app/Http/Controllers/Api/Admin/BadgeController.php`)

**Chức năng:**
- Tính toán số đếm cho từng loại badge dựa theo role và trạng thái
- Cung cấp 2 endpoints:
  - `GET /api/badges/counts` - Lấy tất cả số đếm
  - `GET /api/badges/count/{type}` - Lấy số đếm cho một loại cụ thể

**Logic đếm theo role:**

##### Admin Role:
- **orders**: Đơn hàng có status: `draft`, `quoted`, `confirmed`, `in_progress`
- **invoices**: Hóa đơn có payment_status: `pending`, `partial` và status: `draft`, `pending`, `sent`
- **service_requests**: Yêu cầu dịch vụ có status: `pending`, `quoted`

##### Manager Role:
- **orders**: Đơn hàng có status: `confirmed`, `in_progress`
- **service_requests**: Yêu cầu dịch vụ có status: `pending`, `quoted`, `approved`

##### Accountant Role:
- **invoices**: Hóa đơn chưa thanh toán hoặc thanh toán 1 phần
- **orders**: Đơn hàng đã hoàn thành nhưng chưa thanh toán đủ

##### Mechanic Role:
- **work_orders**: Đơn hàng dịch vụ được giao cho mechanic, status: `confirmed`, `in_progress`
- **service_requests**: Yêu cầu dịch vụ được giao, status: `approved`, `in_progress`

##### Employee Role:
- **work_orders**: Công việc được giao (salesperson hoặc technician)

#### 2. API Routes (`routes/api.php`)

```php
Route::middleware('auth:api')->group(function () {
    Route::prefix('badges')->group(function () {
        Route::get('/counts', [BadgeController::class, 'getCounts']);
        Route::get('/count/{type}', [BadgeController::class, 'getCount']);
    });
});
```

### Frontend (React)

#### 1. Badge Service (`app/services/badge.service.ts`)

**Chức năng:**
- Gọi API để lấy badge counts
- Type-safe với TypeScript interfaces

**Methods:**
- `getCounts()`: Lấy tất cả số đếm
- `getCount(type)`: Lấy số đếm cho một loại cụ thể

#### 2. Custom Hook (`app/hooks/useBadgeCounts.ts`)

**Features:**
- Auto-fetch khi component mount
- Auto-refresh theo interval (default: 30 giây)
- Loading và error states
- Manual refresh function

**Usage:**
```typescript
const { counts, isLoading, error, refresh } = useBadgeCounts({
  refreshInterval: 30000, // 30 seconds
  autoFetch: true,
});
```

#### 3. Sidebar Component (`app/layouts/Sidebar.tsx`)

**Cập nhật:**
- Sử dụng `useBadgeCounts` hook để lấy số đếm động
- Hiển thị badge chỉ khi count > 0
- Badge có animation pulse để thu hút sự chú ý

**Badge Key Mapping:**
- `orders` → Menu "Đơn hàng"
- `invoices` → Menu "Hóa đơn"
- `service_requests` → Menu "Yêu cầu dịch vụ"
- `work_orders` → Menu "Lệnh sửa chữa" / "Công việc"
- `notifications` → Menu notifications (chưa implement)

## Cấu trúc Database

### Orders Table
```sql
status: draft, quoted, confirmed, in_progress, completed, delivered, paid, cancelled
payment_status: pending, partial, paid, refunded
type: service, product, mixed
```

### Invoices Table
```sql
status: draft, pending, sent, paid, overdue, cancelled
payment_status: pending, partial, paid, refunded
```

### Service Requests Table
```sql
status: pending, quoted, approved, in_progress, completed, cancelled
```

## Cách sử dụng

### 1. Thêm badge mới cho menu item

Trong `Sidebar.tsx`, thêm `badgeKey` vào menu item:

```typescript
{
  title: 'Menu Item',
  path: '/path',
  icon: <Icon d="..." />,
  badgeKey: 'orders', // orders | invoices | service_requests | work_orders
}
```

### 2. Thay đổi refresh interval

```typescript
const { counts } = useBadgeCounts({
  refreshInterval: 60000, // 60 giây
});
```

### 3. Manual refresh

```typescript
const { counts, refresh } = useBadgeCounts();

// Gọi refresh khi cần
await refresh();
```

### 4. Disable auto-refresh

```typescript
const { counts } = useBadgeCounts({
  refreshInterval: 0, // Tắt auto-refresh
  autoFetch: false,   // Không tự động fetch khi mount
});
```

## Tối ưu hóa

### Backend
- Query được optimize với index trên các cột `status`, `payment_status`
- Chỉ count, không fetch toàn bộ data
- Cache kết quả nếu cần (có thể thêm Redis)

### Frontend
- Sử dụng React hooks để tránh re-render không cần thiết
- Auto-cleanup interval khi unmount
- Error handling gracefully

## Testing

### Test Backend API

```bash
# Lấy tất cả counts
curl -X GET http://localhost:8000/api/badges/counts \
  -H "Authorization: Bearer {token}"

# Lấy count cho orders
curl -X GET http://localhost:8000/api/badges/count/orders \
  -H "Authorization: Bearer {token}"
```

### Test Frontend

1. Login với các role khác nhau
2. Kiểm tra badge hiển thị đúng trên sidebar
3. Tạo order/invoice mới → Badge count tăng
4. Cập nhật status → Badge count thay đổi
5. Đợi 30 giây → Badge tự động refresh

## Mở rộng

### Thêm loại badge mới

1. **Backend**: Thêm logic đếm trong `BadgeController::getCounts()`
2. **Frontend**: 
   - Thêm type vào `BadgeCounts` interface
   - Thêm `badgeKey` vào menu item tương ứng

### Thêm real-time update (WebSocket)

Có thể tích hợp Laravel Echo + Pusher/Socket.io để update real-time thay vì polling.

## Troubleshooting

### Badge không hiển thị
- Kiểm tra API endpoint hoạt ��ộng
- Kiểm tra authentication token
- Xem console logs cho errors

### Số đếm không đúng
- Kiểm tra logic query trong `BadgeController`
- Verify database data
- Check role của user hiện tại

### Performance issues
- Giảm `refreshInterval`
- Thêm database indexes
- Consider caching

## Changelog

### Version 1.0.0 (2024-10-15)
- Initial implementation
- Support cho 5 loại badges: orders, invoices, service_requests, work_orders, notifications
- Auto-refresh mỗi 30 giây
- Role-based counting logic

