import { useAuth } from '~/contexts/AuthContext';

export default function AccountantSettlements() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý quyết toán</h1>
        <p className="text-gray-600 mt-1">Xem và xử lý quyết toán với đối tác</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Danh sách quyết toán sẽ hiển thị ở đây...</p>
      </div>
    </div>
  );
}

