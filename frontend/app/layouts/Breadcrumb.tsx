import { Link, useLocation } from 'react-router';
import { useMemo } from 'react';

export function Breadcrumb() {
  const location = useLocation();

  // Mapping path to readable names
  const pathNameMap: Record<string, string> = {
    // Admin routes
    'admin': 'Quản trị',
    'dashboard': 'Tổng quan',
    'users': 'Người dùng',
    'customers': 'Khách hàng',
    'products': 'Sản phẩm',
    'services': 'Dịch vụ',
    'orders': 'Đơn hàng',
    'invoices': 'Hóa đơn',
    'payments': 'Thanh toán',
    'warehouses': 'Kho hàng',
    'providers': 'Nhà cung cấp',
    'vehicles': 'Phương tiện',
    'vehicle-handovers': 'Bàn giao xe',
    'stocks': 'Tồn kho',
    'stock-transfers': 'Chuyển kho',
    'settlements': 'Quyết toán',
    'service-requests': 'Yêu cầu dịch vụ',
    'reports': 'Báo cáo',
    'roles': 'Vai trò',
    'settings': 'Cài đặt',

    // Manager routes
    'manager': 'Quản lý',
    'inventory': 'Tồn kho',

    // Accountant routes
    'accountant': 'Kế toán',

    // Mechanic routes
    'mechanic': 'Thợ sửa chữa',
    'work-orders': 'Lệnh sửa chữa',

    // Employee routes
    'employee': 'Nhân viên',
    'tasks': 'Công việc',

    // Common
    'profile': 'Thông tin cá nhân',
  };

  // Generate breadcrumb items từ pathname
  const breadcrumbItems = useMemo(() => {
    const paths = location.pathname.split('/').filter(Boolean);

    if (paths.length === 0) {
      return [{ name: 'Trang chủ', path: '/' }];
    }

    const items = paths.map((path, index) => {
      const fullPath = '/' + paths.slice(0, index + 1).join('/');
      const name = pathNameMap[path] || path.charAt(0).toUpperCase() + path.slice(1);

      return {
        name,
        path: fullPath,
      };
    });

    return items;
  }, [location.pathname]);

  // Không hiển thị breadcrumb nếu chỉ có 1 item hoặc đang ở trang chủ
  if (breadcrumbItems.length <= 1 && location.pathname === '/') {
    return null;
  }

  // Handler để log navigation
  const handleBreadcrumbClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    console.log('🔍 Breadcrumb clicked:', path);
    // React Router Link sẽ tự xử lý, không cần preventDefault
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3">
      <nav className="flex items-center space-x-2 text-sm">
        {/* Home icon */}
        <Link
          to="/"
          onClick={(e) => handleBreadcrumbClick(e, '/')}
          className="text-gray-500 hover:text-blue-600 transition-colors"
          aria-label="Trang chủ"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>

        {/* Breadcrumb items */}
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <div key={item.path} className="flex items-center space-x-2">
              {/* Separator */}
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>

              {/* Link hoặc text nếu là item cuối */}
              {isLast ? (
                <span className="font-semibold text-blue-600">{item.name}</span>
              ) : (
                <Link
                  to={item.path}
                  onClick={(e) => handleBreadcrumbClick(e, item.path)}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
