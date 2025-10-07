import { useAuth } from '~/contexts/AuthContext';

export default function MechanicServiceRequests() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Yêu cầu dịch vụ</h1>
        <p className="text-gray-600 mt-1">Xem yêu cầu dịch vụ cần xử lý</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Danh sách yêu cầu dịch vụ sẽ hiển thị ở đây...</p>
      </div>
    </div>
  );
}

