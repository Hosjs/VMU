import { useState, useEffect } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { dashboardService } from '~/services/dashboard.service';
import { Card } from '~/components/ui/Card';
import type { DashboardData, QuickStats } from '~/types/dashboard';

// Loader function for React Router v7
export function loader() {
    return null;
}

export function meta() {
    return [
        { title: "Dashboard - VMU Management" },
        { name: "description", content: "Trang tổng quan hệ thống" },
    ];
}

export default function Dashboard() {
    const { user, hasPermission } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await dashboardService.getDashboardData();
            setDashboardData(data);
        } catch (err: any) {
            console.error('Failed to load dashboard:', err);
            setError(err.message || 'Không thể tải dữ liệu dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    // Quick stats configuration
    const quickStats: QuickStats[] = dashboardData ? [
        {
            label: 'Tổng người dùng',
            value: dashboardData.stats.total_users,
            icon: '👥',
            color: 'blue',
            trend: { value: 12, isUp: true }
        },
        {
            label: 'Tổng khách hàng',
            value: dashboardData.stats.total_customers,
            icon: '🧑‍💼',
            color: 'green',
            trend: { value: 8, isUp: true }
        },
        {
            label: 'Đơn hàng',
            value: dashboardData.stats.total_orders,
            icon: '📦',
            color: 'purple',
            trend: { value: 5, isUp: false }
        },
        {
            label: 'Doanh thu',
            value: new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(dashboardData.stats.total_revenue),
            icon: '💰',
            color: 'yellow',
            trend: { value: 15, isUp: true }
        },
    ] : [];

    const getColorClasses = (color: string) => {
        const colors: Record<string, string> = {
            blue: 'bg-blue-50 text-blue-600 border-blue-200',
            green: 'bg-green-50 text-green-600 border-green-200',
            yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
            red: 'bg-red-50 text-red-600 border-red-200',
            purple: 'bg-purple-50 text-purple-600 border-purple-200',
            indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        };
        return colors[color] || colors.blue;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 font-semibold mb-2">Lỗi tải dữ liệu</p>
                <p className="text-red-500 text-sm mb-4">{error}</p>
                <button
                    onClick={loadDashboardData}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">
                    Xin chào, {user?.name || 'User'}! 👋
                </h1>
                <p className="text-blue-100">
                    Chào mừng bạn quay trở lại.
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 mb-2">
                                    {stat.value}
                                </p>
                                {stat.trend && (
                                    <div className="flex items-center text-sm">
                    <span className={stat.trend.isUp ? 'text-green-600' : 'text-red-600'}>
                      {stat.trend.isUp ? '↑' : '↓'} {stat.trend.value}%
                    </span>
                                        <span className="text-gray-500 ml-2">vs tháng trước</span>
                                    </div>
                                )}
                            </div>
                            <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl ${getColorClasses(stat.color)}`}>
                                {stat.icon}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Orders Overview */}
                <Card title="Tổng quan đơn hàng" className="lg:col-span-2">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <p className="text-3xl font-bold text-yellow-600">
                                {dashboardData?.stats.pending_orders || 0}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">Đang xử lý</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-3xl font-bold text-green-600">
                                {dashboardData?.stats.completed_orders || 0}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">Hoàn thành</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <p className="text-3xl font-bold text-red-600">
                                {dashboardData?.stats.cancelled_orders || 0}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">Đã hủy</p>
                        </div>
                    </div>
                </Card>

                {/* Inventory Alert */}
                <Card title="Cảnh báo tồn kho">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <p className="text-3xl font-bold text-red-600 mb-2">
                            {dashboardData?.stats.low_stock_products || 0}
                        </p>
                        <p className="text-sm text-gray-600">
                            Sản phẩm sắp hết hàng
                        </p>
                        {(dashboardData?.stats.low_stock_products || 0) > 0 && (
                            <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
                                Xem chi tiết →
                            </button>
                        )}
                    </div>
                </Card>
            </div>

            {/* Recent Activities */}
            <Card title="Hoạt động gần đây">
                {dashboardData?.recent_activities && dashboardData.recent_activities.length > 0 ? (
                    <div className="space-y-4">
                        {dashboardData.recent_activities.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    activity.type === 'order' ? 'bg-blue-100 text-blue-600' :
                                        activity.type === 'customer' ? 'bg-green-100 text-green-600' :
                                            activity.type === 'product' ? 'bg-purple-100 text-purple-600' :
                                                'bg-gray-100 text-gray-600'
                                }`}>
                                    {activity.type === 'order' ? '📦' :
                                        activity.type === 'customer' ? '👤' :
                                            activity.type === 'product' ? '📦' : '🔔'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900">{activity.title}</p>
                                    <p className="text-sm text-gray-600">{activity.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(activity.created_at).toLocaleString('vi-VN')}
                                        {activity.user_name && ` • ${activity.user_name}`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-4xl mb-2">📋</p>
                        <p>Chưa có hoạt động nào</p>
                    </div>
                )}
            </Card>

            {/* Quick Actions */}
            <Card title="Thao tác nhanh">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {hasPermission('customers.create') && (
                        <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
                            <span className="text-3xl block mb-2">➕</span>
                            <span className="text-sm font-medium text-gray-700">Thêm khách hàng</span>
                        </button>
                    )}
                    {hasPermission('orders.create') && (
                        <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
                            <span className="text-3xl block mb-2">🛒</span>
                            <span className="text-sm font-medium text-gray-700">Tạo đơn hàng</span>
                        </button>
                    )}
                    {hasPermission('products.create') && (
                        <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
                            <span className="text-3xl block mb-2">📦</span>
                            <span className="text-sm font-medium text-gray-700">Thêm sản phẩm</span>
                        </button>
                    )}
                    {hasPermission('reports.view') && (
                        <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-center transition-colors">
                            <span className="text-3xl block mb-2">📊</span>
                            <span className="text-sm font-medium text-gray-700">Xem báo cáo</span>
                        </button>
                    )}
                </div>
            </Card>
        </div>
    );
}
