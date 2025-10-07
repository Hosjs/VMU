# 📋 Hướng Dẫn Sử Dụng Layout System

## 🎯 Tổng Quan

Hệ thống layout được tổ chức trong thư mục `app/layouts/` với cấu trúc hoàn chỉnh, bao gồm:

```
app/layouts/
├── MainLayout.tsx    # Layout chính cho toàn bộ dự án
├── Header.tsx        # Component Header (thông tin user, notifications)
├── Sidebar.tsx       # Component Sidebar (menu động theo role)
├── Breadcrumb.tsx    # Component Breadcrumb (hiển thị vị trí hiện tại)
└── index.ts          # Export tất cả components
```

## ✨ Tính Năng

### 1. **MainLayout** - Layout Chung
- ✅ Dùng chung cho toàn bộ dự án
- ✅ Header và Sidebar KHÔNG reload khi navigate
- ✅ Chỉ phần content giữa (Outlet) thay đổi
- ✅ Authentication Guard tự động
- ✅ Responsive: tự động đóng sidebar trên mobile
- ✅ Smooth animations

### 2. **Header** - Thanh Tiêu Đề
- ✅ Toggle sidebar button
- ✅ Notifications với badge
- ✅ User info với avatar động
- ✅ Dropdown menu (Profile, Settings, Logout)
- ✅ Hiển thị tên và role của user
- ✅ Responsive design

### 3. **Sidebar** - Menu Điều Hướng
- ✅ Menu tự động thay đổi theo role:
  - **Admin**: 20+ menu items (quản trị toàn bộ hệ thống)
  - **Manager**: 5 menu items (quản lý đơn hàng, khách hàng, kho)
  - **Accountant**: 5 menu items (hóa đơn, thanh toán, quyết toán)
  - **Mechanic**: 3 menu items (lệnh sửa chữa, yêu cầu dịch vụ)
  - **Employee**: 2 menu items (dashboard, công việc)
- ✅ Active state cho menu hiện tại
- ✅ Badge hiển thị số lượng (notifications, pending orders)
- ✅ Icon SVG cho mỗi menu
- ✅ Smooth hover effects
- ✅ Fixed overlay trên mobile

### 4. **Breadcrumb** - Đường Dẫn Navigation
- ✅ Hiển thị vị trí hiện tại trong hệ thống
- ✅ Tự động generate từ URL
- ✅ Link có thể click để quay lại
- ✅ Responsive design

## 🚀 Cách Sử Dụng

### Bước 1: Routes đã được cấu hình sẵn

File `app/routes.ts` đã được cấu hình để sử dụng MainLayout:

```typescript
// Public routes - KHÔNG có layout
index("routes/home.tsx"),
route("login", "routes/login.tsx"),
route("register", "routes/register.tsx"),

// Protected routes - Dùng MainLayout
layout("layouts/MainLayout.tsx", [
  route("admin/dashboard", "routes/admin/dashboard.tsx"),
  route("admin/users", "routes/admin/users.tsx"),
  // ... tất cả routes khác
]),
```

### Bước 2: Tạo Page Component

Tất cả page components bên trong layout chỉ cần export default component:

```typescript
// routes/admin/dashboard.tsx
export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      {/* Your page content */}
    </div>
  );
}
```

### Bước 3: Không cần làm gì thêm!

Layout sẽ tự động:
- ✅ Kiểm tra authentication
- ✅ Hiển thị Header với thông tin user
- ✅ Hiển thị Sidebar với menu phù hợp role
- ✅ Hiển thị Breadcrumb
- ✅ Render page content của bạn
- ✅ Hiển thị Footer

## 🎨 Customization

### Thêm Menu Item Mới

Chỉnh sửa file `layouts/Sidebar.tsx`, thêm vào mảng menu items:

```typescript
case 'admin':
  return [
    // ... existing items
    { 
      title: 'Menu Mới', 
      path: '/admin/new-feature', 
      icon: <Icon d="M12 4v16m8-8H4" />,
      badge: 5  // Optional: hiển thị badge
    },
  ];
```

