import { useState, useMemo } from 'react';
import { trainingService } from '~/services/training.service';
import { majorService } from '~/services/major.service';
import { useAsync } from '~/hooks/useAsync';
import { useForm } from '~/hooks/useForm';
import type { TrainingPlanFormData, TrainingCourse } from '~/types/training';
import type { Major } from '~/types/major';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Table } from '~/components/ui/Table';

export function meta() {
  return [
    { title: "Kế hoạch học tập - VMU Training" },
    { name: "description", content: "Xem kế hoạch học tập theo ngành và năm" },
  ];
}

export default function StudyPlansPage() {
  const [trainingData, setTrainingData] = useState<TrainingCourse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Sử dụng useForm hook để quản lý form
  const form = useForm<TrainingPlanFormData>({
    initialValues: {
      education_type: 'thac-sy',
      nam_vao: new Date().getFullYear(),
      ma_nganh: ''
    },
    onSubmit: async (values) => {
      if (!values.ma_nganh) {
        form.setFieldError('ma_nganh', 'Vui lòng chọn mã ngành');
        return;
      }
      await trainingPlanAsync.execute();
    },
  });

  // Load education types
  const educationTypesAsync = useAsync(
    () => trainingService.getEducationTypes(),
    { immediate: true }
  );

  // Load available years
  const yearsAsync = useAsync(
    () => trainingService.getAvailableYears(),
    { immediate: true }
  );

  // Load majors for dropdown
  const majorsAsync = useAsync(
    () => majorService.getAllMajors(),
    { immediate: true }
  );

  // Load training plan
  const trainingPlanAsync = useAsync(
    () => trainingService.getStudyPlans(form.values),
    {
      immediate: false,
      onSuccess: (response) => {
        if (response && Array.isArray(response.data)) {
          setTrainingData(response.data);

          // Thông báo nếu không có dữ liệu
          if (response.data.length === 0) {
            console.warn('⚠️ API trả về thành công nhưng không có dữ liệu!');
            console.warn('⚠️ Có thể ngành này chưa có kế hoạch học tập cho năm đã chọn');
          }
        } else if (response && response.success && Array.isArray(response.data)) {
          setTrainingData(response.data);
        } else {
          console.warn('⚠️ Response format unexpected:', response);
          setTrainingData([]);
        }
      },
      onError: (error) => {
        console.error('❌ Error loading study plans:', error);
        setTrainingData([]);
      }
    }
  );

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return trainingData;

    const search = searchTerm.toLowerCase();
    return trainingData.filter((course: TrainingCourse) => {
      const maMonHoc = (
        (course.hocPhanSo?.toString() || '') + ' ' +
        (course.hocPhanChu || '') + ' ' +
        (course.maHocPhan || '') + ' ' +
        (course.maMonHoc || '')
      ).toLowerCase();

      const tenMonHoc = (
        (course.tenMon || '') + ' ' +
        (course.tenMonHoc || '') + ' ' +
        (course.tenHocPhan || '')
      ).toLowerCase();

      return maMonHoc.includes(search) || tenMonHoc.includes(search);
    });
  }, [trainingData, searchTerm]);

  // Group courses by semester/year
  const groupedCourses = useMemo(() => {
    const groups: Record<string, TrainingCourse[]> = {};

    filteredData.forEach((course) => {
      const key = `Học kỳ ${course.hocKy || 'N/A'} - Năm ${course.namHoc || course.khoaHoc || 'N/A'}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(course);
    });

    return groups;
  }, [filteredData]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalCourses = trainingData.length;
    const totalCredits = trainingData.reduce((sum, course) => {
      const tinChi = course.soTinChi || course.tinChi || 0;
      return sum + tinChi;
    }, 0);
    const requiredCourses = trainingData.filter(c => c.batBuoc || c.loai === 'BB').length;
    const optionalCourses = trainingData.filter(c => c.tuChon || c.loai === 'TC').length;

    return { totalCourses, totalCredits, requiredCourses, optionalCourses };
  }, [trainingData]);

  const columns = useMemo(() => [
    {
      key: 'stt',
      label: 'STT',
      width: '60px',
      render: (_: TrainingCourse, index: number) => (
        <span className="text-gray-900 font-medium">{index + 1}</span>
      ),
    },
    {
      key: 'maMonHoc',
      label: 'Mã học phần',
      width: '140px',
      render: (item: TrainingCourse) => {
        const maHocPhan = item.hocPhanSo || item.maHocPhan || item.maMonHoc;
        const chuHocPhan = item.hocPhanChu;

        return (
          <div className="font-semibold text-blue-600">
            <div>{maHocPhan || '-'}</div>
            {chuHocPhan && (
              <div className="text-xs text-gray-500">{chuHocPhan}</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'tenMonHoc',
      label: 'Tên học phần',
      render: (item: TrainingCourse) => {
        const tenMon = item.tenMon || item.tenMonHoc || item.tenHocPhan;

        return (
          <div>
            <div className="font-medium text-gray-900">
              {tenMon || '-'}
            </div>
            {item.ghiChu && (
              <div className="text-xs text-gray-500 mt-1">{item.ghiChu}</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'soTinChi',
      label: 'Số tín chỉ',
      width: '100px',
      render: (item: TrainingCourse) => {
        const tinChi = item.soTinChi || item.tinChi || 0;

        return (
          <div className="text-center">
            <Badge variant="info">{tinChi}</Badge>
          </div>
        );
      },
    },
    {
      key: 'hocKy',
      label: 'Học kỳ',
      width: '100px',
      render: (item: TrainingCourse) => (
        <div className="text-center text-gray-700">
          {item.hocKy ? `HK ${item.hocKy}` : '-'}
        </div>
      ),
    },
    {
      key: 'namHoc',
      label: 'Năm học',
      width: '100px',
      render: (item: TrainingCourse) => {
        const nam = item.namHoc || item.khoaHoc || item.khoaHoc2;

        return (
          <div className="text-center text-gray-700">
            {nam || '-'}
          </div>
        );
      },
    },
    {
      key: 'type',
      label: 'Loại',
      width: '120px',
      render: (item: TrainingCourse) => (
        <div className="flex justify-center gap-1">
          {(item.batBuoc || item.loai === 'BB') && (
            <Badge variant="success">
              <CheckCircleIcon className="w-3 h-3 mr-1" />
              Bắt buộc
            </Badge>
          )}
          {(item.tuChon || item.loai === 'TC') && (
            <Badge variant="warning">
              <XCircleIcon className="w-3 h-3 mr-1" />
              Tự chọn
            </Badge>
          )}
        </div>
      ),
    },
  ], []);

  // Filter majors based on education type
  const filteredMajors = useMemo(() => {
    if (!majorsAsync.data) return [];

    const majors = majorsAsync.data as Major[];

    if (form.values.education_type === 'thac-sy') {
      return majors.filter(m => m.ma?.startsWith('8'));
    } else if (form.values.education_type === 'tien-sy') {
      return majors.filter(m => m.ma?.startsWith('9') || m.ma?.startsWith('6'));
    }

    return majors;
  }, [majorsAsync.data, form.values.education_type]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kế hoạch học tập</h1>
            <p className="text-sm text-gray-500">Xem kế hoạch học tập chi tiết theo ngành và năm tuyển sinh</p>
          </div>
        </div>
      </div>

      {/* Search Form - Sử dụng useForm */}
      <Card>
        <form onSubmit={form.handleSubmit} className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tìm kiếm kế hoạch học tập</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Education Type */}
            <div>
              <Select
                label="Loại hình đào tạo"
                value={form.values.education_type}
                onChange={(e) => {
                  form.setFieldValue('education_type', e.target.value as 'thac-sy' | 'tien-sy');
                  form.setFieldValue('ma_nganh', ''); // Reset major
                }}
                options={educationTypesAsync.data?.map(type => ({
                  value: type.key,
                  label: type.label
                }))}
              />
            </div>

            {/* Admission Year */}
            <div>
              <Select
                label="Năm vào"
                value={form.values.nam_vao.toString()}
                onChange={(e) => form.setFieldValue('nam_vao', parseInt(e.target.value))}
                options={yearsAsync.data?.map(year => ({
                  value: year.value.toString(),
                  label: year.label
                }))}
              />
            </div>

            {/* Major Code */}
            <div>
              <Select
                label="Mã ngành"
                value={form.values.ma_nganh}
                onChange={(e) => form.setFieldValue('ma_nganh', e.target.value)}
                error={form.errors.ma_nganh}
              >
                <option value="">-- Chọn ngành --</option>
                {filteredMajors.map((major) => (
                  <option key={major.id} value={major.ma}>
                    {major.ma} - {major.tenNganhHoc}
                  </option>
                ))}
              </Select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={trainingPlanAsync.isLoading || form.isSubmitting}
                disabled={!form.values.ma_nganh}
                className="w-full"
              >
                <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                Tìm kiếm
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Statistics */}
      {trainingData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{statistics.totalCourses}</div>
              <div className="text-sm text-gray-600 mt-1">Tổng số môn học</div>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{statistics.totalCredits}</div>
              <div className="text-sm text-gray-600 mt-1">Tổng số tín chỉ</div>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{statistics.requiredCourses}</div>
              <div className="text-sm text-gray-600 mt-1">Môn bắt buộc</div>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">{statistics.optionalCourses}</div>
              <div className="text-sm text-gray-600 mt-1">Môn tự chọn</div>
            </div>
          </Card>
        </div>
      )}

      {/* Results Table */}
      {trainingData.length > 0 && (
        <Card>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Danh sách môn học ({filteredData.length})
              </h3>
              <div className="w-64">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm môn học..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Grouped by Semester */}
            <div className="space-y-6">
              {Object.keys(groupedCourses).length > 0 ? (
                Object.entries(groupedCourses).map(([groupKey, courses]) => (
                  <div key={groupKey}>
                    <div className="bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-2 rounded-lg mb-2">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <AcademicCapIcon className="w-5 h-5" />
                        {groupKey}
                        <span className="text-sm font-normal text-gray-600">
                          ({courses.length} môn - {courses.reduce((sum, c) => sum + (c.soTinChi || c.tinChi || 0), 0)} tín chỉ)
                        </span>
                      </h4>
                    </div>
                    <Table
                      columns={columns}
                      data={courses}
                      isLoading={false}
                      emptyMessage="Không có dữ liệu"
                    />
                  </div>
                ))
              ) : (
                <Table
                  columns={columns}
                  data={filteredData}
                  isLoading={trainingPlanAsync.isLoading}
                  emptyMessage="Không có dữ liệu"
                />
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!trainingPlanAsync.isLoading && trainingData.length === 0 && trainingPlanAsync.data && (
        <Card>
          <div className="p-12 text-center">
            <ClipboardDocumentListIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy dữ liệu</h3>
            <p className="text-gray-500">
              Không có kế hoạch học tập cho ngành và năm đã chọn.
            </p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {trainingPlanAsync.error && (
        <Card>
          <div className="p-12 text-center">
            <XCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Có lỗi xảy ra</h3>
            <p className="text-gray-500 mb-4">
              {trainingPlanAsync.error.message || 'Không thể tải dữ liệu kế hoạch học tập'}
            </p>
            <Button onClick={() => form.handleSubmit()} variant="primary">
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Thử lại
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
