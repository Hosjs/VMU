import { useAuth } from '~/contexts/AuthContext';

export default function EmployeeTasks() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nhiệm vụ của tôi</h1>
        <p className="text-gray-600 mt-1">Quản lý nhiệm vụ được giao</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Danh sách nhiệm vụ sẽ hiển thị ở đây...</p>
      </div>
    </div>
  );
}

