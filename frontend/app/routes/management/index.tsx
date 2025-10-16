/**
 * ============================================
 * MANAGEMENT MODULE - INDEX/DASHBOARD
 * ============================================
 * Trang tổng quan module quản lý hệ thống
 * Role: admin, manager
 * Permissions: users.view, roles.view
 */

import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { usePermissions } from '~/hooks/usePermissions';
import { userService } from '~/services';
import {
  UsersIcon,
  ShieldCheckIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  by_role: Record<string, number>;
}

export default function ManagementIndex() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasPermission('users.view')) {
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await userService.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission('users.view') && !hasPermission('roles.view')) {
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Hệ thống</h1>
          <p className="text-gray-600 mt-1">Quản lý người dùng và phân quyền</p>
        </div>
      </div>

      {/* Stats */}
      {hasPermission('users.view') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng người dùng</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats?.total || 0}
                </p>
              </div>
              <UsersIcon className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang hoạt động</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats?.active || 0}
                </p>
              </div>
              <UsersIcon className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Quản lý</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : (stats?.by_role?.manager || 0) + (stats?.by_role?.admin || 0)}
                </p>
              </div>
              <ShieldCheckIcon className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nhân viên</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : (stats?.by_role?.employee || 0) + (stats?.by_role?.mechanic || 0)}
                </p>
              </div>
              <ChartBarIcon className="w-12 h-12 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hasPermission('users.view') && (
          <div
            onClick={() => navigate('/management/users')}
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UsersIcon className="w-12 h-12 text-blue-500 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Quản lý Người dùng</h3>
                  <p className="text-gray-600 text-sm">Xem và quản lý người dùng</p>
                </div>
              </div>
              {hasPermission('users.create') && (
                <PlusIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
          </div>
        )}

        {hasPermission('roles.view') && (
          <div
            onClick={() => navigate('/management/roles')}
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ShieldCheckIcon className="w-12 h-12 text-purple-500 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Vai trò & Quyền</h3>
                  <p className="text-gray-600 text-sm">Quản lý vai trò và phân quyền</p>
                </div>
              </div>
              {hasPermission('roles.create') && (
                <PlusIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Role Distribution */}
      {hasPermission('users.view') && stats && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố theo vai trò</h3>
          <div className="space-y-3">
            {Object.entries(stats.by_role).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize">
                  {role === 'admin' && 'Quản trị viên'}
                  {role === 'manager' && 'Quản lý'}
                  {role === 'accountant' && 'Kế toán'}
                  {role === 'mechanic' && 'Kỹ thuật viên'}
                  {role === 'employee' && 'Nhân viên'}
                </span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-900 font-semibold w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
