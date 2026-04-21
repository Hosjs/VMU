import { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Modal } from '~/components/ui/Modal';
import { courseService } from '~/services/course.service';
import { studentService } from '~/services/student.service';
import { roomService } from '~/services/room.service';
import type { Course } from '~/types/course';
import type { SelectOption } from '~/types/common';
import type { Room } from '~/types/room';
import { formatters } from '~/utils/formatters';

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classData: Room | null;
}

export function EditClassModal({ isOpen, onClose, onSuccess, classData }: EditClassModalProps) {
  const majorDropdownRef = useRef<HTMLDivElement>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [majors, setMajors] = useState<SelectOption[]>([]);
  const [filteredMajors, setFilteredMajors] = useState<SelectOption[]>([]);
  const [majorSearchQuery, setMajorSearchQuery] = useState('');
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  const [trinhDoOptions, setTrinhDoOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    class_name: '',
    major_id: '',
    khoaHoc_id: '',
    maTrinhDoDaoTao: '',
    phu_trach_lop: '',
    trangThai: 'active',
  });

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (classData && isOpen) {
      const majorIdStr = classData.major_id?.toString() || '';

      setFormData({
        class_name: classData.class_name || classData.tenLop || '',
        major_id: majorIdStr,
        khoaHoc_id: classData.khoaHoc_id?.toString() || classData.khoaHoc?.toString() || '',
        maTrinhDoDaoTao: classData.maTrinhDoDaoTao || '',
        phu_trach_lop: classData.phu_trach_lop || classData.lecturer_name || '',
        trangThai: classData.trangThai || 'active',
      });

      // Set search query to current major name
      if (majorIdStr && majors.length > 0) {
        const selectedMajor = majors.find(m => m.value === majorIdStr);
        if (selectedMajor) {
          setMajorSearchQuery(selectedMajor.label);
        }
      }
    }
  }, [classData, isOpen, majors]);

  // Filter majors based on search query
  useEffect(() => {
    if (majorSearchQuery.trim() === '') {
      setFilteredMajors(majors);
    } else {
      const query = majorSearchQuery.toLowerCase();
      const filtered = majors.filter(m =>
        m.label.toLowerCase().includes(query)
      );
      setFilteredMajors(filtered);
    }
  }, [majorSearchQuery, majors]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (majorDropdownRef.current && !majorDropdownRef.current.contains(event.target as Node)) {
        setShowMajorDropdown(false);
      }
    };

    if (showMajorDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMajorDropdown]);

  const loadOptions = async () => {
    try {
      setIsLoading(true);
      const [coursesData, majorsData, trinhDoData] = await Promise.all([
        courseService.getSimpleCourses(),
        studentService.getMajorsListWithId(),
        studentService.getTrinhDoList(),
      ]);

      setCourses(coursesData);
      setMajors(majorsData);
      setTrinhDoOptions(
        trinhDoData.map((t) => ({
          value: t.maTrinhDoDaoTao,
          label: t.tenTrinhDo,
        }))
      );
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const getCourseOptions = (): SelectOption[] => {
    return [
      { value: '', label: '-- Chọn năm học --' },
      ...courses.map((c) => ({
        value: c.id.toString(),
        label: `${formatters.courseCode(c)} (${formatters.courseCodeDetail(c)})`,
      })),
    ];
  };

  const getTrinhDoOptionsForSelect = (): SelectOption[] => {
    return [{ value: '', label: '-- Chọn trình độ --' }, ...trinhDoOptions];
  };

  const handleMajorSelect = (major: SelectOption) => {
    setFormData({ ...formData, major_id: major.value.toString() });
    setMajorSearchQuery(major.label);
    setShowMajorDropdown(false);
  };

  const handleMajorSearchChange = (value: string) => {
    setMajorSearchQuery(value);
    setShowMajorDropdown(true);

    // Clear selection if user is typing
    if (value !== majors.find(m => m.value === formData.major_id)?.label) {
      setFormData({ ...formData, major_id: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.class_name || !formData.major_id || !formData.khoaHoc_id || !formData.maTrinhDoDaoTao) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (!classData?.id) {
      setError('Không tìm thấy ID lớp học');
      return;
    }

    try {
      setIsLoading(true);

      await roomService.update(classData.id, {
        class_name: formData.class_name,
        major_id: formData.major_id as any,
        khoaHoc_id: formData.khoaHoc_id as any,
        maTrinhDoDaoTao: formData.maTrinhDoDaoTao,
        phu_trach_lop: formData.phu_trach_lop,
        trangThai: formData.trangThai,
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật lớp học');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!classData) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa lớp học</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên lớp */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên lớp <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.class_name}
                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                placeholder="Nhập tên lớp"
                required
              />
            </div>

            {/* Kỳ học */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kỳ học <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.khoaHoc_id}
                onChange={(e) => setFormData({ ...formData, khoaHoc_id: e.target.value })}
                options={getCourseOptions()}
                required
              />
            </div>

            {/* Ngành học - Autocomplete */}
            <div className="relative" ref={majorDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngành học <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={majorSearchQuery}
                onChange={(e) => handleMajorSearchChange(e.target.value)}
                onFocus={() => setShowMajorDropdown(true)}
                placeholder="Tìm kiếm ngành học..."
                required
                autoComplete="off"
              />

              {/* Dropdown */}
              {showMajorDropdown && filteredMajors.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredMajors.map((major) => (
                    <button
                      key={major.value}
                      type="button"
                      onClick={() => handleMajorSelect(major)}
                      className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                        formData.major_id === major.value ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {major.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Helper text */}
              {formData.major_id && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Đã chọn: {majors.find(m => m.value === formData.major_id)?.label}
                </p>
              )}
            </div>

            {/* Trình độ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trình độ <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.maTrinhDoDaoTao}
                onChange={(e) => setFormData({ ...formData, maTrinhDoDaoTao: e.target.value })}
                options={getTrinhDoOptionsForSelect()}
                required
              />
            </div>

            {/* Phụ trách lớp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phụ trách lớp
              </label>
              <Select
                value={formData.phu_trach_lop}
                onChange={(e) => setFormData({ ...formData, phu_trach_lop: e.target.value })}
                options={[
                  { value: '', label: '-- Chọn phụ trách lớp --' },
                  { value: 'Lê Thành Lự', label: 'Lê Thành Lự' },
                  { value: 'Đồng Phương Thanh', label: 'Đồng Phương Thanh' },
                  { value: 'Đỗ Tất Mạnh', label: 'Đỗ Tất Mạnh' },
                ]}
              />
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <Select
                value={formData.trangThai}
                onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                options={[
                  { value: 'active', label: 'Đang hoạt động' },
                  { value: 'inactive', label: 'Không hoạt động' },
                  { value: 'completed', label: 'Đã hoàn thành' },
                ]}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}











