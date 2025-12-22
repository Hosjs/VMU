import { Card } from '~/components/ui/Card';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export default function ReportsPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Báo cáo</h1>
                <p className="text-gray-600 mt-1">Xem và xuất báo cáo thống kê hệ thống</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <ChartBarIcon className="w-12 h-12 text-blue-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Báo cáo báo giá</h3>
                    <p className="text-sm text-gray-600">Thống kê các báo giá theo thời gian, trạng thái</p>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <ChartBarIcon className="w-12 h-12 text-green-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Báo cáo thanh toán</h3>
                    <p className="text-sm text-gray-600">Thống kê thanh toán nội bộ theo loại, trạng thái</p>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <ChartBarIcon className="w-12 h-12 text-purple-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Báo cáo doanh thu</h3>
                    <p className="text-sm text-gray-600">Thống kê doanh thu từ các báo giá đã duyệt</p>
                </Card>
            </div>

            <Card className="p-6 mt-6">
                <div className="text-center py-12 text-gray-500">
                    <p>Module đang được phát triển</p>
                </div>
            </Card>
        </div>
    );
}