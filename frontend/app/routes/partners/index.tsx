/**
 * ============================================
 * PARTNERS MODULE - INDEX/DASHBOARD
 * ============================================
 * Trang tổng quan module đối tác
 * Role: admin, manager
 * Permissions: providers.view
 */

import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { providerService } from '~/services';
import {
  BuildingOfficeIcon,
  TruckIcon,
  StarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '~/contexts/AuthContext';

interface ProviderStats {
  total: number;
  active: number;
  total_orders: number;
  total_settlements: number;
}

export default function PartnersIndex() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasPermission('providers.view')) {
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await providerService.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check permission
  if (!hasPermission('providers.view')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bạn không có quyền truy cập module này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đối tác</h1>
          <p className="text-gray-600 mt-1">Quản lý nhà cung cấp và đối tác</p>
        </div>
        {hasPermission('providers.create') && (
          <button
            onClick={() => navigate('/partners/providers')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm đối tác
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng đối tác</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : stats?.total || 0}
              </p>
            </div>
            <BuildingOfficeIcon className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đang hoạt động</p>
              <p className="text-3xl font-bold text-green-600">
                {loading ? '...' : stats?.active || 0}
              </p>
            </div>
            <BuildingOfficeIcon className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
              <p className="text-3xl font-bold text-purple-600">
                {loading ? '...' : stats?.total_orders || 0}
              </p>
            </div>
            <TruckIcon className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hasPermission('providers.view') && (
          <div
            onClick={() => navigate('/partners/providers')}
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <BuildingOfficeIcon className="w-12 h-12 text-blue-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Nhà cung cấp</h3>
                <p className="text-gray-600 text-sm">Quản lý nhà cung cấp phụ tùng</p>
              </div>
            </div>
          </div>
        )}

        <div
          onClick={() => navigate('/partners/providers')}
          className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow opacity-50"
        >
          <div className="flex items-center">
            <StarIcon className="w-12 h-12 text-yellow-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Đánh giá đối tác</h3>
              <p className="text-gray-600 text-sm">Xem đánh giá và thống kê</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
