/**
 * ============================================
 * INVENTORY MODULE - INDEX/DASHBOARD
 * ============================================
 * Trang tổng quan module kho
 * Role: admin, manager, employee
 * Permissions: products.view, warehouses.view
 */

import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { productService } from '~/services';
import { useAuth } from '~/contexts/AuthContext';
import {
    CubeIcon,
    BuildingStorefrontIcon,
    ExclamationTriangleIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

export default function InventoryIndex() {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (hasPermission('products.view')) {
            fetchStats();
        }
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [statsData, lowStock] = await Promise.all([
                productService.getStatistics(),
                productService.getLowStockProducts()
            ]);
            setStats(statsData);
            setLowStockProducts(lowStock);
        } catch (error) {
            console.error('Failed to fetch inventory stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Check permissions
    if (!hasPermission('products.view') && !hasPermission('warehouses.view')) {
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
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Kho</h1>
                    <p className="text-gray-600 mt-1">Quản lý sản phẩm và tồn kho</p>
                </div>
                {hasPermission('products.create') && (
                    <button
                        onClick={() => navigate('/inventory/products')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Thêm sản phẩm
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Sản phẩm tồn kho thấp</p>
                            <p className="text-3xl font-bold text-orange-600">
                                {loading ? '...' : lowStockProducts.length}
                            </p>
                        </div>
                        <ExclamationTriangleIcon className="w-12 h-12 text-orange-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng sản phẩm</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {loading ? '...' : stats?.total_products || 0}
                            </p>
                        </div>
                        <CubeIcon className="w-12 h-12 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng kho</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {loading ? '...' : stats?.total_warehouses || 0}
                            </p>
                        </div>
                        <BuildingStorefrontIcon className="w-12 h-12 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mr-2" />
                        <h3 className="font-semibold text-orange-900">Cảnh báo tồn kho thấp</h3>
                    </div>
                    <p className="text-sm text-orange-700">
                        Có {lowStockProducts.length} sản phẩm đang có số lượng tồn kho thấp. Cần nhập hàng ngay.
                    </p>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hasPermission('products.view') && (
                    <div
                        onClick={() => navigate('/inventory/products')}
                        className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center">
                            <CubeIcon className="w-12 h-12 text-blue-500 mr-4" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Sản phẩm</h3>
                                <p className="text-gray-600 text-sm">Quản lý danh mục sản phẩm</p>
                            </div>
                        </div>
                    </div>
                )}

                {hasPermission('warehouses.view') && (
                    <div
                        onClick={() => navigate('/inventory/warehouses')}
                        className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center">
                            <BuildingStorefrontIcon className="w-12 h-12 text-purple-500 mr-4" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Kho hàng</h3>
                                <p className="text-gray-600 text-sm">Quản lý kho và tồn kho</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