### Thêm Route Mới

Thêm vào file `app/routes.ts`:

```typescript
layout("layouts/MainLayout.tsx", [
  // ... existing routes
  route("admin/new-feature", "routes/admin/new-feature.tsx"),
]),
```

### Customize Header

Chỉnh sửa file `layouts/Header.tsx` để thêm:
- Notifications dropdown
- Search bar
- Quick actions
- Theme switcher

### Customize Sidebar

Chỉnh sửa file `layouts/Sidebar.tsx` để:
- Thay đổi logo và brand name
- Thêm/bớt menu items theo role
- Customize colors và styles
- Thêm collapsible menu groups

## 📱 Responsive Behavior

### Desktop (≥ 1024px)
- Sidebar luôn mở
- Header full width
- Smooth transitions

### Tablet (768px - 1023px)
- Sidebar đóng mặc định
- Click toggle để mở/đóng
- Overlay khi sidebar mở

### Mobile (< 768px)
- Sidebar đóng mặc định
- Full screen overlay
- Touch-friendly buttons
- Compact header

## 🔒 Authentication Guard

MainLayout tự động kiểm tra authentication:

```typescript
// Nếu chưa đăng nhập -> redirect về /login
if (!isAuthenticated) {
  navigate('/login', { replace: true });
}
```

## 🎭 Role-Based Menu

Menu tự động thay đổi theo role của user:

| Role | Menu Items | Description |
|------|------------|-------------|
| **Admin** | 20+ items | Toàn bộ quyền quản trị |
| **Manager** | 5 items | Quản lý đơn hàng, khách hàng |
| **Accountant** | 5 items | Hóa đơn, thanh toán |
| **Mechanic** | 3 items | Sửa chữa, yêu cầu dịch vụ |
| **Employee** | 2 items | Dashboard, công việc |

## 🎯 Best Practices

### 1. Page Structure
```typescript
export default function MyPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Page Title</h1>
        <button className="btn-primary">Action</button>
      </div>

      {/* Page Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Your content */}
      </div>
    </div>
  );
}
```

### 2. Không Import Layout
Layout được tự động áp dụng qua routing, không cần import trong page components.

### 3. Sử dụng AuthContext
```typescript
import { useAuth } from '~/contexts/AuthContext';

export default function MyPage() {
  const { user, hasRole, hasPermission } = useAuth();
  
  if (hasRole('admin')) {
    // Admin only content
  }
}
```

## 🐛 Troubleshooting

### Sidebar không hiển thị?
- Kiểm tra user đã đăng nhập chưa
- Kiểm tra role của user có trong switch case không

### Menu items không đúng?
- Kiểm tra `user?.role?.name` trong Sidebar
- Thêm role mới vào switch case nếu cần

### Breadcrumb không chính xác?
- Thêm path mapping vào `pathNameMap` trong Breadcrumb.tsx

### Animation không mượt?
- Kiểm tra CSS animation đã được import trong app.css
- Đảm bảo Tailwind config có animation classes

## 📚 Files Reference

### Import Layout Components
```typescript
// Cách 1: Import từ index
import { MainLayout, Header, Sidebar } from '~/layouts';

// Cách 2: Import trực tiếp
import { Header } from '~/layouts/Header';
```

### Sử dụng trong Routes
```typescript
// app/routes.ts
layout("layouts/MainLayout.tsx", [
  // Protected routes here
])
```

## 🎉 Kết Luận

Hệ thống layout đã sẵn sàng sử dụng! Chỉ cần:
1. ✅ Tạo page components
2. ✅ Thêm routes vào routes.ts
3. ✅ Thêm menu items vào Sidebar (nếu cần)
4. ✅ Deploy và enjoy! 🚀

---

**Created:** October 7, 2025  
**Version:** 1.0.0  
**Author:** Thắng Trường Development Team

