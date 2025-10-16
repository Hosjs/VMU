/**
 * ============================================
 * DASHBOARD INDEX - ROLE-BASED + PERMISSION-BASED
 * ============================================
 * Dashboard tổng hợp hiển thị theo role và permissions của user
 *
 * Features:
 * - Tự động hiển thị dashboard phù hợp với role
 * - Kiểm tra permissions để hiển thị các widgets
 * - Responsive design
 * - Real-time data
 */

import { useAuth } from '~/contexts/AuthContext';
import { usePermissions } from '~/hooks/usePermissions';
import { useBadgeCounts } from '~/hooks/useBadgeCounts';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  BellAlertIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  link?: string;
  permission?: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { hasRole, hasPermission } = usePermissions();
  const { counts } = useBadgeCounts();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  // Define stats based on role and permissions
  const getStats = (): DashboardStats[] => {
    const stats: DashboardStats[] = [];

    // Admin & Manager - Full overview
    if (hasRole('admin') || hasRole('manager')) {
      stats.push(
        {
          title: 'Đơn hàng mới',
          value: counts?.orders || 0,
          icon: ShoppingCartIcon,
          color: 'bg-blue-500',
          link: '/sales/orders',
          permission: 'orders.view'
        },
        {
          title: 'Hóa đơn chờ',
          value: counts?.invoices || 0,
          icon: CurrencyDollarIcon,
          color: 'bg-green-500',
          link: '/financial/invoices',
          permission: 'invoices.view'
        },
        {
          title: 'Yêu cầu dịch vụ',
          value: counts?.service_requests || 0,
          icon: ClipboardDocumentListIcon,
          color: 'bg-purple-500',
          link: '/sales/service-requests',
          permission: 'orders.view'
        },
        {
          title: 'Tồn kho thấp',
          value: counts?.low_stock || 0,
          icon: CubeIcon,
          color: 'bg-orange-500',
          link: '/inventory/products',
          permission: 'products.view'
        }
      );
    }

    // Accountant - Financial focus
    if (hasRole('accountant')) {
      stats.push(
        {
          title: 'Hóa đơn chờ xử lý',
          value: counts?.invoices || 0,
          icon: CurrencyDollarIcon,
          color: 'bg-green-500',
          link: '/financial/invoices',
          permission: 'invoices.view'
        },
        {
          title: 'Thanh toán chờ',
          value: counts?.pending_payments || 0,
          icon: ArrowTrendingUpIcon,
          color: 'bg-blue-500',
          link: '/financial/payments',
          permission: 'payments.view'
        },
        {
          title: 'Quyết toán',
          value: counts?.settlements || 0,
          icon: ClipboardDocumentListIcon,
          color: 'bg-purple-500',
          link: '/financial/settlements',
          permission: 'settlements.view'
        }
      );
    }

    // Mechanic - Work orders focus
    if (hasRole('mechanic')) {
      stats.push(
        {
          title: 'Công việc của tôi',
          value: counts?.work_orders || 0,
          icon: ClipboardDocumentListIcon,
          color: 'bg-blue-500',
          link: '/sales/orders',
          permission: 'orders.manage_own'
        },
        {
          title: 'Yêu cầu mới',
          value: counts?.service_requests || 0,
          icon: BellAlertIcon,
          color: 'bg-orange-500',
          link: '/sales/service-requests'
        }
      );
    }

    // Employee - Customer & Orders
    if (hasRole('employee')) {
      stats.push(
        {
          title: 'Đơn hàng',
          value: counts?.orders || 0,
          icon: ShoppingCartIcon,
          color: 'bg-blue-500',
          link: '/sales/orders',
          permission: 'orders.view'
        },
        {
          title: 'Khách hàng',
          value: counts?.customers || 0,
          icon: UsersIcon,
          color: 'bg-green-500',
          link: '/customers/list',
          permission: 'customers.view'
        }
      );
    }

    // Filter by permissions
    return stats.filter(stat =>
      !stat.permission || hasPermission(stat.permission)
    );
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting}, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              {user?.role?.name && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user.role.name === 'admin' && 'Quản trị viên'}
                  {user.role.name === 'manager' && 'Quản lý'}
                  {user.role.name === 'accountant' && 'Kế toán'}
                  {user.role.name === 'mechanic' && 'Kỹ thuật viên'}
                  {user.role.name === 'employee' && 'Nhân viên'}
                </span>
              )}
              {user?.position && <span className="ml-2">• {user.position}</span>}
              {user?.department && <span className="ml-2">• {user.department}</span>}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Ngày</p>
              <p className="text-lg font-semibold">
                {new Date().toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            onClick={() => stat.link && navigate(stat.link)}
            className={`bg-white rounded-lg shadow-sm p-6 ${
              stat.link ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                {stat.change && (
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                )}
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {hasPermission('orders.create') && (
            <button
              onClick={() => navigate('/sales/orders')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <ShoppingCartIcon className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium">Tạo đơn hàng</span>
            </button>
          )}

          {hasPermission('customers.create') && (
            <button
              onClick={() => navigate('/customers/list')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <UsersIcon className="w-8 h-8 text-green-500 mb-2" />
              <span className="text-sm font-medium">Thêm khách hàng</span>
            </button>
          )}

          {hasPermission('products.view') && (
            <button
              onClick={() => navigate('/inventory/products')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <CubeIcon className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium">Quản lý kho</span>
            </button>
          )}

          {hasPermission('reports.financial') && (
            <button
              onClick={() => navigate('/reports/dashboard')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <ChartBarIcon className="w-8 h-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium">Báo cáo</span>
            </button>
          )}
        </div>
      </div>

      {/* Role-specific content */}
      {(hasRole('admin') || hasRole('manager')) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Hoạt động gần đây
            </h2>
            <div className="space-y-4">
              <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông báo
            </h2>
            <div className="space-y-4">
              <p className="text-gray-500 text-sm">
                {counts?.notifications || 0} thông báo mới
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
