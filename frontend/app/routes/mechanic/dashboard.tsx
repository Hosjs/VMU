import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';

export default function MechanicDashboard() {
  const stats = [
    { label: 'Công việc hôm nay', value: '5', icon: '🔧', color: 'bg-orange-100 text-orange-800' },
    { label: 'Đang xử lý', value: '2', icon: '⚙️', color: 'bg-blue-100 text-blue-800' },
    { label: 'Hoàn thành tuần', value: '18', icon: '✅', color: 'bg-green-100 text-green-800' },
    { label: 'Đánh giá TB', value: '4.8⭐', icon: '🌟', color: 'bg-yellow-100 text-yellow-800' },
  ];

  const tasks = [
    { id: 1, order: 'ORD-2025-001', vehicle: 'Toyota Camry - 30A-12345', service: 'Bảo dưỡng định kỳ', status: 'in_progress', priority: 'high' },
    { id: 2, order: 'ORD-2025-002', vehicle: 'Honda Civic - 29B-67890', service: 'Thay má phanh', status: 'pending', priority: 'normal' },
    { id: 3, order: 'ORD-2025-003', vehicle: 'Mazda 3 - 51G-11111', service: 'Kiểm tra hệ thống điện', status: 'pending', priority: 'high' },
  ];

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'warning' | 'info' | 'success' }> = {
      pending: { label: 'Chờ xử lý', variant: 'warning' },
      in_progress: { label: 'Đang làm', variant: 'info' },
      completed: { label: 'Hoàn thành', variant: 'success' },
    };
    return map[status] || { label: status, variant: 'info' };
  };

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, { label: string; color: string }> = {
      high: { label: 'Cao', color: 'bg-red-100 text-red-800' },
      normal: { label: 'Bình thường', color: 'bg-blue-100 text-blue-800' },
      low: { label: 'Thấp', color: 'bg-gray-100 text-gray-800' },
    };
    return map[priority] || { label: priority, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Thợ máy</h1>
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
      <Card title="Công việc được giao">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Đơn hàng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Xe</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Dịch vụ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Ưu tiên</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tasks.map((task) => {
                const statusBadge = getStatusBadge(task.status);
                const priorityBadge = getPriorityBadge(task.priority);
                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-blue-600">{task.order}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{task.vehicle}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{task.service}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${priorityBadge.color}`}>
                        {priorityBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button className="px-3 py-1 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
                        {task.status === 'pending' ? 'Bắt đầu' : 'Cập nhật'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

