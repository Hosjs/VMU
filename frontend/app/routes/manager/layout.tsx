import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { Loading } from '~/components/Loading';
import { DashboardLayout } from '~/components/layout';

export default function ManagerLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Role Check - chỉ manager mới vào được
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role?.name !== 'manager') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  if (isLoading || user?.role?.name !== 'manager') {
    return <Loading text="Đang kiểm tra quyền truy cập..." />;
  }

  return <DashboardLayout />;
}
