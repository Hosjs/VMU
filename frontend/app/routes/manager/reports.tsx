import { useAuth } from '~/contexts/AuthContext';

export default function ManagerReports() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo quản lý</h1>
        <p className="text-gray-600 mt-1">Xem các báo cáo và thống kê</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Báo cáo sẽ hiển thị ở đây...</p>
      </div>
    </div>
  );
}

