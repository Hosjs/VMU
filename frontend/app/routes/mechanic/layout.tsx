import { Outlet } from 'react-router';
import { useAuth } from '~/contexts/AuthContext';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { FullScreenLoader } from '~/components/LoadingSystem';

export default function MechanicLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role?.name !== 'mechanic') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  if (isLoading || user?.role?.name !== 'mechanic') {
    return <FullScreenLoader text="Đang kiểm tra quyền truy cập..." />;
  }

  return <Outlet />;
}
