/**
 * ============================================
 * CUSTOMERS LIST PAGE
 * ============================================
 * Danh sách khách hàng với CRUD operations
 * Role: admin, manager, employee
 * Permissions: customers.view, customers.create, customers.edit, customers.delete
 */

import { useState } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { customerService } from '~/services';
import type { Customer, CreateCustomerData } from '~/types/customer';
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import { Table } from '~/components/ui/Table';
import { Pagination } from '~/components/ui/Pagination';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Toast, type ToastType } from '~/components/ui/Toast';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export default function CustomersList() {
  const { hasPermission } = useAuth();

  // ✅ SỬ DỤNG useTable hook
  const {
    data: customers,
    isLoading,
    meta,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    handleSearch,
    refresh,
    sortBy,
    sortDirection,
  } = useTable<Customer>({
    fetchData: customerService.getCustomers,
    initialPerPage: 20,
    initialSortBy: 'created_at',
    initialSortDirection: 'desc',
  });

  // ✅ SỬ DỤNG useModal hook
  const modal = useModal(false);

  // States
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CreateCustomerData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    gender: 'male',
    is_active: true,
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleCreate = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      gender: 'male',
      is_active: true,
    });
    modal.open();
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      gender: customer.gender || 'male',
      birth_date: customer.birth_date || '',
      insurance_company: customer.insurance_company || '',
      insurance_number: customer.insurance_number || '',
      notes: customer.notes || '',
      is_active: customer.is_active ?? true,
    });
    modal.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, formData);
        showToast('Cập nhật khách hàng thành công', 'success');
      } else {
        await customerService.createCustomer(formData);
        showToast('Tạo khách hàng thành công', 'success');
      }
      modal.close();
      refresh();
    } catch (error: any) {
      showToast(error.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa khách hàng này?')) return;

    try {
      await customerService.deleteCustomer(id);
      showToast('Xóa khách hàng thành công', 'success');
      refresh();
    } catch (error: any) {
      showToast(error.data?.message || 'Không thể xóa khách hàng', 'error');
    }
  };

  // ✅ Định nghĩa columns
  const columns = [
    {
      key: 'customer_code',
      label: 'Mã KH',
      sortable: true,
      render: (customer: Customer) => (
        <div className="flex items-center">
          <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
          <span className="font-medium text-gray-900">
            {customer.customer_code || `KH-${customer.id}`}
          </span>
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Tên khách hàng',
      sortable: true,
      render: (customer: Customer) => (
        <div>
          <div className="font-medium text-gray-900">{customer.name}</div>
          <div className="text-sm text-gray-500">{customer.phone}</div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (customer: Customer) => customer.email || '-',
    },
    {
      key: 'address',
      label: 'Địa chỉ',
      render: (customer: Customer) => (
        <div className="max-w-xs truncate" title={customer.address}>
          {customer.address || '-'}
        </div>
      ),
    },
    {
      key: 'vehicles_count',
      label: 'Số xe',
      render: (customer: Customer) => (
        <Badge variant="info">{customer.vehicles_count || 0} xe</Badge>
      ),
    },
    {
      key: 'is_active',
      label: 'Trạng thái',
      render: (customer: Customer) => (
        <Badge variant={customer.is_active ? 'success' : 'danger'}>
          {customer.is_active ? 'Hoạt động' : 'Ngưng'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (customer: Customer) => (
        <div className="flex items-center space-x-2">
          {hasPermission('customers.edit') && (
            <button
              onClick={() => handleEdit(customer)}
              className="text-blue-600 hover:text-blue-900"
              title="Sửa"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
          {hasPermission('customers.delete') && (
            <button
              onClick={() => handleDelete(customer.id)}
              className="text-red-600 hover:text-red-900"
              title="Xóa"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!hasPermission('customers.view')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bạn không có quyền truy cập trang này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách Khách hàng</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin khách hàng</p>
        </div>
        {hasPermission('customers.create') && (
          <Button onClick={handleCreate}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm khách hàng
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <input
          type="text"
          placeholder="Tìm kiếm khách hàng..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={customers}
          isLoading={isLoading}
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortDirection}
          emptyMessage="Không có khách hàng nào"
        />

        {/* Pagination */}
        <Pagination
          currentPage={meta.current_page}
          totalPages={meta.last_page}
          onPageChange={handlePageChange}
          perPage={meta.per_page}
          onPerPageChange={handlePerPageChange}
          total={meta.total}
        />
      </div>

      {/* ✅ Modal Create/Edit */}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={editingCustomer ? 'Sửa khách hàng' : 'Thêm khách hàng mới'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tên khách hàng"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Số điện thoại"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Select
              label="Giới tính"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </Select>
          </div>

          <Input
            label="Địa chỉ"
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày sinh"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            />

            <Input
              label="Công ty bảo hiểm"
              type="text"
              value={formData.insurance_company}
              onChange={(e) => setFormData({ ...formData, insurance_company: e.target.value })}
            />
          </div>

          <Input
            label="Số bảo hiểm"
            type="text"
            value={formData.insurance_number}
            onChange={(e) => setFormData({ ...formData, insurance_number: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Khách hàng hoạt động
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={modal.close}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editingCustomer ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
