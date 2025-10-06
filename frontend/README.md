# Frontend - Garage Management System

Hệ thống quản lý garage được xây dựng với **React Router 7**, **TypeScript**, và **Tailwind CSS 4**.

## 🏗️ Kiến trúc dự án

### Cấu trúc thư mục

```
app/
├── components/          # Reusable components
│   ├── ui/             # UI components (Button, Input, Table, etc.)
│   ├── Header.tsx
│   └── ProtectedRoute.tsx
├── contexts/           # React Contexts
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   ├── useAsync.ts
│   ├── useForm.ts
│   ├── useModal.ts
│   └── useTable.ts
├── routes/             # Route components
│   ├── admin/         # Admin routes
│   ├── manager/       # Manager routes
│   ├── accountant/    # Accountant routes
│   ├── mechanic/      # Mechanic routes
│   ├── employee/      # Employee routes
│   └── dashboard/     # General dashboard
├── services/           # API services
│   ├── customer.service.ts
│   ├── product.service.ts
│   ├── service.service.ts
│   ├── order.service.ts
│   └── invoice.service.ts
├── types/              # TypeScript types
│   ├── auth.ts
│   ├── common.ts
│   ├── customer.ts
│   ├── product.ts
│   ├── service.ts
│   ├── order.ts
│   └── invoice.ts
├── utils/              # Utility functions
│   ├── api.ts
│   └── auth.ts
├── root.tsx            # Root component
└── routes.ts           # Routes configuration
```

## 🎯 Tính năng chính

### 1. Authentication & Authorization
- Đăng nhập/Đăng ký
- Quản lý session với localStorage
- Role-based access control (Admin, Manager, Accountant, Mechanic, Employee)
- Protected routes với permission checking

### 2. UI Components Library
- **Button**: Multiple variants (primary, secondary, success, danger, warning, ghost)
- **Input**: With label, error handling, icons
- **Select**: Dropdown với validation
- **Table**: Sortable, paginated data table
- **Modal**: Customizable modal với animations
- **Card**: Content container
- **Badge**: Status indicators
- **Toast**: Notification system
- **Loading**: Spinner và overlay

### 3. Custom Hooks
- **useTable**: Table management với sorting, filtering, pagination
- **useForm**: Form handling với validation
- **useModal**: Modal state management
- **useAsync**: Async operations handling

### 4. API Services
Tất cả API services được tổ chức theo module:
- Customer Service
- Product Service
- Service Management
- Order Service
- Invoice & Payment Service

### 5. Type Safety
- Đầy đủ TypeScript types cho tất cả entities
- API response types
- Common types (Pagination, Sorting, Filtering)

## 🚀 Cài đặt và chạy

### Prerequisites
- Node.js 18+
- npm hoặc yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

### Build

```bash
npm run build
```

### Production

```bash
npm run start
```

## 📝 Cấu hình

### Environment Variables

Tạo file `.env` trong thư mục `frontend`:

```env
VITE_API_URL=http://localhost:8000/api
```

### Route Configuration

File `app/routes.ts` định nghĩa tất cả routes:

```typescript
export default [
  // Public routes
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  
  // Protected routes by role
  route("admin", "routes/admin/layout.tsx", [
    route("dashboard", "routes/admin/dashboard.tsx"),
    route("users", "routes/admin/users.tsx"),
  ]),
  // ...more routes
] satisfies RouteConfig;
```

## 🎨 Styling

Dự án sử dụng **Tailwind CSS 4** với Vite plugin:

- Utility-first CSS framework
- Custom design system
- Responsive design
- Dark mode ready

## 🔐 Authentication Flow

1. User login → API call → Receive token
2. Store token in localStorage
3. Auto-attach token to API requests
4. Verify token on app initialization
5. Redirect based on user role

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl
- Responsive navigation
- Touch-friendly UI

## 🧪 Best Practices

### Component Structure
```typescript
// Named exports for components
export function MyComponent() {
  // Component logic
}

// Default export for route components
export default function MyRoute() {
  // Route logic
}
```

### API Calls
```typescript
// Always use try-catch
try {
  const data = await customerService.getAll();
} catch (error) {
  // Handle error
}
```

### Form Handling
```typescript
const { values, errors, handleSubmit } = useForm({
  initialValues: {},
  onSubmit: async (values) => {
    // Submit logic
  },
  validate: (values) => {
    // Validation logic
  },
});
```

## 🔧 Customization

### Adding New Route

1. Create route component in `app/routes/`
2. Add route to `app/routes.ts`
3. Add to navigation if needed

### Adding New API Service

1. Define types in `app/types/`
2. Create service in `app/services/`
3. Use service in components

### Adding New UI Component

1. Create component in `app/components/ui/`
2. Export from component file
3. Import and use in routes

## 📚 Tech Stack

- **React 19**: UI library
- **React Router 7**: Routing & SSR
- **TypeScript 5**: Type safety
- **Tailwind CSS 4**: Styling
- **Vite 6**: Build tool

## 🤝 Contributing

1. Follow the established folder structure
2. Use TypeScript for type safety
3. Follow React best practices
4. Write reusable components
5. Document complex logic

## 📄 License

Private project for Thắng Trường Garage Management System.
import { useAuth } from '~/contexts/AuthContext';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { Card } from '~/components/ui/Card';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to role-specific dashboard
    if (user?.role?.name) {
      const roleDashboard = `/${user.role.name}/dashboard`;
      navigate(roleDashboard);
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Chào mừng bạn đến với hệ thống quản lý</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Thông tin cá nhân">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Tên</p>
                <p className="font-medium text-gray-900">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vai trò</p>
                <p className="font-medium text-gray-900">{user?.role?.display_name}</p>
              </div>
            </div>
          </Card>

          <Card title="Truy cập nhanh">
            <div className="space-y-2">
              <a href="/profile" className="block px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                <p className="font-medium text-gray-900">Thông tin cá nhân</p>
                <p className="text-sm text-gray-600">Cập nhật thông tin của bạn</p>
              </a>
              <a href="/settings" className="block px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                <p className="font-medium text-gray-900">Cài đặt</p>
                <p className="text-sm text-gray-600">Quản lý tài khoản</p>
              </a>
            </div>
          </Card>

          <Card title="Hỗ trợ">
            <div className="space-y-2">
              <a href="/help" className="block px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                <p className="font-medium text-gray-900">Trung tâm trợ giúp</p>
                <p className="text-sm text-gray-600">Tìm câu trả lời</p>
              </a>
              <a href="/contact" className="block px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                <p className="font-medium text-gray-900">Liên hệ hỗ trợ</p>
                <p className="text-sm text-gray-600">Liên hệ với chúng tôi</p>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

