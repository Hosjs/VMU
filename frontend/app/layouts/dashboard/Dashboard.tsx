import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '~/contexts/AuthContext';
import { apiService } from '~/services/api.service';
import { Card } from '~/components/ui/Card';
import { Alert } from '~/components/ui/Alert';
import {
    UsersIcon,
    AcademicCapIcon,
    BanknotesIcon,
    ClockIcon,
    CheckCircleIcon,
    CalendarIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';

// Helper function to format numbers with dot separator
const formatNumber = (num: number | string): string => {
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return '0';
    return number.toLocaleString('de-DE');
};

export function meta() {
    return [
        { title: "Tổng quan - VMU Training" },
        { name: "description", content: "Trang tổng quan hệ thống quản lý giảng viên" },
    ];
}

interface DashboardStats {
    total_lecturers: number;
    total_teaching_assignments: number;
    total_payments: number;
    pending_payments: number;
    approved_payments: number;
    paid_payments: number;
    total_amount: number;
    pending_amount: number;
    paid_amount: number;
    current_semester: string;
}

interface RecentPayment {
    id: number;
    lecturer_name: string;
    subject_name: string;
    semester_code: string;
    total_amount: number;
    payment_status: string;
    created_at: string;
}

export default function Dashboard() {
    const { user } = useAuth();
    const location = useLocation();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [unauthorizedAlert, setUnauthorizedAlert] = useState<string | null>(null);

    useEffect(() => {
        // Check if redirected due to unauthorized access
        const state = location.state as { unauthorized?: boolean; message?: string } | null;
        if (state?.unauthorized && state?.message) {
            setUnauthorizedAlert(state.message);
            // Clear the state
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Load statistics
            const statsResponse = await apiService.get<DashboardStats>('/teaching-payments/statistics');
            setStats(statsResponse);

            // Load recent payments
            const paymentsResponse = await apiService.getPaginated('/teaching-payments', {
                page: 1,
                per_page: 5,
            });
            setRecentPayments((paymentsResponse.data || []) as RecentPayment[]);

        } catch (err: any) {
            console.error('Failed to load dashboard:', err);
            setError(err.message || 'Không thể tải dữ liệu dashboard');
        } finally {
            setIsLoading(false);
        }
    };


    const getPaymentStatusBadge = (status: string) => {
        const badges: Record<string, { label: string; className: string }> = {
            // English status
            pending: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
            approved: { label: 'Đã duyệt', className: 'bg-blue-100 text-blue-800' },
            paid: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-800' },
            rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
            // Vietnamese status
            'chua_thanh_toan': { label: 'Chưa thanh toán', className: 'bg-yellow-100 text-yellow-800' },
            'da_duyet': { label: 'Đã duyệt', className: 'bg-blue-100 text-blue-800' },
            'da_thanh_toan': { label: 'Đã thanh toán', className: 'bg-green-100 text-green-800' },
        };
        return badges[status] || { label: 'Không xác định', className: 'bg-gray-100 text-gray-800' };
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

            {/* Unauthorized Access Alert */}
            {unauthorizedAlert && (
                <Alert
                    type="error"
                    title="Không có quyền truy cập"
                    message={unauthorizedAlert}
                    onClose={() => setUnauthorizedAlert(null)}
                />
            )}

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Xin chào, {user?.name || 'User'}! 👋
                        </h1>
                        <p className="text-blue-100 text-lg">
                            Hệ thống quản lý giảng viên VMU Training
                        </p>
                        {stats?.current_semester && (
                            <div className="mt-3 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                                <CalendarIcon className="w-5 h-5" />
                                <span>Học kỳ hiện tại: {stats.current_semester}</span>
                            </div>
                        )}
                    </div>
                    <AcademicCapIcon className="w-24 h-24 opacity-30" />
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Lecturers */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-1">Tổng giảng viên</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats?.total_lecturers || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">Đang hoạt động</p>
                        </div>
                        <div className="w-16 h-16 rounded-lg bg-blue-50 flex items-center justify-center">
                            <UsersIcon className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </Card>

                {/* Teaching Assignments */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-1">Lịch giảng dạy</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats?.total_teaching_assignments || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">Tổng số lịch</p>
                        </div>
                        <div className="w-16 h-16 rounded-lg bg-purple-50 flex items-center justify-center">
                            <AcademicCapIcon className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                </Card>

                {/* Total Payments */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-1">Bản kê thanh toán</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats?.total_payments || 0}
                            </p>
                            <p className="text-xs text-green-600 mt-2">
                                {stats?.paid_payments || 0} đã thanh toán
                            </p>
                        </div>
                        <div className="w-16 h-16 rounded-lg bg-green-50 flex items-center justify-center">
                            <DocumentTextIcon className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </Card>

                {/* Total Amount */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-1">Tổng số tiền</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(stats?.total_amount || 0)}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">VNĐ</p>
                        </div>
                        <div className="w-16 h-16 rounded-lg bg-yellow-50 flex items-center justify-center">
                            <BanknotesIcon className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Payment Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Tổng quan thanh toán</h3>
                        <Link
                            to="/teachers/salaries"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Xem tất cả →
                        </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <ClockIcon className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-yellow-600">
                                {stats?.pending_payments || 0}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">Chờ duyệt</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {formatNumber(stats?.pending_amount || 0)} đ
                            </p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <CheckCircleIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-blue-600">
                                {stats?.approved_payments || 0}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">Đã duyệt</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                            <BanknotesIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-green-600">
                                {stats?.paid_payments || 0}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">Đã thanh toán</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {formatNumber(stats?.paid_amount || 0)} đ
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Quick Stats Card */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê nhanh</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Chờ duyệt</span>
                            <span className="text-lg font-bold text-yellow-600">
                                {stats?.pending_payments || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Cần thanh toán</span>
                            <span className="text-lg font-bold text-blue-600">
                                {stats?.approved_payments || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Hoàn thành</span>
                            <span className="text-lg font-bold text-green-600">
                                {stats?.paid_payments || 0}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Payments */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Bản kê thanh toán gần đây</h3>
                    <Link
                        to="/teachers/salaries"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Xem tất cả →
                    </Link>
                </div>
                {recentPayments && recentPayments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Giảng viên
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Môn học
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Học kỳ
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Số tiền
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Trạng thái
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentPayments.map((payment: any) => {
                                    const badge = getPaymentStatusBadge(payment.trang_thai_thanh_toan || payment.payment_status);
                                    return (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {payment.lecturer?.hoTen || payment.ho_ten_giang_vien || payment.can_bo_giang_day || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{payment.ten_hoc_phan || payment.subject_name || 'N/A'}</div>
                                                <div className="text-xs text-gray-500" dangerouslySetInnerHTML={{ __html: payment.lop || payment.class_name || '' }}></div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {payment.semester_code}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {formatNumber(payment.thuc_nhan || payment.thanh_tien_chua_thue || payment.total_amount || 0)} đ
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.className}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>Chưa có bản kê thanh toán nào</p>
                    </div>
                )}
            </Card>

            {/* Quick Actions */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                        to="/teachers/salaries"
                        className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors border border-blue-200 block"
                    >
                        <BanknotesIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <span className="text-sm font-medium text-gray-700">Quản lý thanh toán</span>
                    </Link>
                    <Link
                        to="/lecturers"
                        className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors border border-green-200 block"
                    >
                        <UsersIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <span className="text-sm font-medium text-gray-700">Quản lý giảng viên</span>
                    </Link>
                    <Link
                        to="/lecturer/assignments"
                        className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors border border-purple-200 block"
                    >
                        <AcademicCapIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <span className="text-sm font-medium text-gray-700">Lịch giảng dạy</span>
                    </Link>
                    <Link
                        to="/teachers/salaries"
                        className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-center transition-colors border border-yellow-200 block"
                    >
                        <DocumentTextIcon className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <span className="text-sm font-medium text-gray-700">Bảng giá thanh toán</span>
                    </Link>
                </div>
            </Card>
        </div>
    );
}
