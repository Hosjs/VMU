import { Outlet } from 'react-router';
import { useAuth } from '~/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigateWithTransition, FullScreenLoader } from '~/components/LoadingSystem';

export default function DashboardLayout() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigateWithTransition = useNavigateWithTransition();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Chờ auth loading xong
    if (authLoading) {
      return;
    }

    // Nếu đã redirect rồi thì không làm gì nữa
    if (hasRedirected) {
      return;
    }

    // Nếu chưa login → redirect về login
    if (!isAuthenticated) {
      setHasRedirected(true);
      navigateWithTransition('/login', {
        transitionType: 'preloader',
        animationType: 'fade',
        replace: true
      });
      return;
    }

    // Nếu đã login → redirect theo role
    const role = user?.role?.name;

    // Redirect dựa theo role
    setHasRedirected(true);

    if (role === 'admin') {
      navigateWithTransition('/admin/dashboard', {
        transitionType: 'preloader',
        animationType: 'slide',
        replace: true
      });
    } else if (role === 'manager') {
      navigateWithTransition('/manager/dashboard', {
        transitionType: 'preloader',
        animationType: 'slide',
        replace: true
      });
    } else if (role === 'accountant') {
      navigateWithTransition('/accountant/dashboard', {
        transitionType: 'preloader',
        animationType: 'slide',
        replace: true
      });
    } else if (role === 'mechanic') {
      navigateWithTransition('/mechanic/dashboard', {
        transitionType: 'preloader',
        animationType: 'slide',
        replace: true
      });
    } else {
      // Nếu không có role hoặc role không khớp → mặc định employee
      navigateWithTransition('/employee/dashboard', {
        transitionType: 'preloader',
        animationType: 'slide',
        replace: true
      });
    }
  }, [isAuthenticated, user, navigateWithTransition, authLoading, hasRedirected]);

  // Show loading khi đang check auth hoặc đang redirect
  if (authLoading || !hasRedirected) {
    return <FullScreenLoader text="Đang kiểm tra quyền truy cập..." />;
  }

  return <Outlet />;
}
