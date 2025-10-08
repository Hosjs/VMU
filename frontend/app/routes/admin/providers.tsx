import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { LoadingSpinner } from '~/components/LoadingSystem';

interface Provider {
  id: number;
  code: string;
  name: string;
  contact_person?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended' | 'blacklisted';
  rating: number;
  completed_orders: number;
}

const statusColors = {
  active: 'success',
  inactive: 'danger',
  suspended: 'warning',
  blacklisted: 'danger',
} as const;

export default function Providers() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProviders();
  }, [search]);

  const loadProviders = async () => {
    setLoading(true);
    setTimeout(() => {
      setProviders([
        {
          id: 1,
          code: 'GT-VN',
          name: 'Garage Việt Nga',
          contact_person: 'Nguyễn Văn A',
          phone: '0987654321',
          status: 'active',
          rating: 4.8,
          completed_orders: 245,
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
      suspended: 'Tạm dừng',
      blacklisted: 'Danh sách đen',
    };
    return map[status] || status;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Garage liên kết</h1>
          <p className="text-gray-600 mt-1">Quản lý các đối tác garage liên kết</p>
        </div>
        <Link to="/admin/providers/create">
          <Button variant="primary">
            <span className="mr-2">+</span>
            Thêm đối tác mới
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <Input
          placeholder="Tìm kiếm theo tên, mã, SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      <Card>
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Đối tác</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Liên hệ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Đánh giá</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {providers.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <Link to={`/admin/providers/${provider.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {provider.name}
                      </Link>
                      <p className="text-sm text-gray-600">{provider.code}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{provider.contact_person}</p>
                      <p className="text-sm text-gray-600">{provider.phone}</p>
                    </td>
                    <td className="px-4 py-4">⭐ {provider.rating.toFixed(1)}</td>
                    <td className="px-4 py-4">
                      <Badge variant={statusColors[provider.status]}>
                        {getStatusText(provider.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Link to={`/admin/providers/${provider.id}`}>
                        <Button size="sm" variant="ghost">Xem</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
