import { useAuth } from '~/contexts/AuthContext';

export default function MechanicWorkOrders() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lệnh công việc</h1>
        <p className="text-gray-600 mt-1">Xem và xử lý lệnh công việc</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Danh sách lệnh công việc sẽ hiển thị ở đây...</p>
      </div>
    </div>
  );
}

