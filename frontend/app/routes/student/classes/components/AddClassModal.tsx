import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Select } from '~/components/ui/Select';
import { Modal } from '~/components/ui/Modal';
import { courseService } from '~/services/course.service';
import { studentService } from '~/services/student.service';
import type { Course } from '~/types/course';
import type { SelectOption } from '~/types/common';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ClassForm {
  id: string; // unique id for form management
  khoa_hoc_id: number | '';
  major_id: number | '';
  trinh_do: string;
  phu_trach_lop: string; // Phụ trách lớp
  class_name?: string; // preview tên lớp
}

export function AddClassModal({ isOpen, onClose, onSuccess }: AddClassModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [majors, setMajors] = useState<SelectOption[]>([]);
  const [trinhDoOptions, setTrinhDoOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Support multiple class forms
  const [classForms, setClassForms] = useState<ClassForm[]>([
    {
      id: '1',
      khoa_hoc_id: '',
      major_id: '',
      trinh_do: '',
      phu_trach_lop: '',
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  const loadOptions = async () => {
    try {
      setIsLoading(true);
      const [coursesData, majorsData, trinhDoData] = await Promise.all([
        courseService.getSimpleCourses(),
        studentService.getMajorsListWithId(), // ✅ Use getMajorsListWithId() to get id instead of maNganh
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
      { value: '', label: '-- Chọn kỳ học --' },
      ...courses.map((c) => ({
        value: c.id.toString(),
        label: `${c.ma_khoa_hoc} (${c.nam_hoc} - HK${c.hoc_ky} - Đợt ${c.dot})`,
      })),
    ];
  };

  const getMajorOptions = (): SelectOption[] => {
    return [{ value: '', label: '-- Chọn ngành học --' }, ...majors];
  };

  const getTrinhDoOptionsForSelect = (): SelectOption[] => {
    return [{ value: '', label: '-- Chọn trình độ --' }, ...trinhDoOptions];
  };

  // Generate class name preview
  const generateClassName = (form: ClassForm): string => {
    if (!form.khoa_hoc_id || !form.major_id) return '';

    const course = courses.find((c) => c.id === Number(form.khoa_hoc_id));
    const major = majors.find((m) => m.value === form.major_id.toString());

    if (!course || !major) return '';

    // Format: {MajorCode} {ma_khoa_hoc}
    // Example: CNTT 2025.1.1
    // major.label format: "CNTT - Công nghệ thông tin"
    const majorCode = major.label.split(' - ')[0]?.trim() || major.value;
    return `${majorCode} ${course.ma_khoa_hoc}`;
  };

  const updateForm = (id: string, field: keyof ClassForm, value: any) => {
    setClassForms((prev) =>
      prev.map((form) => {
        if (form.id === id) {
          const updated = { ...form, [field]: value };
          // Auto-generate class name
          if (field === 'khoa_hoc_id' || field === 'major_id') {
            updated.class_name = generateClassName(updated);
          }
          return updated;
        }
        return form;
      })
    );
  };

  const addNewForm = () => {
    const newId = (Math.max(...classForms.map((f) => Number(f.id))) + 1).toString();
    setClassForms([
      ...classForms,
      {
        id: newId,
        khoa_hoc_id: '',
        major_id: '',
        trinh_do: '',
        phu_trach_lop: '',
      },
    ]);
  };

  const removeForm = (id: string) => {
    if (classForms.length === 1) return;
    setClassForms((prev) => prev.filter((form) => form.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all forms
    const invalidForms = classForms.filter(
      (form) => !form.khoa_hoc_id || !form.major_id || !form.trinh_do || !form.phu_trach_lop
    );

    if (invalidForms.length > 0) {
      setError('Vui lòng điền đầy đủ thông tin cho tất cả các lớp');
      return;
    }

    try {
      setIsLoading(true);

      // Use bulk endpoint for better performance (1 request instead of N requests)
      const classesData = classForms.map((form) => ({
        khoa_hoc_id: Number(form.khoa_hoc_id),
        major_id: Number(form.major_id),
        trinh_do: form.trinh_do,
        phu_trach_lop: form.phu_trach_lop,
      }));

      const result = await courseService.createClassBulk(classesData);

      const successCount = result.success.length;
      const failedCount = result.failed.length;

      if (successCount > 0) {
        onSuccess();
        if (failedCount === 0) {
          handleClose();
        } else {
          // Show detailed error for failed classes
          const failedMessages = result.failed
            .map((f) => `${f.class_name || 'Unknown'}: ${f.reason}`)
            .join(', ');
          setError(`Tạo thành công ${successCount} lớp, thất bại ${failedCount} lớp. Chi tiết: ${failedMessages}`);
        }
      } else {
        setError('Không thể tạo lớp. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tạo lớp');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setClassForms([
      {
        id: '1',
        khoa_hoc_id: '',
        major_id: '',
        trinh_do: '',
        phu_trach_lop: '',
      },
    ]);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Thêm lớp học</h2>
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
          {/* Instruction */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Bạn có thể thêm nhiều lớp cùng lúc bằng cách nhấn nút "Thêm
              lớp mới" bên dưới. Tên lớp sẽ được tự động tạo theo format:{' '}
              <code className="bg-blue-100 px-2 py-1 rounded">Mã ngành Mã kỳ học</code>
            </p>
          </div>

          {/* Class Forms */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {classForms.map((form, index) => (
              <div
                key={form.id}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Lớp #{index + 1}</h3>
                  {classForms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeForm(form.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Kỳ học */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kỳ học <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={form.khoa_hoc_id.toString()}
                      onChange={(e) =>
                        updateForm(form.id, 'khoa_hoc_id', Number(e.target.value) || '')
                      }
                      options={getCourseOptions()}
                      required
                    />
                  </div>

                  {/* Ngành học */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngành học <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={form.major_id.toString()}
                      onChange={(e) =>
                        updateForm(form.id, 'major_id', Number(e.target.value) || '')
                      }
                      options={getMajorOptions()}
                      required
                    />
                  </div>

                  {/* Trình độ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trình độ <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={form.trinh_do}
                      onChange={(e) => updateForm(form.id, 'trinh_do', e.target.value)}
                      options={getTrinhDoOptionsForSelect()}
                      required
                    />
                  </div>

                  {/* Phụ trách lớp */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phụ trách lớp <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={form.phu_trach_lop}
                      onChange={(e) => updateForm(form.id, 'phu_trach_lop', e.target.value)}
                      options={[
                        { value: '', label: '-- Chọn phụ trách lớp --' },
                        { value: 'Lê Thành Lự', label: 'Lê Thành Lự' },
                        { value: 'Đồng Phương Thanh', label: 'Đồng Phương Thanh' },
                        { value: 'Đỗ Tất Mạnh', label: 'Đỗ Tất Mạnh' },
                      ]}
                      required
                    />
                  </div>
                </div>

                {/* Preview tên lớp */}
                {form.class_name && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800">
                      <strong>Tên lớp:</strong>{' '}
                      <code className="bg-green-100 px-2 py-1 rounded font-semibold">
                        {form.class_name}
                      </code>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add New Form Button */}
          <div className="flex justify-center">
            <Button type="button" variant="secondary" onClick={addNewForm}>
              <PlusIcon className="w-5 h-5 mr-2" />
              Thêm lớp mới
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Đang tạo...' : `Tạo ${classForms.length} lớp`}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}





