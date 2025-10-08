import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { LoadingSpinner } from '~/components/LoadingSystem';

interface Service {
    id: number;
    name: string;
    code: string;
    category_name: string;
    quote_price: number;
    settlement_price: number;
    unit: string;
    is_active: boolean;
}

export default function Services() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadServices();
    }, [search]);

    const loadServices = async () => {
        setLoading(true);
        setTimeout(() => {
            setServices([
                {
                    id: 1,
                    name: 'Bảo dưỡng định kỳ Toyota',
                    code: 'SV-001',
                    category_name: 'Bảo dưỡng',
                    quote_price: 1500000,
                    settlement_price: 1200000,
                    unit: 'lần',
                    is_active: true,
                },
            ]);
            setLoading(false);
        }, 500);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dịch vụ</h1>
                    <p className="text-gray-600 mt-1">Quản lý danh mục dịch vụ</p>
                </div>
                <Link to="/admin/services/create">
                    <Button variant="primary">+ Thêm dịch vụ</Button>
                </Link>
            </div>

            <Card className="mb-6">
                <Input placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Dịch vụ</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Danh mục</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Giá báo KH</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Giá QT</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y">
                            {services.map((service) => (
                                <tr key={service.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4">
                                        <Link to={`/admin/services/${service.id}`} className="font-medium text-gray-900">{service.name}</Link>
                                        <p className="text-xs text-gray-600">{service.code}</p>
                                    </td>
                                    <td className="px-4 py-4"><Badge variant="info">{service.category_name}</Badge></td>
                                    <td className="px-4 py-4 font-semibold text-blue-600">{formatCurrency(service.quote_price)}</td>
                                    <td className="px-4 py-4 font-semibold text-gray-900">{formatCurrency(service.settlement_price)}</td>
                                    <td className="px-4 py-4"><Badge variant={service.is_active ? 'success' : 'danger'}>{service.is_active ? 'Hoạt động' : 'Ngừng'}</Badge></td>
                                    <td className="px-4 py-4"><Link to={`/admin/services/${service.id}`}><Button size="sm" variant="ghost">Xem</Button></Link></td>
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
