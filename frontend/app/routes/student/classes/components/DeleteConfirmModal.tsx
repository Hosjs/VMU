import { useState } from 'react';
import { ExclamationTriangleIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { roomService } from '~/services/room.service';
import type { Room } from '~/types/room';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classData: Room | null;
}

export function DeleteConfirmModal({ isOpen, onClose, onSuccess, classData }: DeleteConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');

  const handleDelete = async () => {
    if (!classData?.id) {
      setError('Không tìm thấy ID lớp học');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (deleteType === 'soft') {
        await roomService.delete(classData.id);
      } else {
        await roomService.forceDelete(classData.id);
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Không thể xóa lớp học');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setDeleteType('soft');
    onClose();
  };

  if (!classData) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa lớp học</h2>
            <p className="text-gray-600">
              Bạn có chắc chắn muốn xóa lớp học{' '}
              <strong className="text-gray-900">
                {classData.class_name || classData.tenLop}
              </strong>
              ?
            </p>
          </div>
        </div>

        {/* Delete Type Selection */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Chọn loại xóa:
          </label>
          <div className="space-y-3">
            {/* Soft Delete */}
            <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-white transition-colors">
              <input
                type="radio"
                name="deleteType"
                value="soft"
                checked={deleteType === 'soft'}
                onChange={(e) => setDeleteType(e.target.value as 'soft')}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Xóa mềm (Soft Delete)</div>
                <p className="text-sm text-gray-600 mt-1">
                  Lớp học sẽ được đánh dấu đã xóa nhưng vẫn lưu trong database. Có thể khôi phục lại sau này.
                </p>
              </div>
            </label>

            {/* Hard Delete */}
            <label className="flex items-start gap-3 p-3 border-2 border-red-200 rounded-lg cursor-pointer hover:bg-red-50 transition-colors">
              <input
                type="radio"
                name="deleteType"
                value="hard"
                checked={deleteType === 'hard'}
                onChange={(e) => setDeleteType(e.target.value as 'hard')}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="font-medium text-red-600">Xóa cứng (Hard Delete)</div>
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ Xóa vĩnh viễn khỏi database. KHÔNG THỂ khôi phục lại. Chỉ được phép nếu lớp chưa có học viên.
                </p>
              </div>
            </label>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Warning Message */}
        {deleteType === 'hard' && (
          <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <strong>CẢNH BÁO:</strong> Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn khỏi hệ thống.
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            <XMarkIcon className="w-4 h-4 mr-1" />
            Hủy
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={isLoading}
          >
            <TrashIcon className="w-4 h-4 mr-1" />
            {isLoading
              ? 'Đang xóa...'
              : deleteType === 'soft'
                ? 'Xóa mềm'
                : 'Xóa vĩnh viễn'
            }
          </Button>
        </div>
      </div>
    </Modal>
  );
}

