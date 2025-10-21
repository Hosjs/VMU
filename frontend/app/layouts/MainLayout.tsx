import { Outlet, useNavigate } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { FullScreenLoader, ContentLoader } from '~/components/LoadingSystem';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumb } from './Breadcrumb';

export default function MainLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasCheckedAuth.current) {
      console.log('🔒 Not authenticated, redirecting to login...');
      hasCheckedAuth.current = true;
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <FullScreenLoader text="Đang kiểm tra quyền truy cập..." />;
  }

  if (!isAuthenticated || !user) {
    return <FullScreenLoader text="Đang tải thông tin người dùng..." />;
  }

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        user={user}
      />

      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <Header
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
          user={user}
        />

        <Breadcrumb />

        <main className="p-4 md:p-6 min-h-[calc(100vh-12rem)] relative">
          <ContentLoader />

          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <p className="text-center text-sm text-gray-600">
            © 2025 Viet Nam Marinetime University. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
