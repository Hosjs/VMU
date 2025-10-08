import { Outlet, useNavigate } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { FullScreenLoader, ContentLoader } from '~/components/LoadingSystem';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumb } from './Breadcrumb';

/**
 * MainLayout - Layout chung cho TOÀN BỘ dự án
 *
 * Features:
 * - Header: Hiển thị thông tin user, notifications, logout (KHÔNG RELOAD)
 * - Sidebar: Menu động theo role của user (KHÔNG RELOAD)
 * - Breadcrumb: Hiển thị vị trí hiện tại
 * - Content Area: Có loading indicator khi chuyển trang (KHÔNG che sidebar)
 * - Footer: Thông tin copyright
 * - Responsive: Tự động đóng sidebar trên mobile
 * - Authentication Guard: Redirect về login nếu chưa đăng nhập
 *
 * Loading Strategy:
 * - Auth check: FullScreenLoader
 * - Navigation: ContentLoader (CHỈ trong content area)
 */
export default function MainLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const hasCheckedAuth = useRef(false);

  // Responsive: Tự động đóng sidebar trên mobile, mở trên desktop
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

  // Authentication Guard - Redirect về login nếu chưa đăng nhập
  // Chỉ chạy 1 lần để tránh loop
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasCheckedAuth.current) {
      console.log('🔒 Not authenticated, redirecting to login...');
      hasCheckedAuth.current = true;
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Hiển thị loading trong khi kiểm tra authentication
  if (isLoading) {
    return <FullScreenLoader text="Đang kiểm tra quyền truy cập..." />;
  }

  // Nếu chưa authenticated, sẽ redirect trong useEffect
  if (!isAuthenticated || !user) {
    return <FullScreenLoader text="Đang tải thông tin người dùng..." />;
  }

  // Toggle sidebar
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Đóng sidebar (dùng cho mobile khi click vào menu item)
  const handleCloseSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - KHÔNG reload */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        user={user}
      />

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Header - KHÔNG reload */}
        <Header
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
          user={user}
        />

        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Page Content với ContentLoader */}
        <main className="p-4 md:p-6 min-h-[calc(100vh-12rem)] relative">
          {/* ContentLoader - CHỈ trong content area */}
          <ContentLoader />

          {/* Content với fade animation */}
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <p className="text-center text-sm text-gray-600">
            © 2024 AutoCare Pro. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
