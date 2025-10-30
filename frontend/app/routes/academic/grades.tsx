import { useState, useMemo } from 'react';
import { gradeService } from '~/services/grade.service';
import { studentService } from '~/services/student.service';
import { adaptGradeApi } from '~/types/grade';
import type { Student } from '~/types/student';
import type { Grade } from '~/types/grade';
import {
  AcademicCapIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Table } from '~/components/ui/Table';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';

export function meta() {
  return [
    { title: "Tra cứu điểm học tập - VMU Training" },
    { name: "description", content: "Tra cứu điểm học tập của học viên theo mã học viên" },
  ];
}

export default function GradesPage() {
  const [maHV, setMaHV] = useState('');
  const [searchedMaHV, setSearchedMaHV] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!maHV) {
      setError('Vui lòng nhập mã học viên.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setStudent(null);
    setGrades([]);
    setSearchedMaHV(maHV);

    try {
      const [studentData, gradesData] = await Promise.all([
        studentService.getStudentByCode(maHV),
        gradeService.getGrades(maHV),
      ]);

      setStudent(studentData);
      setGrades(Array.isArray(gradesData) ? gradesData.map(adaptGradeApi) : []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Không tìm thấy thông tin cho mã học viên "${maHV}". Vui lòng kiểm tra lại.`);
      setStudent(null);
      setGrades([]);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo(() => [
    {
      key: 'stt',
      label: 'STT',
      width: '60px',
      render: (_: Grade, index: number) => (
        <span className="text-gray-900 font-medium">
          {index + 1}
        </span>
      ),
    },
    {
      key: 'TenMonHoc',
      label: 'Tên môn học',
      render: (item: Grade) => (
        <div>
          <div className="font-semibold text-gray-900">{item.tenMon}</div>
          <div className="text-xs text-gray-500">Mã MH: {item.tenMon}</div>
        </div>
      ),
    },
    {
      key: 'SoTinChi',
      label: 'Số tín chỉ',
      width: '100px',
      render: (item: Grade) => (
        <span className="text-center block">{item.soTinChiThucHoc}</span>
      ),
    },
    {
      key: 'Diem',
      label: 'Điểm',
      width: '100px',
      render: (item: Grade) => (
        <Badge variant={item.diem >= 5 ? 'success' : 'danger'}>
          {typeof item.diem === 'number' && !isNaN(item.diem) ? item.diem.toFixed(2) : '0.00'}
        </Badge>
      ),
    },
    {
      key: 'DiemHe4',
      label: 'Điểm hệ 4',
      width: '120px',
      render: (item: Grade) => (
         <span className="font-medium">{typeof item.DiemHe4 === 'number' && !isNaN(item.DiemHe4) ? item.DiemHe4.toFixed(2) : '0.00'}</span>
      ),
    },
    {
      key: 'GhiChu',
      label: 'Ghi chú',
      render: (item: Grade) => (
        <span className="text-sm text-gray-700">{item.GhiChu || '-'}</span>
      ),
    },
  ], []);

  const summary = useMemo(() => {
    if (grades.length === 0) {
      return { totalCredits: 0, gpa: 0, gpa4: 0 };
    }
    const totalCredits = grades.reduce((sum, grade) => sum + grade.soTinChiThucHoc, 0);
    const totalScore = grades.reduce((sum, grade) => sum + (grade.diem * grade.soTinChiThucHoc), 0);
    const totalScore4 = grades.reduce((sum, grade) => sum + (grade.DiemHe4 * grade.soTinChiThucHoc), 0);

    return {
      totalCredits,
      gpa: totalCredits > 0 ? totalScore / totalCredits : 0,
      gpa4: totalCredits > 0 ? totalScore4 / totalCredits : 0,
    };
  }, [grades]);


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <AcademicCapIcon className="w-8 h-8 text-blue-600" />
            Tra cứu điểm học tập
          </h1>
          <p className="text-gray-600 mt-1">
            Xem chi tiết bảng điểm của học viên theo mã học viên
          </p>
        </div>
         <Button
          variant="outline"
          onClick={handleSearch}
          disabled={isLoading || !maHV}
        >
          <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Search Card */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <MagnifyingGlassIcon className="w-5 h-5" />
            <span>Tìm kiếm học viên</span>
          </div>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Input
                label="Mã học viên"
                placeholder="Nhập mã học viên, ví dụ: DA2211001"
                value={maHV}
                onChange={(e) => setMaHV(e.target.value.trim())}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Đang tìm...' : 'Xem kết quả'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Result Area */}
      {error && (
        <Card>
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Đã xảy ra lỗi
            </h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </Card>
      )}

      {!error && student && (
        <>
          {/* Student Info Card */}
          <Card>
            <div className="flex items-start gap-4">
              <UserCircleIcon className="w-12 h-12 text-gray-400" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{`${student.hoDem} ${student.ten}`}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-2 text-sm">
                  <p><span className="font-semibold">Mã HV:</span> {student.maHV}</p>
                  <p><span className="font-semibold">Ngày sinh:</span> {new Date(student.ngaySinh).toLocaleDateString('vi-VN')}</p>
                  <p><span className="font-semibold">Giới tính:</span> {student.gioiTinh}</p>
                  <p><span className="font-semibold">Email:</span> {student.email}</p>
                  <p><span className="font-semibold">Điện thoại:</span> {student.dienThoai}</p>
                  <p><span className="font-semibold">Trạng thái:</span> <Badge variant="success">{student.trangThaiHoc}</Badge></p>
                </div>
              </div>
            </div>
          </Card>

          {/* Summary Card */}
          <Card>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-sm text-gray-600">Tổng số tín chỉ tích lũy</div>
                    <div className="text-2xl font-bold text-gray-900">{summary.totalCredits}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-600">Điểm trung bình hệ 10</div>
                    <div className="text-2xl font-bold text-blue-600">{summary.gpa.toFixed(2)}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-600">Điểm trung bình hệ 4</div>
                    <div className="text-2xl font-bold text-green-600">{summary.gpa4.toFixed(2)}</div>
                </div>
             </div>
          </Card>

          {/* Grades Table Card */}
          <Card>
            <Table
              columns={columns}
              data={grades}
              isLoading={isLoading}
              emptyMessage="Không tìm thấy điểm học tập cho học viên này."
            />
          </Card>
        </>
      )}

      {!isLoading && !error && !student && searchedMaHV === '' && (
         <Card>
            <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                Bắt đầu tra cứu
                </h3>
                <p className="text-gray-600">
                Nhập mã học viên vào ô ở trên và nhấn "Xem kết quả" để xem bảng điểm.
                </p>
            </div>
        </Card>
      )}
    </div>
  );
}
