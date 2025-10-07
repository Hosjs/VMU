# 🎬 Hướng Dẫn Hệ Thống Page Transitions - React Router 7

## 📋 Tổng Quan

Hệ thống page transitions đã được thiết kế đồng bộ và chuyên nghiệp cho toàn bộ ứng dụng, tích hợp hoàn hảo với React Router 7.

## ✨ Các Tính Năng Chính

### 1. **6 Loại Animation Chuyển Trang**

#### a) **Default Animation** (Mặc định)
```css
/* Fade + Scale + Translate Y */
- Opacity: 0 → 1
- Transform: translateY(20px) scale(0.98) → translateY(0) scale(1)
- Duration: 0.4s
- Timing: cubic-bezier(0.4, 0, 0.2, 1)
```

#### b) **Fade Animation**
```css
/* Simple fade in/out */
- Opacity: 0 → 1
- Duration: 0.3s
- Best for: Quick transitions, minimal distraction
```

#### c) **Slide Animation**
```css
/* Horizontal slide */
- Opacity: 0 → 1
- Transform: translateX(30px) → translateX(0)
- Duration: 0.4s
- Best for: Dashboard navigation, form wizards
```

#### d) **Scale Animation**
```css
/* Zoom effect */
- Opacity: 0 → 1
- Transform: scale(0.9) → scale(1)
- Duration: 0.35s
- Timing: cubic-bezier(0.34, 1.56, 0.64, 1) (bounce effect)
- Best for: Modal-like pages, detail views
```

#### e) **Rotate Animation**
```css
/* Creative rotation */
- Opacity: 0 → 1
- Transform: rotate(-5deg) scale(0.9) → rotate(0deg) scale(1)
- Duration: 0.5s
- Best for: Product showcases, special pages
```

#### f) **Blur Animation**
```css
/* Depth effect */
- Opacity: 0 → 1
- Filter: blur(10px) → blur(0)
- Transform: scale(1.05) → scale(1)
- Duration: 0.4s
- Best for: Image galleries, portfolio pages
```

### 2. **4 Loại Loading Screen**

#### a) **PageTransitionLoader** (Mặc định)
- Logo với vòng xoay xung quanh
- Background trắng tinh tế
- Text: "Đang chuyển trang..."
- Loading dots animation
- **Use case**: Navigation giữa các routes thông thường

#### b) **ProgressLoader**
- Logo với animation pulse
- Progress bar với percentage
- Gradient background (blue to indigo)
- **Use case**: Data loading, file uploads, heavy operations

#### c) **CarAnimationLoader**
- Animated car moving across screen
- Road with pulse effect
- Creative và eye-catching
- **Use case**: Automotive-related pages, fun transitions

#### d) **SimpleImageLoader**
- Logo với spinning ring
- Gradient background (blue, indigo, purple)
- Minimal và elegant
- **Use case**: Initial app loading, image preloading

## 🚀 Cách Sử Dụng

### 1. **Automatic Transitions** (Đã tích hợp sẵn)

Page transitions tự động hoạt động khi bạn navigate giữa các routes:

```tsx
import { Link } from 'react-router';

// Transition tự động kích hoạt khi click
<Link to="/dashboard">Dashboard</Link>
```

### 2. **Programmatic Navigation với Transitions**

```tsx
import { useNavigateWithTransition } from '~/components/PageTransition';

function MyComponent() {
  const navigateWithTransition = useNavigateWithTransition();

  const handleClick = () => {
    // Sử dụng animation mặc định
    navigateWithTransition('/dashboard');

    // Sử dụng animation cụ thể
    navigateWithTransition('/profile', {
      transitionType: 'progress',
      animationType: 'slide',
      delay: 100,
    });

    // Replace history
    navigateWithTransition('/home', {
      replace: true,
      animationType: 'fade',
    });
  };

  return <button onClick={handleClick}>Go to Dashboard</button>;
}
```

### 3. **Set Animation Type cho Route Cụ Thể**

```tsx
import { useRouteAnimation } from '~/components/PageTransition';

function ProductDetailPage() {
  // Tự động áp dụng blur animation cho route này
  useRouteAnimation('/products/:id', 'blur');

  return <div>Product Details</div>;
}
```

### 4. **Manual Control Transitions**

```tsx
import { usePageTransition } from '~/components/PageTransition';

function CustomComponent() {
  const { 
    setTransitionType, 
    setAnimationType,
    isTransitioning 
  } = usePageTransition();

  // Thay đổi loader type
  setTransitionType('car'); // 'default' | 'progress' | 'car' | 'preloader'

  // Thay đổi animation type
  setAnimationType('scale'); // 'fade' | 'slide' | 'scale' | 'rotate' | 'blur' | 'default'

  return <div>{isTransitioning ? 'Loading...' : 'Content'}</div>;
}
```

