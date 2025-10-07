import { Card } from '~/components/ui/Card';

export default function DashboardIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🚗</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Thắng Trường Auto Service</h1>
        <p className="text-gray-600 mb-6">Hệ thống quản lý garage chuyên nghiệp</p>
        <div className="flex flex-col gap-3">
          <div className="text-sm text-gray-500">Đang chuyển hướng...</div>
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </Card>
    </div>
  );
}

