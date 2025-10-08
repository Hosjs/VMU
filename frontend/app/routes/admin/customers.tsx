import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { LoadingSpinner } from '~/components/LoadingSystem';

interface Customer {
    id: number;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    vehicles_count: number;
    orders_count: number;
    total_spent: number;
    last_visit?: string;
    is_active: boolean;
    created_at: string;
}

export default function Customers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadCustomers();
    }, [search]);

    const loadCustomers = async () => {
        setLoading(true);
        setTimeout(() => {
            const mockData: Customer[] = [
                {
                    id: 1,
                    name: 'Nguyễn Văn A',
                    phone: '0987654321',
                    email: 'nguyenvana@email.com',
                    address: '123 Đường ABC, Hà Nội',
                    vehicles_count: 2,
                    orders_count: 15,
                    total_spent: 45000000,
                    last_visit: '2025-10-05',
                    is_active: true,
                    created_at: '2024-01-15',
                },
            ];
            setCustomers(mockData);
            setLoading(false);
        }, 500);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Khách hàng</h1>
                    <p className="text-gray-600 mt-1">Quản lý thông tin khách hàng</p>
                </div>
                <Link to="/admin/customers/create">
                    <Button variant="primary">
                        <span className="mr-2">+</span>
                        Thêm khách hàng
                    </Button>
                </Link>
            </div>

            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        placeholder="Tìm kiếm theo tên, SĐT, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </Card>

            <Card>
                {loading ? (
                    <div className="text-center py-12">
                        <div className="flex flex-col items-center">
                            <LoadingSpinner size="lg" />
                            <p className="mt-4 text-gray-600">Đang tải...</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Khách hàng</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Liên hệ</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Số xe</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Đơn hàng</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tổng chi tiêu</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y">
                            {customers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4">
                                        <Link
                                            to={`/admin/customers/${customer.id}`}
                                            className="font-medium text-gray-900 hover:text-blue-600"
                                        >
                                            {customer.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="text-sm font-medium text-gray-900">{customer.phone}</p>
                                    </td>
                                    <td className="px-4 py-4 text-center">{customer.vehicles_count}</td>
                                    <td className="px-4 py-4 text-center">{customer.orders_count}</td>
                                    <td className="px-4 py-4">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(customer.total_spent)}
                      </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Badge variant={customer.is_active ? 'success' : 'danger'}>
                                            {customer.is_active ? 'Hoạt động' : 'Không hoạt động'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <Link to={`/admin/customers/${customer.id}`}>
                                                <Button size="sm" variant="ghost">Xem</Button>
                                            </Link>
                                        </div>
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
