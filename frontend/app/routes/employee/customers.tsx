import { useAuth } from '~/contexts/AuthContext';

export default function EmployeeCustomers() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Khách hàng</h1>
        <p className="text-gray-600 mt-1">Quản lý khách hàng được phân công</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Danh sách khách hàng sẽ hiển thị ở đây...</p>
      </div>
    </div>
  );
}
