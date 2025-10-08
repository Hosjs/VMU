import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { LoadingSpinner } from '~/components/LoadingSystem';

interface Vehicle {
  id: number;
  customer_name: string;
  brand_name: string;
  model_name: string;
  license_plate: string;
  is_active: boolean;
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setVehicles([
      { id: 1, customer_name: 'Nguyễn Văn A', brand_name: 'Toyota', model_name: 'Camry', license_plate: '30A-12345', is_active: true },
    ]);
    setLoading(false);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Quản lý xe</h1>
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Xe</th>
                <th className="px-4 py-3 text-left">Chủ xe</th>
                <th className="px-4 py-3 text-left">Biển số</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-4">{v.brand_name} {v.model_name}</td>
                  <td className="px-4 py-4">{v.customer_name}</td>
                  <td className="px-4 py-4"><span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded">{v.license_plate}</span></td>
                  <td className="px-4 py-4"><Badge variant={v.is_active ? 'success' : 'danger'}>{v.is_active ? 'Hoạt động' : 'Ngừng'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
