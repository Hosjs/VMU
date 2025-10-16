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
import { usePermissions } from '~/hooks/usePermissions';
import { productService } from '~/services';
import {
    CubeIcon,
    BuildingStorefrontIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

export default function InventoryIndex() {
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();
    const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (hasPermission('products.view')) {
            fetchLowStock();
        }
    }, []);

    const fetchLowStock = async () => {
        try {
            setLoading(true);
            const products = await productService.getLowStockProducts();
            setLowStockProducts(products);
        } catch (error) {
            console.error('Failed to fetch low stock:', error);
        } finally {
            setLoading(false);
        }
    };

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
                            <p className="text-3xl font-bold text-gray-900">-</p>
                        </div>
                        <CubeIcon className="w-12 h-12 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Số kho</p>
                            <p className="text-3xl font-bold text-gray-900">-</p>
                        </div>
                        <BuildingStorefrontIcon className="w-12 h-12 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Low Stock Alert */}
            {hasPermission('products.view') && lowStockProducts.length > 0 && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="w-6 h-6 text-orange-500 mr-3" />
                        <div>
                            <h3 className="text-sm font-medium text-orange-800">
                                Cảnh báo tồn kho thấp
                            </h3>
                            <p className="text-sm text-orange-700 mt-1">
                                Có {lowStockProducts.length} sản phẩm có tồn kho thấp. Vui lòng nhập thêm hàng.
                            </p>
                        </div>
                    </div>
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
                                <h3 className="text-lg font-semibold text-gray-900">Quản lý Sản phẩm</h3>
                                <p className="text-gray-600 text-sm">Xem và quản lý sản phẩm</p>
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
                                <h3 className="text-lg font-semibold text-gray-900">Quản lý Kho</h3>
                                <p className="text-gray-600 text-sm">Xem và quản lý kho hàng</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Low Stock Products Table */}
            {hasPermission('products.view') && lowStockProducts.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Sản phẩm tồn kho thấp</h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mức tối thiểu</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {lowStockProducts.slice(0, 5).map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {product.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.sku}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {product.stock_quantity}
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.min_stock_level}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {lowStockProducts.length > 5 && (
                        <div className="px-6 py-4 bg-gray-50 text-center">
                            <button
                                onClick={() => navigate('/inventory/products')}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Xem tất cả ({lowStockProducts.length})
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

