import { Link, useLocation } from 'react-router';
import { useState, useMemo, useCallback } from 'react';
import type { AuthUser } from '~/types/auth';
import { useBadgeCounts } from '~/hooks/useBadgeCounts';
import { useAuth } from '~/contexts/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  ShoppingCartIcon,
  CubeIcon,
  UserCircleIcon,
  TruckIcon,
  ArrowsRightLeftIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CreditCardIcon,
  BuildingStorefrontIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeKey?: 'orders' | 'invoices' | 'service_requests' | 'work_orders' | 'notifications';
  requiredPermissions?: string[];  // Permissions cần có để hiện menu
  requireAll?: boolean;  // true = phải có tất cả permissions, false = có 1 trong số đó
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
}

/**
 * Sidebar Component - PERMISSION BASED
 *
 * Features:
 * - Menu động theo PERMISSIONS của user (không phải role)
 * - Tự động ẩn/hiện menu dựa trên quyền
 * - Active state cho menu item hiện tại
 * - Responsive: Fixed overlay trên mobile
 * - Badge cho notifications
 */
export function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const location = useLocation();
  const { hasAnyPermission } = useAuth();

  // Sử dụng hook để lấy badge counts động
  const { counts } = useBadgeCounts({
    refreshInterval: 30000,
    autoFetch: true,
  });

  /**
   * ALL MENU ITEMS - Permission-based
   * Mỗi menu item có requiredPermissions
   */
  const allMenuItems: MenuItem[] = useMemo(() => [
    // Dashboard
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <HomeIcon className="w-5 h-5" />,
      requiredPermissions: ['dashboard.view'],
    },

    // MANAGEMENT MODULE
    {
      title: 'Người dùng',
      path: '/management/users',
      icon: <UsersIcon className="w-5 h-5" />,
      requiredPermissions: ['users.view'],
    },
    {
      title: 'Vai trò & Quyền',
      path: '/management/roles',
      icon: <ShieldCheckIcon className="w-5 h-5" />,
      requiredPermissions: ['roles.view'],
    },

    // CUSTOMER MODULE
    {
      title: 'Khách hàng',
      path: '/customers/list',
      icon: <UserGroupIcon className="w-5 h-5" />,
      requiredPermissions: ['customers.view'],
    },
    {
      title: 'Phương tiện',
      path: '/customers/vehicles',
      icon: <TruckIcon className="w-5 h-5" />,
      requiredPermissions: ['vehicles.view'],
    },

    // SALES MODULE
    {
      title: 'Đơn hàng',
      path: '/sales/orders',
      icon: <ShoppingCartIcon className="w-5 h-5" />,
      badgeKey: 'orders',
      requiredPermissions: ['orders.view'],
    },
    {
      title: 'Yêu cầu dịch vụ',
      path: '/sales/service-requests',
      icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
      badgeKey: 'service_requests',
      requiredPermissions: ['services.view'],
    },

    // FINANCIAL MODULE
    {
      title: 'Hóa đơn',
      path: '/financial/invoices',
      icon: <DocumentTextIcon className="w-5 h-5" />,
      badgeKey: 'invoices',
      requiredPermissions: ['invoices.view'],
    },
    {
      title: 'Thanh toán',
      path: '/financial/payments',
      icon: <CreditCardIcon className="w-5 h-5" />,
      requiredPermissions: ['payments.view'],
    },
    {
      title: 'Quyết toán',
      path: '/financial/settlements',
      icon: <CurrencyDollarIcon className="w-5 h-5" />,
      requiredPermissions: ['settlements.view'],
    },

    // INVENTORY MODULE
    {
      title: 'Sản phẩm',
      path: '/inventory/products',
      icon: <CubeIcon className="w-5 h-5" />,
      requiredPermissions: ['products.view'],
    },
    {
      title: 'Kho hàng',
      path: '/inventory/warehouses',
      icon: <BuildingStorefrontIcon className="w-5 h-5" />,
      requiredPermissions: ['warehouses.view'],
    },
    {
      title: 'Tồn kho',
      path: '/inventory/stocks',
      icon: <CubeIcon className="w-5 h-5" />,
      requiredPermissions: ['stocks.view'],
    },

    // PARTNERS MODULE
    {
      title: 'Nhà cung cấp',
      path: '/partners/providers',
      icon: <UserCircleIcon className="w-5 h-5" />,
      requiredPermissions: ['providers.view'],
    },

    // REPORTS MODULE
    {
      title: 'Báo cáo',
      path: '/reports/dashboard',
      icon: <ChartBarIcon className="w-5 h-5" />,
      requiredPermissions: ['reports.view'],
    },

    // SETTINGS (Admin only hoặc có quyền settings)
    {
      title: 'Cài đặt',
      path: '/admin/settings',
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      requiredPermissions: ['settings.view'],
    },

    // LEGACY ROUTES - Để backward compatibility
    {
      title: 'Dịch vụ',
      path: '/admin/services',
      icon: <WrenchScrewdriverIcon className="w-5 h-5" />,
      requiredPermissions: ['services.view'],
    },
  ], []);

  /**
   * Filter menu items dựa trên permissions
   * Chỉ hiện menu mà user có quyền
   */
  const visibleMenuItems = useMemo(() => {
    return allMenuItems.filter(item => {
      // Nếu không có requiredPermissions, luôn hiện (fallback)
      if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
        return true;
      }

      // Kiểm tra permissions
      if (item.requireAll) {
        // Phải có tất cả permissions
        return item.requiredPermissions.every(perm => hasAnyPermission([perm]));
      } else {
        // Có ít nhất 1 permission
        return hasAnyPermission(item.requiredPermissions);
      }
    });
  }, [allMenuItems, hasAnyPermission]);

  // Handler cho click vào menu item
  const handleMenuClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    onClose();
  }, [onClose]);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          bg-gradient-to-b from-gray-900 to-gray-800 text-white w-64 shadow-2xl
        `}
      >
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-700/50">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg">
            TT
          </div>
          <div>
            <h1 className="font-bold text-lg">Thắng Trường</h1>
            <p className="text-xs text-gray-400">
              {user?.role?.display_name || 'System'}
            </p>
          </div>
        </div>

        {/* User Info Card */}
        <div className="px-4 py-4 mx-2 mt-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-base shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-sm">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu - TỰ ĐỘNG lọc theo permissions */}
        <nav className="px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {visibleMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const badgeCount = item.badgeKey ? counts[item.badgeKey] : 0;
            const shouldShowBadge = badgeCount > 0;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleMenuClick}
                className={`
                  flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50 scale-[1.02]' 
                    : 'text-gray-300 hover:bg-gray-800/70 hover:text-white hover:scale-[1.01]'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="font-medium text-sm">{item.title}</span>
                </div>
                {shouldShowBadge && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Version Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700/50 bg-gray-900/50">
          <div className="text-center">
            <p className="text-xs text-gray-500">Version 1.0.0</p>
            <p className="text-xs text-gray-600 mt-1">© 2024 Thắng Trường</p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
