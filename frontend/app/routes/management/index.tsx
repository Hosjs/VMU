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
import { userService, roleService } from '~/services';
import {
  UsersIcon,
  ShieldCheckIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '~/contexts/AuthContext';

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  by_role: Record<string, number>;
}

export default function ManagementIndex() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [totalRoles, setTotalRoles] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const promises = [];

      if (hasPermission('users.view')) {
        promises.push(userService.getStatistics());
      }
      if (hasPermission('roles.view')) {
        promises.push(roleService.getRoles({ is_active: true }));
      }

      const results = await Promise.all(promises);

      if (hasPermission('users.view')) {
        setStats(results[0] as UserStats);
      }
      if (hasPermission('roles.view')) {
        const rolesIndex = hasPermission('users.view') ? 1 : 0;
        setTotalRoles((results[rolesIndex] as any[]).length);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check permissions
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
        {hasPermission('users.create') && (
          <button
            onClick={() => navigate('/management/users')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm người dùng
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hasPermission('users.view') && (
          <>
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
                  <p className="text-3xl font-bold text-green-600">
                    {loading ? '...' : stats?.active || 0}
                  </p>
                </div>
                <UsersIcon className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Không hoạt động</p>
                  <p className="text-3xl font-bold text-red-600">
                    {loading ? '...' : stats?.inactive || 0}
                  </p>
                </div>
                <UsersIcon className="w-12 h-12 text-red-500" />
              </div>
            </div>
          </>
        )}

        {hasPermission('roles.view') && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng vai trò</p>
                <p className="text-3xl font-bold text-purple-600">
                  {loading ? '...' : totalRoles}
                </p>
              </div>
              <ShieldCheckIcon className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        )}
      </div>

      {/* User by Role Chart */}
      {hasPermission('users.view') && stats?.by_role && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bổ theo vai trò</h3>
          <div className="space-y-3">
            {Object.entries(stats.by_role).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-gray-600 capitalize">{role}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
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
            <div className="flex items-center">
              <UsersIcon className="w-12 h-12 text-blue-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Người dùng</h3>
                <p className="text-gray-600 text-sm">Quản lý tài khoản người dùng</p>
              </div>
            </div>
          </div>
        )}

        {hasPermission('roles.view') && (
          <div
            onClick={() => navigate('/management/roles')}
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <ShieldCheckIcon className="w-12 h-12 text-purple-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Vai trò & Quyền</h3>
                <p className="text-gray-600 text-sm">Quản lý phân quyền hệ thống</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
