import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { LoadingSpinner } from '~/components/LoadingSystem';

interface Settlement {
  id: number;
  settlement_number: string;
  order_number: string;
  provider_name: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'paid' | 'completed' | 'disputed';
  settlement_total: number;
  paid_amount: number;
}

const statusColors = {
  draft: 'info',
  pending_approval: 'warning',
  approved: 'info',
  paid: 'success',
  completed: 'success',
  disputed: 'danger',
} as const;

export default function Settlements() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettlements();
  }, []);

  const loadSettlements = async () => {
    setLoading(true);
    setTimeout(() => {
      setSettlements([
        { id: 1, settlement_number: 'STL-2025-001', order_number: 'ORD-2025-001', provider_name: 'Garage Việt Nga', status: 'approved', settlement_total: 12000000, paid_amount: 6000000 },
      ]);
      setLoading(false);
    }, 500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Quyết toán</h1>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Mã QT</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Đối tác</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Tổng tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {settlements.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-4"><Link to={`/admin/settlements/${s.id}`} className="text-blue-600">{s.settlement_number}</Link></td>
                    <td className="px-4 py-4">{s.provider_name}</td>
                    <td className="px-4 py-4 font-semibold">{formatCurrency(s.settlement_total)}</td>
                    <td className="px-4 py-4"><Badge variant={statusColors[s.status]}>Đã duyệt</Badge></td>
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