## 📁 Cấu Trúc Files

```
frontend/app/
├── app.css                          # Page transition CSS animations
├── root.tsx                         # PageTransitionProvider wrapper
├── components/
│   ├── PageTransition.tsx          # Core transition logic & context
│   ├── Loading.tsx                 # All loader components
│   └── ImagePreloader.tsx          # Image preloading loaders
```

## 🎨 CSS Classes Reference

### Animation Classes
```css
.page-enter              /* Default enter animation */
.page-exit               /* Default exit animation */
.page-fade-enter         /* Fade in */
.page-fade-exit          /* Fade out */
.page-slide-enter        /* Slide in from right */
.page-slide-exit         /* Slide out to left */
.page-scale-enter        /* Scale up */
.page-scale-exit         /* Scale down */
.page-rotate-enter       /* Rotate in */
.page-blur-enter         /* Blur in */
```

### Loader Classes
```css
.loader-fade-enter       /* Loader fade in */
.loader-fade-exit        /* Loader fade out */
```

## 🎯 Best Practices

### 1. **Chọn Animation Phù Hợp**

| Page Type | Recommended Animation | Loader Type |
|-----------|----------------------|-------------|
| Dashboard | `slide` | `default` |
| Detail Page | `scale` | `default` |
| Form Page | `fade` | `default` |
| Gallery | `blur` | `preloader` |
| Upload | - | `progress` |
| Fun Pages | `rotate` | `car` |

### 2. **Performance Tips**

```tsx
// ✅ Good: Simple transitions cho frequent navigation
navigateWithTransition('/list', { animationType: 'fade' });

// ❌ Bad: Complex animations cho rapid navigation
navigateWithTransition('/item1', { animationType: 'rotate' });
navigateWithTransition('/item2', { animationType: 'blur' });
```

### 3. **Accessibility**

```tsx
// Respect user preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  setAnimationType('fade'); // Use simple fade for accessibility
}
```

## 🔧 Customization

### Thay Đổi Duration

Chỉnh sửa trong `app.css`:

```css
#page-content {
    animation-duration: 0.6s; /* Change from 0.4s */
}
```

### Thêm Animation Mới

1. Thêm keyframes trong `app.css`:
```css
@keyframes myCustomAnimation {
    from { opacity: 0; transform: translateZ(100px); }
    to { opacity: 1; transform: translateZ(0); }
}

.page-custom-enter {
    animation: myCustomAnimation 0.5s ease-out;
}
```

2. Update types trong `PageTransition.tsx`:
```tsx
type AnimationType = 'fade' | 'slide' | 'scale' | 'rotate' | 'blur' | 'custom' | 'default';
```

3. Add case trong switch:
```tsx
case 'custom':
    pageContent.classList.add('page-custom-enter');
    break;
```

## 🐛 Troubleshooting

### Animation không hoạt động?

1. **Check wrapper**: Đảm bảo `PageTransitionProvider` wrap toàn bộ app trong `root.tsx`
2. **Check z-index**: Loading screens cần `z-50` hoặc cao hơn
3. **Check CSS import**: `app.css` phải được import trong `root.tsx`

### Loading screen bị flicker?

```tsx
// Tăng delay để transitions mượt hơn
navigateWithTransition('/page', { delay: 150 });
```

### Performance issues?

```tsx
// Sử dụng fade animation cho pages phức tạp
setAnimationType('fade');

// Hoặc disable transitions hoàn toàn
setTransitionType('default');
```

## 📊 Animation Performance

| Animation | Performance | Use Case |
|-----------|-------------|----------|
| Fade | ⭐⭐⭐⭐⭐ | Best for frequent use |
| Slide | ⭐⭐⭐⭐ | Good for navigation |
| Scale | ⭐⭐⭐⭐ | Good for detail views |
| Rotate | ⭐⭐⭐ | Use sparingly |
| Blur | ⭐⭐ | Use for special pages |

## 🎉 Kết Luận

Hệ thống page transitions đã được thiết kế để:
- ✅ **Đồng bộ** toàn bộ app
- ✅ **Dễ sử dụng** với API đơn giản
- ✅ **Linh hoạt** với 6 animation types
- ✅ **Tối ưu** performance
- ✅ **Chuyên nghiệp** cho production

Enjoy smooth transitions! 🚀

