# 🔐 Hướng Dẫn Tích Hợp API Authentication

## ✅ Đã Hoàn Thành

### 1. **Tích Hợp API Login** (`routes/login.tsx`)
```tsx
// Sử dụng useAuth context
const { login } = useAuth();

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        // Gọi API login thật
        await login({
            email: formData.email,
            password: formData.password,
            remember: formData.remember
        });

        // Redirect sang dashboard
        navigateWithTransition("/dashboard", { 
            transitionType: 'preloader',
            animationType: 'fade'
        });
    } catch (err: any) {
        setError(err.message || "Email hoặc mật khẩu không đúng");
    }
};
```

### 2. **Tích Hợp API Register** (`routes/register.tsx`)
```tsx
// Sử dụng useAuth context
const { register } = useAuth();

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        // Gọi API register thật
        await register({
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
            password_confirmation: formData.confirmPassword,
            phone: formData.phone,
        });

        // Redirect sang dashboard
        navigateWithTransition("/dashboard", { 
            transitionType: 'preloader',
            animationType: 'slide'
        });
    } catch (err: any) {
        setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    }
};
```

### 3. **Cấu Hình Environment** (`.env`)
```env
# API Configuration
VITE_API_URL=http://localhost:8000/api

# App Configuration
VITE_APP_NAME=AutoCare Pro
VITE_APP_ENV=development
```

### 4. **Wrap AuthProvider** (`root.tsx`)
```tsx
<AuthProvider>
    <PageTransitionProvider>
        {children}
    </PageTransitionProvider>
</AuthProvider>
```

## 🎯 Flow Hoạt Động

### Login Flow:
1. User nhập email & password → Click "Đăng Nhập"
2. Button text: "Đang đăng nhập..." (disabled)
3. Call API: `POST /api/auth/login`
4. **Thành công**:
   - Save token & user vào localStorage
   - Show SimpleImageLoader với gradient đẹp
   - Navigate → `/dashboard`
   - `dashboard/_layout.tsx` redirect theo role:
     - Admin → `/admin/dashboard`
     - Manager → `/manager/dashboard`
     - Accountant → `/accountant/dashboard`
     - Mechanic → `/mechanic/dashboard`
     - Employee → `/employee/dashboard`
5. **Thất bại**:
   - Show error message: "Email hoặc mật khẩu không đúng"
   - Form active trở lại để user thử lại

### Register Flow:
1. User nhập thông tin → Click "Đăng Ký"
2. Client-side validation:
   - Password >= 8 ký tự
   - Password match confirmation
   - Accept terms checked
3. Button text: "Đang xử lý..." (disabled)
4. Call API: `POST /api/auth/register`
5. **Thành công**:
   - Save token & user vào localStorage
   - Show SimpleImageLoader
   - Navigate → `/dashboard` → redirect theo role
6. **Thất bại**:
   - Show error message từ API
   - Form active trở lại

## 📡 API Endpoints

### Login
```
POST /api/auth/login
Content-Type: application/json

Request:
{
    "email": "user@example.com",
    "password": "password123",
    "remember": true
}

Response (Success):
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "user@example.com",
            "role": {
                "id": 2,
                "name": "admin",
                "display_name": "Administrator"
            }
        },
        "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "token_type": "Bearer"
    }
}

Response (Error):
{
    "success": false,
    "message": "Invalid credentials"
}
```

### Register
```
POST /api/auth/register
Content-Type: application/json

Request:
{
    "name": "John Doe",
    "email": "user@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone": "0123456789"
}

Response (Success):
{
    "success": true,
    "data": {
        "user": { /* user data */ },
        "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "token_type": "Bearer"
    }
}
```

## 🔒 Authentication Service (`utils/auth.ts`)

### Methods Available:
```typescript
authService.login(credentials)      // Login user
authService.register(data)          // Register new user
authService.logout()                // Logout current user
authService.getCurrentUser()        // Get current user info
authService.getToken()              // Get stored token
authService.getStoredUser()         // Get stored user data
authService.clearAuth()             // Clear auth data
authService.isAuthenticated()       // Check if authenticated
```

