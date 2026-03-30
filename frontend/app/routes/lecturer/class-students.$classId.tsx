import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { subjectService } from '~/services/subject.service';
import type { SubjectEnrollment } from '~/types/subject';
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
import { Breadcrumb } from '~/layouts/Breadcrumb';

export default function ClassStudentsPage() {
  const { classId } = useParams<{ classId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<SubjectEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState<string>('');

  useEffect(() => {
    const loadEnrolledStudents = async () => {
      if (!classId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Lấy tên môn học từ URL params
        const subjectFromUrl = searchParams.get('subject');
        if (subjectFromUrl) {
          setSubjectName(decodeURIComponent(subjectFromUrl));
        }

        // Tìm môn học theo tên để lấy subject_id
        // Nếu không tìm thấy, sẽ hiển thị danh sách trống
        const allSubjects = await subjectService.getAllSubjects();
        const subject = allSubjects.find(s =>
          s.tenMon === decodeURIComponent(subjectFromUrl || '') ||
          s.maMon === classId
        );

        if (!subject) {
          setError('Không tìm thấy thông tin môn học');
          setEnrollments([]);
          setIsLoading(false);
          return;
        }

        // Lấy danh sách sinh viên đã đăng ký môn học này
        // Sử dụng API getEnrolledStudents với pagination
        const response = await subjectService.getEnrolledStudents(subject.id, {
          per_page: 1000, // Lấy tất cả sinh viên
        });

        setEnrollments(response.data || []);
        setSubjectName(subject.tenMon);
      } catch (err) {
        console.error('Error loading enrolled students:', err);
        setError('Có lỗi xảy ra khi tải danh sách học viên');
        setEnrollments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEnrolledStudents();
  }, [classId, searchParams]);

  const handleBack = () => {
    navigate(-1);
  };

  // Table columns - hiển thị thông tin từ SubjectEnrollment
  const columns = useMemo(() => [
    {
      key: 'maHV',
      label: 'Mã học viên',
      render: (item: SubjectEnrollment) => (
        <div className="font-medium text-gray-900">{item.maHV}</div>
      ),
    },
    {
      key: 'hoTen',
      label: 'Họ và tên',
      render: (item: SubjectEnrollment) => (
        <div>
          <div className="font-medium text-gray-900">
            {item.student?.hoDem} {item.student?.ten}
          </div>
          {item.student?.email && (
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <EnvelopeIcon className="w-3 h-3" />
              {item.student.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'info',
      label: 'Thông tin cá nhân',
      render: (item: SubjectEnrollment) => (
        <div className="space-y-1 text-sm">
          {item.student?.ngaySinh && (
            <div className="flex items-center gap-1 text-gray-600">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <span>{formatters.formatDate(item.student.ngaySinh)}</span>
            </div>
          )}
          {item.student?.gioiTinh && (
            <div className="text-gray-600">
              <span className="text-gray-500">Giới tính:</span> {item.student.gioiTinh}
            </div>
          )}
          {item.student?.noiSinh && (
            <div className="flex items-center gap-1 text-gray-500">
              <MapPinIcon className="w-4 h-4 text-gray-400" />
              <span>{item.student.noiSinh}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Liên hệ',
      render: (item: SubjectEnrollment) => (
        <div className="space-y-1 text-sm">
          {item.student?.dienThoai && (
            <div className="flex items-center gap-1 text-gray-600">
              <PhoneIcon className="w-4 h-4 text-gray-400" />
              <span>{item.student.dienThoai}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (item: SubjectEnrollment) => {
        const statusColors: Record<string, 'info' | 'success' | 'danger'> = {
          DangHoc: 'info',
          DaHoanThanh: 'success',
          Huy: 'danger',
        };
        const statusLabels: Record<string, string> = {
          DangHoc: 'Đang học',
          DaHoanThanh: 'Đã hoàn thành',
          Huy: 'Đã hủy',
        };
        return (
          <Badge variant={statusColors[item.trangThai] || 'info'}>
            {statusLabels[item.trangThai] || item.trangThai}
          </Badge>
        );
      },
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
              Danh sách học viên đã đăng ký
            </h1>
            <p className="text-sm text-gray-500">
              {subjectName ? `Môn: ${subjectName}` : `Mã lớp: ${classId}`}
              {enrollments.length > 0 && ` • ${enrollments.length} học viên`}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {enrollments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tổng học viên</p>
                  <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    {enrollments.filter(e => e.trangThai === 'DangHoc').length}
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
                  <p className="text-sm text-gray-500">Đã hoàn thành</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrollments.filter(e => e.trangThai === 'DaHoanThanh').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <AcademicCapIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card>
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải danh sách học viên...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-red-500 text-lg mb-2">⚠️</div>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có học viên nào đăng ký môn học này</p>
              </div>
            </div>
          ) : (
            <Table
              columns={columns}
              data={enrollments}
              keyExtractor={(item) => item.id.toString()}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
