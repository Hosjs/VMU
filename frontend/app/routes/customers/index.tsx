/**
 * ============================================
 * CUSTOMERS MODULE - INDEX/DASHBOARD
 * ============================================
 * Trang tổng quan module khách hàng
 * Role: admin, manager, employee
 * Permissions: customers.view
 */

import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { customerService } from '~/services';
import {
    UsersIcon,
    TruckIcon,
    PlusIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

interface CustomerStats {
    total: number;
    active: number;
    inactive: number;
    with_insurance: number;
    total_orders: number;
    total_revenue: number;
    total_vehicles?: number;
    new_this_month?: number;
    total_customers?: number;
    active_customers?: number;
}

export default function CustomersIndex() {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const [stats, setStats] = useState<CustomerStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (hasPermission('customers.view')) {
            fetchStats();
        }
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await customerService.getStatistics();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Check if user has permission
    if (!hasPermission('customers.view')) {
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
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Khách hàng</h1>
                    <p className="text-gray-600 mt-1">Quản lý thông tin khách hàng và xe</p>
                </div>
                {hasPermission('customers.create') && (
                    <button
                        onClick={() => navigate('/customers/list')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Thêm khách hàng
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng khách hàng</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {loading ? '...' : stats?.total_customers || 0}
                            </p>
                        </div>
                        <UsersIcon className="w-12 h-12 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Khách hàng hoạt động</p>
                            <p className="text-3xl font-bold text-green-600">
                                {loading ? '...' : stats?.active_customers || 0}
                            </p>
                        </div>
                        <UsersIcon className="w-12 h-12 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng phương tiện</p>
                            <p className="text-3xl font-bold text-purple-600">
                                {loading ? '...' : stats?.total_vehicles || 0}
                            </p>
                        </div>
                        <TruckIcon className="w-12 h-12 text-purple-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Có bảo hiểm</p>
                            <p className="text-3xl font-bold text-orange-600">
                                {loading ? '...' : stats?.with_insurance || 0}
                            </p>
                        </div>
                        <ChartBarIcon className="w-12 h-12 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hasPermission('customers.view') && (
                    <div
                        onClick={() => navigate('/customers/list')}
                        className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center">
                            <UsersIcon className="w-12 h-12 text-blue-500 mr-4" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Danh sách khách hàng</h3>
                                <p className="text-gray-600 text-sm">Quản lý thông tin khách hàng</p>
                            </div>
                        </div>
                    </div>
                )}

                {hasPermission('vehicles.view') && (
                    <div
                        onClick={() => navigate('/customers/vehicles')}
                        className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center">
                            <TruckIcon className="w-12 h-12 text-purple-500 mr-4" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Phương tiện</h3>
                                <p className="text-gray-600 text-sm">Quản lý phương tiện khách hàng</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}