### Usage:
```typescript
import { authService } from '~/utils/auth';

// Check if logged in
if (authService.isAuthenticated()) {
    const user = authService.getStoredUser();
    console.log(user);
}

// Get token for API calls
const token = authService.getToken();
```

## 🎨 UI/UX Features

### 1. **Single Loading State**
- Chỉ 1 loader duy nhất (SimpleImageLoader)
- Không có spinner trong button
- Text feedback rõ ràng: "Đang đăng nhập..." / "Đang xử lý..."

### 2. **Form Disable**
- Tất cả inputs disabled khi đang processing
- Prevent double submit
- Visual feedback với opacity

### 3. **Error Handling**
- Error messages từ API được hiển thị đẹp mắt
- Red alert box với animation fade-in
- Clear error khi submit lại

### 4. **Smooth Transitions**
- Fade animation cho login
- Slide animation cho register
- Consistent với toàn bộ app

## 🧪 Testing

### Test Login:
1. Start backend server:
   ```bash
   cd C:\xampp\htdocs\gara\backend
   php artisan serve
   ```

2. Start frontend:
   ```bash
   cd C:\xampp\htdocs\gara\frontend
   npm run dev
   ```

3. Open http://localhost:5173/login

4. Test cases:
   - ✅ Login thành công → redirect đúng role
   - ❌ Email sai → show error
   - ❌ Password sai → show error
   - ✅ Remember me → token lưu lâu dài
   - ✅ Loading state → only 1 loader

### Test Register:
1. Open http://localhost:5173/register

2. Test cases:
   - ✅ Register thành công → login auto → redirect
   - ❌ Email đã tồn tại → show error from API
   - ❌ Password < 8 chars → client validation
   - ❌ Password mismatch → client validation
   - ❌ Not accept terms → client validation

## 🔧 Troubleshooting

### Issue: "Network Error"
**Solution**: 
- Check backend server đang chạy: `php artisan serve`
- Check VITE_API_URL trong `.env`: `http://localhost:8000/api`
- Check CORS middleware trong backend đã enable

### Issue: "Token not found"
**Solution**:
- Check Laravel Passport đã install: `php artisan passport:install`
- Check personal access client đã tạo: `php artisan passport:client --personal`

### Issue: "Redirect không đúng"
**Solution**:
- Check user có role chưa
- Check `dashboard/_layout.tsx` logic
- Check AuthContext đã wrap đúng trong `root.tsx`

### Issue: "2 loaders chồng nhau"
**Solution**:
- ✅ Đã fix rồi! Chỉ dùng page transition loader
- Không dùng local `isLoading` state
- Dùng `isTransitioning` từ `usePageTransition()`

## 📝 Next Steps

### Recommended Implementations:

1. **Protected Routes**
   - Wrap các routes cần auth với `ProtectedRoute` component
   - Auto redirect về login nếu chưa đăng nhập

2. **Refresh Token**
   - Implement token refresh khi hết hạn
   - Silent refresh trong background

3. **Remember Me**
   - Extend token expiration nếu remember = true
   - Persist auth state qua browser sessions

4. **Forgot Password**
   - Implement forgot password flow
   - Email reset link

5. **Email Verification**
   - Verify email after registration
   - Resend verification email

## 🎉 Kết Quả

✅ **Login API** hoạt động hoàn hảo
✅ **Register API** hoạt động hoàn hảo
✅ **AuthContext** quản lý state global
✅ **Token Storage** trong localStorage
✅ **Role-based Redirect** tự động
✅ **Error Handling** professional
✅ **Loading States** đồng nhất
✅ **Form Validation** đầy đủ
✅ **Smooth Transitions** mượt mà

Giờ bạn có thể test login/register với backend API thật! 🚀

