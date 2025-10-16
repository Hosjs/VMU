/**
 * ============================================
 * SALES MODULE - INDEX/DASHBOARD
 * ============================================
 * Trang tổng quan module bán hàng
 * Role: admin, manager, employee, mechanic
 * Permissions: orders.view
 */

import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { orderService } from '~/services';
import {
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface OrderStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  total_revenue: number;
}

export default function SalesIndex() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasPermission('orders.view')) {
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await orderService.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission('orders.view')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bạn không có quyền truy cập module này</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Bán hàng</h1>
          <p className="text-gray-600 mt-1">Quản lý đơn hàng và yêu cầu dịch vụ</p>
        </div>
        {hasPermission('orders.create') && (
          <button
            onClick={() => navigate('/sales/orders')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Tạo đơn hàng
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : stats?.total || 0}
              </p>
            </div>
            <ShoppingCartIcon className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chờ xử lý</p>
              <p className="text-3xl font-bold text-orange-600">
                {loading ? '...' : stats?.pending || 0}
              </p>
            </div>
            <ClipboardDocumentListIcon className="w-12 h-12 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đang xử lý</p>
              <p className="text-3xl font-bold text-yellow-600">
                {loading ? '...' : stats?.in_progress || 0}
              </p>
            </div>
            <ClipboardDocumentListIcon className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hoàn thành</p>
              <p className="text-3xl font-bold text-green-600">
                {loading ? '...' : stats?.completed || 0}
              </p>
            </div>
            <CheckCircleIcon className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã hủy</p>
              <p className="text-3xl font-bold text-red-600">
                {loading ? '...' : stats?.cancelled || 0}
              </p>
            </div>
            <XCircleIcon className="w-12 h-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Revenue Summary */}
      {stats && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Tổng doanh thu</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : formatCurrency(stats?.total_revenue || 0)}
              </p>
            </div>
            <ShoppingCartIcon className="w-16 h-16 text-blue-200" />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hasPermission('orders.view') && (
          <div
            onClick={() => navigate('/sales/orders')}
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <ShoppingCartIcon className="w-12 h-12 text-blue-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Đơn hàng</h3>
                <p className="text-gray-600 text-sm">Quản lý đơn hàng bán hàng</p>
              </div>
            </div>
          </div>
        )}

        {hasPermission('orders.view') && (
          <div
            onClick={() => navigate('/sales/service-requests')}
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <ClipboardDocumentListIcon className="w-12 h-12 text-green-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Yêu cầu dịch vụ</h3>
                <p className="text-gray-600 text-sm">Quản lý yêu cầu sửa chữa</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
