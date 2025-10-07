import { Outlet } from 'react-router';
import { useAuth } from '~/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function DashboardLayout() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Redirect based on role
    const role = user?.role?.name;
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'manager') {
      navigate('/manager/dashboard');
    } else if (role === 'accountant') {
      navigate('/accountant/dashboard');
    } else if (role === 'mechanic') {
      navigate('/mechanic/dashboard');
    } else {
      navigate('/employee/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  return <Outlet />;
}

