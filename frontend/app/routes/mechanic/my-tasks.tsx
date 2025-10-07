import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';

export default function MyTasks() {
  const tasks = [
    { id: 1, order: 'ORD-2025-001', vehicle: 'Toyota Camry - 30A-12345', service: 'Bảo dưỡng định kỳ', status: 'in_progress' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Công việc của tôi</h1>
      {tasks.map((task) => (
        <Card key={task.id}>
          <h3 className="text-lg font-bold text-gray-900">{task.service}</h3>
          <p className="text-sm text-gray-600">Đơn hàng: {task.order}</p>
          <p className="font-medium text-gray-900">{task.vehicle}</p>
          <Badge variant="info">Đang làm</Badge>
        </Card>
      ))}
    </div>
  );
}

