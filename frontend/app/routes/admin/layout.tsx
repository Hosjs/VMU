import { Outlet } from 'react-router';
import { useAuth } from '~/contexts/AuthContext';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { FullScreenLoader } from '~/components/LoadingSystem';

export default function AdminLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Role Check - chỉ admin mới vào được
  useEffect(() => {
    // Chỉ check khi đã load xong và có user
    if (!isLoading && isAuthenticated && user) {
      if (user.role?.name !== 'admin') {
        console.log('Not admin, redirecting...', user.role?.name);
        // Nếu không phải admin, redirect về dashboard phù hợp với role
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  // Show loading while checking auth và role
  if (isLoading) {
    return <FullScreenLoader text="Đang kiểm tra quyền truy cập..." />;
  }

  // Nếu chưa authenticated, DashboardLayout sẽ xử lý redirect
  // Nếu đã authenticated nhưng chưa có user data, show loading
  if (!user) {
    return <FullScreenLoader text="Đang tải thông tin người dùng..." />;
  }

  // Nếu không phải admin, hiển thị loading trong khi redirect
  if (user.role?.name !== 'admin') {
    return <FullScreenLoader text="Đang chuyển hướng..." />;
  }

  // OK - là admin, render layout
  return <Outlet />;
}
