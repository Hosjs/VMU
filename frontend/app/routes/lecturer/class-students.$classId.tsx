import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { classStudentService } from '~/services/class-student.service';
import type { ClassStudent } from '~/types/class-student';
import { formatters } from '~/utils/formatters';
import {
  UserGroupIcon,
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Card } from '~/components/ui/Card';
import { Table } from '~/components/ui/Table';
import { Badge } from '~/components/ui/Badge';

export function meta() {
  return [
    { title: "Danh sách học viên - VMU Training" },
    { name: "description", content: "Xem danh sách học viên trong lớp" },
  ];
}

export default function ClassStudentsPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [className, setClassName] = useState<string>('');

  useEffect(() => {
    const loadStudents = async () => {
      if (!classId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await classStudentService.getStudentsByClassId(classId);

        console.log('Service response:', response); // Debug log
        console.log('Response success:', response.success);
        console.log('Response data length:', response.data?.length);

        if (response.success) {
          console.log('Setting students:', response.data);
          setStudents(response.data);
          // Get class name from response.lop or first student
          if (response.lop?.tenLop) {
            setClassName(response.lop.tenLop);
          } else if (response.data.length > 0 && response.data[0].tenLop) {
            setClassName(response.data[0].tenLop);
          }
        } else {
          console.error('Response success is false:', response.message);
          setError(response.message || 'Không thể tải danh sách học viên');
        }
      } catch (err) {
        console.error('Error loading students:', err);
        setError('Có lỗi xảy ra khi tải danh sách học viên');
      } finally {
        setIsLoading(false);
      }
    };

    loadStudents();
  }, [classId]);

  const handleBack = () => {
    navigate(-1);
  };

  // Table columns
  const columns = useMemo(() => [
    {
      key: 'mahv',
      label: 'Mã học viên',
      render: (item: ClassStudent) => (
        <div className="font-medium text-gray-900">{item.mahv}</div>
      ),
    },
    {
      key: 'hoTen',
      label: 'Họ và tên',
      render: (item: ClassStudent) => (
        <div>
          <div className="font-medium text-gray-900">{`${item.hodem} ${item.ten}`}</div>
          {item.email && (
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <EnvelopeIcon className="w-3 h-3" />
              {item.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'info',
      label: 'Thông tin cá nhân',
      render: (item: ClassStudent) => (
        <div className="space-y-1 text-sm">
          {item.ngaysinh && (
            <div className="flex items-center gap-1 text-gray-600">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <span>{formatters.formatDate(item.ngaysinh)}</span>
            </div>
          )}
          {item.gioitinh && (
            <div className="text-gray-600">
              <span className="text-gray-500">Giới tính:</span> {item.gioitinh}
            </div>
          )}
          {item.noisinh && (
            <div className="flex items-center gap-1 text-gray-500">
              <MapPinIcon className="w-4 h-4 text-gray-400" />
              <span>{item.noisinh}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Liên hệ',
      render: (item: ClassStudent) => (
        <div className="space-y-1 text-sm">
          {item.dienthoai && (
            <div className="flex items-center gap-1 text-gray-600">
              <PhoneIcon className="w-4 h-4 text-gray-400" />
              <span>{item.dienthoai}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'scores',
      label: 'Điểm',
      render: (item: ClassStudent) => (
        <div className="space-y-1 text-sm">
          {(item.diemX !== undefined || item.diemY !== undefined) ? (
            <>
              {item.diemX !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Điểm X:</span>
                  <span className="font-medium text-blue-600">{item.diemX}</span>
                </div>
              )}
              {item.diemY !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Điểm Y:</span>
                  <span className="font-medium text-green-600">{item.diemY}</span>
                </div>
              )}
            </>
          ) : (
            <span className="text-gray-400">Chưa có điểm</span>
          )}
        </div>
      ),
    },
  ], []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mr-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Danh sách học viên
            </h1>
            <p className="text-sm text-gray-500">
              {className ? `Lớp: ${className}` : `Mã lớp: ${classId}`}
              {students.length > 0 && ` • ${students.length} học viên`}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tổng học viên</p>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Đang học</p>
                  <p className="text-2xl font-bold text-green-600">
                    {students.filter(s => s.trangThai === 'Đang học').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <AcademicCapIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Mã lớp</p>
                  <p className="text-2xl font-bold text-gray-900">{classId}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Students Table */}
      <Card>
        <div className="p-6">
          {error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-2">⚠️ {error}</div>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            </div>
          ) : (
            <Table
              columns={columns}
              data={students}
              isLoading={isLoading}
              emptyMessage="Không có học viên nào trong lớp này"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
