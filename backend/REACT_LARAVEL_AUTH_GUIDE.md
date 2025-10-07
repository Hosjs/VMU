# 🔐 HỆ THỐNG AUTHENTICATION - REACT + LARAVEL API (JWT PASSPORT)

## 📋 TỔNG QUAN

Hệ thống authentication sử dụng **JWT Token với Laravel Passport** cho React frontend.

**Architecture:**
- **Frontend**: React (localStorage/sessionStorage lưu token)
- **Backend**: Laravel API với Passport OAuth2
- **Authentication**: JWT Token (Bearer authentication)
- **CORS**: Configured cho frontend

---

## ✅ ĐÃ CẤU HÌNH

### Backend API:
- ✅ Laravel Passport (OAuth2 + JWT)
- ✅ 6 API endpoints authentication
- ✅ CORS middleware
- ✅ Role-based permissions (5 roles)
- ✅ Token expiration: 15 days (access), 30 days (refresh)

### Database:
- ✅ Users table
- ✅ OAuth tables (6 tables)
- ✅ Roles & user_roles tables
- ✅ 4 users mặc định đã seed

---

## 🚀 API ENDPOINTS

### Public Endpoints (Không cần authentication):

```bash
# 1. Đăng ký
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "0901234567",
  "address": "123 ABC Street",
  "gender": "male"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer"
  }
}
```

```bash
# 2. Đăng nhập
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@garage.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Administrator",
      "email": "admin@garage.com",
      "role": {
        "name": "admin",
        "display_name": "Quản trị viên"
      }
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer"
  }
}
```

### Protected Endpoints (Cần JWT token):

```bash
# 3. Lấy thông tin user
GET /api/auth/me
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

```bash
# 4. Đăng xuất
POST /api/auth/logout
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Logout successful"
}
```

```bash
# 5. Refresh token
POST /api/auth/refresh
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer"
  }
}
```

```bash
# 6. Đổi mật khẩu
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "current_password": "password123",
  "new_password": "newpassword456",
  "new_password_confirmation": "newpassword456"
}

Response:
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 💻 REACT INTEGRATION

### 1. Tạo Auth Service

```typescript
// src/services/authService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  // Configure axios with token
  private getAuthHeaders() {
    return {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  // Đăng ký
  async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    address?: string;
    gender?: string;
  }) {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    if (response.data.success) {
      this.setToken(response.data.data.token);
      this.setUser(response.data.data.user);
    }
    return response.data;
  }

  // Đăng nhập
  async login(email: string, password: string) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    
    if (response.data.success) {
      this.setToken(response.data.data.token);
      this.setUser(response.data.data.user);
    }
    return response.data;
  }

  // Đăng xuất
  async logout() {
    if (this.token) {
      try {
        await axios.post(`${API_URL}/auth/logout`, {}, this.getAuthHeaders());
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    this.clearAuth();
  }

  // Lấy thông tin user hiện tại
  async getCurrentUser() {
    const response = await axios.get(`${API_URL}/auth/me`, this.getAuthHeaders());
    return response.data;
  }

  // Refresh token
  async refreshToken() {
    const response = await axios.post(`${API_URL}/auth/refresh`, {}, this.getAuthHeaders());
    if (response.data.success) {
      this.setToken(response.data.data.token);
    }
    return response.data;
  }

  // Đổi mật khẩu
  async changePassword(currentPassword: string, newPassword: string, newPasswordConfirmation: string) {
    const response = await axios.post(
      `${API_URL}/auth/change-password`,
      {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation
      },
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Helper methods
  private setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  private setUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  private clearAuth() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken() {
    return this.token;
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!this.token;
  }
}

export default new AuthService();
```

### 2. Tạo Axios Interceptor

```typescript
// src/services/axiosConfig.ts
import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - thêm token vào mọi request
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu token hết hạn (401) và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Thử refresh token
        await authService.refreshToken();
        
        // Retry request với token mới
        const token = authService.getToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh thất bại, logout
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 3. Tạo Auth Context

```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

interface User {
  id: number;
  name: string;
  email: string;
  role: {
    name: string;
    display_name: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (authService.isAuthenticated()) {
      try {
        const result = await authService.getCurrentUser();
        setUser(result.data.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.logout();
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setUser(result.data.user);
    }
    return result;
  };

  const register = async (data: any) => {
    const result = await authService.register(data);
    if (result.success) {
      setUser(result.data.user);
    }
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 4. Protected Route Component

```typescript
// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role.name !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### 5. Login Component Example

```typescript
// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Đăng nhập</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
};
```

### 6. App Setup

```typescript
// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## 📧 TÀI KHOẢN TEST

```
Email: admin@garage.com      | Password: password123 | Role: Admin
Email: manager@garage.com    | Password: password123 | Role: Manager
Email: accountant@garage.com | Password: password123 | Role: Accountant
Email: mechanic@garage.com   | Password: password123 | Role: Mechanic
```

---

## 🔒 SECURITY

- ✅ JWT Token với RSA encryption
- ✅ Token expiration: 15 days
- ✅ Refresh token: 30 days
- ✅ Token revocation on logout
- ✅ CORS protection
- ✅ Password hashing (bcrypt)
- ✅ API rate limiting (optional)

---

## 🚀 CÁCH SỬ DỤNG

### Backend (Laravel):
```bash
cd backend
php artisan serve
```

### Frontend (React):
```bash
cd frontend
npm install axios
npm run dev
```

---

## ✅ HOÀN THÀNH

Hệ thống authentication **React + Laravel API** với JWT Passport đã sẵn sàng! 🎉

**Các bước tiếp theo:**
1. Copy code AuthService vào React project
2. Cài đặt axios: `npm install axios`
3. Cấu hình API_URL trong authService
4. Sử dụng AuthContext trong components
5. Protect routes với ProtectedRoute component

