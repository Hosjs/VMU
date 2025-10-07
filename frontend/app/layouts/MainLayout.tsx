import { Outlet, useNavigate } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { Loading } from '~/components/Loading';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumb } from './Breadcrumb';

/**
 * MainLayout - Layout chung cho TOÀN BỘ dự án
 *
 * Features:
 * - Header: Hiển thị thông tin user, notifications, logout
 * - Sidebar: Menu động theo role của user (admin, manager, accountant, mechanic, employee)
 * - Breadcrumb: Hiển thị vị trí hiện tại
 * - Content Area: Chỉ phần này thay đổi khi navigate (Outlet)
 * - Footer: Thông tin copyright
 * - Responsive: Tự động đóng sidebar trên mobile
 * - Authentication Guard: Redirect về login nếu chưa đăng nhập
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
    return <Loading text="Đang kiểm tra quyền truy cập..." />;
  }

  // Nếu chưa authenticated, sẽ redirect trong useEffect
  if (!isAuthenticated || !user) {
    return <Loading text="Đang tải thông tin người dùng..." />;
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
      {/* Sidebar - KHÔNG reload khi navigate, menu tự động thay đổi theo role */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        user={user}
      />

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Header - KHÔNG reload khi navigate */}
        <Header
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
          user={user}
        />

        {/* Breadcrumb - Hiển thị vị trí hiện tại */}
        <Breadcrumb />

        {/* Page Content - CHỈ PHẦN NÀY thay đổi khi navigate */}
        <main className="p-4 md:p-6 min-h-[calc(100vh-12rem)]">
          {/* Animation wrapper cho smooth transitions */}
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-600">
            <p>© {new Date().getFullYear()} Thắng Trường Auto. All rights reserved.</p>
            <div className="flex gap-4">
              <button onClick={(e) => e.preventDefault()} className="hover:text-blue-600 transition-colors">Điều khoản</button>
              <button onClick={(e) => e.preventDefault()} className="hover:text-blue-600 transition-colors">Bảo mật</button>
              <button onClick={(e) => e.preventDefault()} className="hover:text-blue-600 transition-colors">Hỗ trợ</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
