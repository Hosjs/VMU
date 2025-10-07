import { useAuth } from '~/contexts/AuthContext';

export default function ManagerInventory() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý kho hàng</h1>
        <p className="text-gray-600 mt-1">Xem tồn kho và quản lý sản phẩm</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Thông tin kho hàng sẽ hiển thị ở đây...</p>
      </div>
    </div>
  );
}

