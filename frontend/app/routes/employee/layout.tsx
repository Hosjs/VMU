import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { Loading } from '~/components/Loading';
import { DashboardLayout } from '~/components/layout';

export default function EmployeeLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Role Check - chỉ employee mới vào được
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role?.name !== 'employee') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  if (isLoading || user?.role?.name !== 'employee') {
    return <Loading text="Đang kiểm tra quyền truy cập..." />;
  }

  return <DashboardLayout />;
}
