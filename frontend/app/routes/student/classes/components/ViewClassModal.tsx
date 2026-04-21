import { XMarkIcon } from '@heroicons/react/24/outline';
import { Modal } from '~/components/ui/Modal';
import { Badge } from '~/components/ui/Badge';
import type { Room } from '~/types/room';
import { formatters } from '~/utils/formatters';

interface ViewClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: Room | null;
}

export function ViewClassModal({ isOpen, onClose, classData }: ViewClassModalProps) {
  if (!classData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Chi tiết lớp học</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Thông tin cơ bản */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">ID</label>
                <p className="font-medium text-gray-900">{classData.id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Tên lớp</label>
                <p className="font-medium text-blue-600">{classData.class_name || classData.tenLop}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Ngành học</label>
                <p className="font-medium text-gray-900">
                  {classData.major_name || classData.maNganhHocNavigation?.tenNganh || 'Chưa xác định'}
                </p>
                {classData.major_code && (
                  <p className="text-sm text-gray-500">Mã: {classData.major_code}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600">Trình độ</label>
                <div className="mt-1">
                  <Badge variant="info">
                    {classData.maTrinhDoDaoTao || 'Chưa xác định'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin khóa học */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Thông tin năm học</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Mã năm học</label>
                <div className="mt-1">
                  <Badge variant="secondary">
                    {formatters.courseCode({ ma_khoa_hoc: classData.ma_khoa_hoc, nam_hoc: classData.nam_hoc }) || 'N/A'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Thông tin năm học</label>
                <p className="font-medium text-gray-900">
                  {formatters.courseCodeDetail({ ma_khoa_hoc: classData.ma_khoa_hoc, nam_hoc: classData.nam_hoc }) || 'Chưa xác định'}
                </p>
              </div>
            </div>
          </div>

          {/* Giảng viên */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Giảng viên phụ trách</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm text-gray-600">Phụ trách lớp</label>
                <p className="font-medium text-gray-900">
                  {classData.phu_trach_lop || classData.lecturer_name || classData.giaoVienChuNhiem || 'Chưa phân công'}
                </p>
              </div>
              {classData.lecurer_id && (
                <div>
                  <label className="text-sm text-gray-600">ID Giảng viên</label>
                  <p className="font-medium text-gray-900">{classData.lecurer_id}</p>
                </div>
              )}
            </div>
          </div>

          {/* Trạng thái và thống kê */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Trạng thái & Thống kê</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Trạng thái</label>
                <div className="mt-1">
                  <Badge variant={classData.trangThai === 'active' ? 'success' : 'secondary'}>
                    {classData.trangThai || 'Đang hoạt động'}
                  </Badge>
                </div>
              </div>
              {classData.soLuongHocVien !== undefined && (
                <div>
                  <label className="text-sm text-gray-600">Số lượng học viên</label>
                  <p className="font-medium text-gray-900">{classData.soLuongHocVien} học viên</p>
                </div>
              )}
            </div>
          </div>

          {/* Thông tin hệ thống */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Thông tin hệ thống</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classData.created_at && (
                <div>
                  <label className="text-sm text-gray-600">Ngày tạo</label>
                  <p className="font-medium text-gray-900">
                    {new Date(classData.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
              {classData.updated_at && (
                <div>
                  <label className="text-sm text-gray-600">Ngày cập nhật</label>
                  <p className="font-medium text-gray-900">
                    {new Date(classData.updated_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
              {classData.deleted_at && (
                <div>
                  <label className="text-sm text-gray-600">Ngày xóa</label>
                  <p className="font-medium text-red-600">
                    {new Date(classData.deleted_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
              {classData.createdBy && (
                <div>
                  <label className="text-sm text-gray-600">Người tạo</label>
                  <p className="font-medium text-gray-900">{classData.createdBy}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}

