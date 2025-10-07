# Frontend Component Architecture - Documentation

## 📋 Tổng quan

Đã thống nhất và tối ưu hóa toàn bộ frontend components, loại bỏ code trùng lặp và chuẩn hóa cách sử dụng.

## 🗑️ Các file đã XÓA (Trùng lặp)

1. ❌ `components/ui/Loading.tsx` - ĐÃ XÓA
   - Đã được hợp nhất vào `components/Loading.tsx`

## ✅ Cấu trúc Component sau khi thống nhất

```
components/
├── index.tsx                    ⭐ MAIN EXPORT FILE
├── Loading.tsx                  ⭐ UNIFIED LOADING COMPONENTS
├── PageTransition.tsx           ⭐ UNIFIED PAGE TRANSITION
├── ImagePreloader.tsx
└── ui/
    ├── index.tsx               ⭐ Re-exports from main components
    ├── Button.tsx
    ├── Input.tsx
    ├── Modal.tsx
    └── ...
```

## 🎯 Cách sử dụng ĐÚNG

### 1. Loading Components (THỐNG NHẤT)

```typescript
// ✅ ĐÚNG - Import từ components hoặc components/ui
import { LoadingSpinner, LoadingOverlay, Loading } from '~/components';
// hoặc
import { LoadingSpinner, LoadingOverlay, Loading } from '~/components/ui';

// ❌ SAI - Không import trực tiếp từ file
import { Loading } from '~/components/Loading';
```

**Các component có sẵn:**

```typescript
// Spinner nhỏ cho buttons, inline elements
<LoadingSpinner size="sm" | "md" | "lg" />

// Overlay toàn màn hình với message
<LoadingOverlay message="Đang xử lý..." />

// Full screen loading
<Loading text="Đang tải dữ liệu..." />

// Skeleton loader cho danh sách
<SkeletonLoader />

// Page transition loader (tự động)
<PageTransitionLoader />

// Progress bar loader
<ProgressLoader progress={75} />

// Car animation loader (fun)
<CarAnimationLoader />
```

### 2. Page Transition (THỐNG NHẤT)

```typescript
// ✅ ĐÚNG - Sử dụng hook thống nhất
import { useNavigateWithTransition } from '~/components/PageTransition';
// hoặc
import { useNavigateWithTransition } from '~/components';

function MyComponent() {
  const navigateWithTransition = useNavigateWithTransition();
  
  const handleClick = () => {
    // Chuyển trang với preloader đẹp
    navigateWithTransition('/login', { 
      transitionType: 'preloader', // 'default' | 'progress' | 'car' | 'preloader'
      delay: 100,
      replace: false 
    });
  };
  
  return <button onClick={handleClick}>Đăng Nhập</button>;
}
```

```typescript
// ❌ SAI - KHÔNG dùng window.location.href
window.location.href = '/login'; // BAD!

// ❌ SAI - KHÔNG dùng navigate trực tiếp mà không có transition
const navigate = useNavigate();
navigate('/login'); // KHÔNG có loading animation
```

### 3. Root Setup (ĐÃ CẤU HÌNH)

```typescript
// root.tsx - ĐÃ CẤU HÌNH SẴN
import { PageTransitionProvider } from "~/components/PageTransition";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageTransitionProvider>
          {children}
        </PageTransitionProvider>
      </body>
    </html>
  );
}
```

## 📦 Import Patterns

### ✅ ĐÚNG - Import từ index files

```typescript
// Pattern 1: Import tất cả từ components/index.tsx
import { 
  Loading, 
  LoadingSpinner,
  useNavigateWithTransition,
  Button,
  Input,
  Modal 
} from '~/components';

// Pattern 2: Import UI components từ ui/index.tsx
import { Button, Input, Modal } from '~/components/ui';

// Pattern 3: Import specific group
import { Loading, LoadingSpinner } from '~/components/Loading';
```

### ❌ SAI - Import patterns cũ

```typescript
// ❌ Import từ file đã XÓA
import { Loading } from '~/components/ui/Loading'; // FILE KHÔNG TỒN TẠI

// ❌ Import trực tiếp không qua index
import { Loading } from '~/components/Loading'; // Nên qua index
```

## 🔄 Migration Guide

Nếu code cũ đang lỗi, làm theo các bước sau:

### Bước 1: Tìm và thay thế imports

```bash
# Tìm tất cả import từ ui/Loading
Tìm: from '~/components/ui/Loading'
Thay: from '~/components/ui'
```

### Bước 2: Thay thế window.location.href

```typescript
// CŨ
window.location.href = '/dashboard';

// MỚI
const navigateWithTransition = useNavigateWithTransition();
navigateWithTransition('/dashboard', { transitionType: 'preloader' });
```

### Bước 3: Thay thế useNavigate trực tiếp

```typescript
// CŨ
const navigate = useNavigate();
navigate('/login');

// MỚI
const navigateWithTransition = useNavigateWithTransition();
navigateWithTransition('/login', { transitionType: 'preloader' });
```

## 🎨 Transition Types

```typescript
// 1. Preloader (Recommended) - Gradient đẹp với logo
navigateWithTransition('/page', { transitionType: 'preloader' });

// 2. Default - Simple spinner
navigateWithTransition('/page', { transitionType: 'default' });

// 3. Progress - Progress bar
navigateWithTransition('/page', { transitionType: 'progress' });

// 4. Car - Fun animation
navigateWithTransition('/page', { transitionType: 'car' });
```

## 📝 Best Practices

1. **Luôn import từ index files** - Dễ maintain và refactor
2. **Sử dụng useNavigateWithTransition** - Có animation đẹp
3. **Không dùng window.location.href** - Breaks SPA experience
4. **Chọn đúng Loading component** - Phù hợp với use case

## 🐛 Troubleshooting

### Lỗi: "Cannot find module '~/components/ui/Loading'"
**Giải pháp:** File đã bị xóa. Dùng `from '~/components/ui'` hoặc `from '~/components'`

### Lỗi: "Loading is not exported from..."
**Giải pháp:** Import đúng: `import { Loading } from '~/components/ui'`

### Navigation không có loading animation
**Giải pháp:** Dùng `useNavigateWithTransition` thay vì `useNavigate`

## 📊 Component Usage Summary

| Component | Purpose | Import From |
|-----------|---------|-------------|
| LoadingSpinner | Inline spinner | ~/components |
| LoadingOverlay | Fullscreen overlay | ~/components |
| Loading | Page loading | ~/components |
| SkeletonLoader | List placeholder | ~/components |
| useNavigateWithTransition | Navigate with animation | ~/components |
| Button, Input, Modal | UI Components | ~/components/ui |

## ✨ Ví dụ thực tế

```typescript
// Example: Login form with transition
import { useNavigateWithTransition } from '~/components';
import { LoadingOverlay } from '~/components';
import { Button, Input } from '~/components/ui';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigateWithTransition = useNavigateWithTransition();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await loginAPI();
      // Navigate với preloader đẹp
      navigateWithTransition('/dashboard', { 
        transitionType: 'preloader' 
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {loading && <LoadingOverlay message="Đang đăng nhập..." />}
      <Input type="email" />
      <Input type="password" />
      <Button type="submit">Đăng Nhập</Button>
    </form>
  );
}
```

---

**Cập nhật lần cuối:** October 6, 2025
**Tác giả:** AI Assistant
**Trạng thái:** ✅ Production Ready

