import { Card } from '~/components/ui/Card';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
                <p className="text-gray-600 mt-1">Cấu hình các thông số hệ thống</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <Cog6ToothIcon className="w-12 h-12 text-blue-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Cài đặt chung</h3>
                    <p className="text-sm text-gray-600">Cấu hình thông tin công ty, logo, thông tin liên hệ</p>
                </Card>

                <Card className="p-6">
                    <Cog6ToothIcon className="w-12 h-12 text-green-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Cài đặt email</h3>
                    <p className="text-sm text-gray-600">Cấu hình email thông báo, mẫu email</p>
                </Card>

                <Card className="p-6">
                    <Cog6ToothIcon className="w-12 h-12 text-purple-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Cài đặt báo giá</h3>
                    <p className="text-sm text-gray-600">Mẫu báo giá, điều khoản, thuế mặc định</p>
                </Card>

                <Card className="p-6">
                    <Cog6ToothIcon className="w-12 h-12 text-yellow-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Cài đặt thanh toán</h3>
                    <p className="text-sm text-gray-600">Phương thức thanh toán, giới hạn ứng lương</p>
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