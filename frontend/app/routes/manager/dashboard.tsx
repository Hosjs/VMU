import { Card } from '~/components/ui/Card';

export default function ManagerDashboard() {
  const stats = [
    { label: 'Yêu cầu mới hôm nay', value: '12', icon: '📝', color: 'bg-blue-100 text-blue-800' },
    { label: 'Đơn hàng đang xử lý', value: '28', icon: '⚙️', color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Doanh thu tháng', value: '₫125M', icon: '💰', color: 'bg-green-100 text-green-800' },
    { label: 'Khách hàng mới', value: '45', icon: '👥', color: 'bg-purple-100 text-purple-800' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Quản lý</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}>{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Yêu cầu dịch vụ gần đây">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">SR-2025-00{i}</p>
                  <p className="text-sm text-gray-600">Khách hàng {i}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Chờ xử lý</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Đơn hàng cần duyệt">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">ORD-2025-00{i}</p>
                  <p className="text-sm text-gray-600">₫{i * 5}M</p>
                </div>
                <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Duyệt</button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

