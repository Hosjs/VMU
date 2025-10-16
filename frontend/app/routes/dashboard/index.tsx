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
 * - Real-time data từ API
 */

import { useAuth } from '~/contexts/AuthContext';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { LoadingSpinner } from '~/components/LoadingSystem';
import { dashboardService, type DashboardOverview } from '~/services/Reports/dashboard.service';
import { useAsync } from '~/hooks';
import {
  ChartBarIcon,
  UsersIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  link?: string;
  badge?: { text: string; variant: 'success' | 'warning' | 'danger' | 'info' };
}

export default function Dashboard() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  // ✅ SỬ DỤNG useAsync hook thay vì gọi trực tiếp
  const {
    data: stats,
    isLoading,
    error,
    execute: loadDashboardData,
  } = useAsync<DashboardOverview>(
    () => dashboardService.getOverview(),
    { immediate: true }
  );

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getRoleDisplayName = (roleName: string) => {
    const roleNames: Record<string, string> = {
      admin: 'Quản trị viên',
      manager: 'Quản lý',
      accountant: 'Kế toán',
      mechanic: 'Kỹ thuật viên',
      employee: 'Nhân viên',
      warehouse: 'Quản lý kho',
    };
    return roleNames[roleName] || roleName;
  };

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, color, link, badge }: StatCardProps) => (
    <Card
      className={link ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
      onClick={() => link && navigate(link)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {badge && (
            <div className="mt-2">
              <Badge variant={badge.variant}>{badge.text}</Badge>
            </div>
          )}
        </div>
        <div className={`${color} p-4 rounded-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải dữ liệu</h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Button onClick={loadDashboardData}>Thử lại</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting}, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              {user?.role?.display_name && (
                <Badge variant="info">
                  {user.role.display_name}
                </Badge>
              )}
              {user?.position && <span>• {user.position}</span>}
              {user?.department && <span>• {user.department}</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Hôm nay</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Đơn hàng */}
        {hasPermission('orders.view') && (
          <StatCard
            title="Tổng đơn hàng"
            value={stats?.orders.total || 0}
            icon={ShoppingCartIcon}
            color="bg-blue-500"
            link="/sales/orders"
            badge={
              stats && stats.orders.pending > 0
                ? { text: `${stats.orders.pending} chờ xử lý`, variant: 'warning' }
                : undefined
            }
          />
        )}

        {/* Khách hàng */}
        {hasPermission('customers.view') && (
          <StatCard
            title="Khách hàng"
            value={stats?.customers.total || 0}
            icon={UsersIcon}
            color="bg-green-500"
            link="/customers"
            badge={
              stats && stats.customers.new_this_month > 0
                ? { text: `${stats.customers.new_this_month} mới tháng này`, variant: 'info' }
                : undefined
            }
          />
        )}

        {/* Doanh thu hôm nay */}
        {hasPermission('reports.financial') && (
          <StatCard
            title="Doanh thu hôm nay"
            value={formatCurrency(stats?.revenue.today || 0)}
            icon={CurrencyDollarIcon}
            color="bg-purple-500"
            link="/reports/dashboard"
          />
        )}

        {/* Doanh thu tháng này */}
        {hasPermission('reports.financial') && (
          <StatCard
            title="Doanh thu tháng này"
            value={formatCurrency(stats?.revenue.this_month || 0)}
            icon={ArrowTrendingUpIcon}
            color="bg-indigo-500"
            link="/reports/dashboard"
          />
        )}
      </div>

      {/* Quick Actions */}
      <Card title="Thao tác nhanh">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {hasPermission('orders.create') && (
            <button
              onClick={() => navigate('/sales/orders')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <ShoppingCartIcon className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Tạo đơn hàng</span>
            </button>
          )}

          {hasPermission('customers.create') && (
            <button
              onClick={() => navigate('/customers')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <UsersIcon className="w-8 h-8 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Thêm khách hàng</span>
            </button>
          )}

          {hasPermission('products.view') && (
            <button
              onClick={() => navigate('/inventory/products')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <CubeIcon className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Quản lý kho</span>
            </button>
          )}

          {hasPermission('reports.financial') && (
            <button
              onClick={() => navigate('/reports/dashboard')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <ChartBarIcon className="w-8 h-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Báo cáo chi tiết</span>
            </button>
          )}
        </div>
      </Card>

      {/* Admin/Manager specific sections */}
      {(hasPermission('dashboard.view') || hasPermission('reports.financial')) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Status */}
          <Card title="Trạng thái hệ thống">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Hệ thống</span>
                </div>
                <Badge variant="success">Hoạt động tốt</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Database</span>
                </div>
                <Badge variant="info">Kết nối</Badge>
              </div>

              {stats && stats.orders.in_progress > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Đơn hàng đang xử lý</span>
                  </div>
                  <Badge variant="warning">{stats.orders.in_progress} đơn</Badge>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Links */}
          <Card title="Liên kết nhanh">
            <div className="space-y-2">
              {hasPermission('users.view') && (
                <button
                  onClick={() => navigate('/management/users')}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <span className="text-sm font-medium text-gray-900">Quản lý người dùng</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {hasPermission('roles.view') && (
                <button
                  onClick={() => navigate('/management/roles')}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <span className="text-sm font-medium text-gray-900">Quản lý vai trò</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {hasPermission('invoices.view') && (
                <button
                  onClick={() => navigate('/financial/invoices')}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <span className="text-sm font-medium text-gray-900">Hóa đơn</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {hasPermission('providers.view') && (
                <button
                  onClick={() => navigate('/partners/providers')}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <span className="text-sm font-medium text-gray-900">Nhà cung cấp</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
