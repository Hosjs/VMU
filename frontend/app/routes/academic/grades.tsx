import { useState, useEffect } from 'react';
import { gradeService } from '~/services/grade.service';
import type { ExternalGradeData } from '~/services/grade.service';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { Badge } from '~/components/ui/Badge';
import { Autocomplete } from '~/components/ui/Autocomplete';
import type { AutocompleteOption } from '~/components/ui/Autocomplete';
import {
  MagnifyingGlassIcon,
  AcademicCapIcon,
  XCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '~/contexts/AuthContext';

export function meta() {
  return [
    { title: "Tra cứu Điểm - VMU" },
    { name: "description", content: "Tra cứu điểm học tập của học viên" },
  ];
}

export default function GradesPage() {
  // Auth context to check user role
  const { user } = useAuth();
  const isStudent = user?.role?.name === 'student';
  const userMaHV = (user as any)?.username || (user as any)?.maHV || user?.email?.split('@')[0];

  // State
  const [searchMaHV, setSearchMaHV] = useState('');
  const [studentOptions, setStudentOptions] = useState<AutocompleteOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [grades, setGrades] = useState<ExternalGradeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);


  // Auto-fill maHV for students
  useEffect(() => {
    if (isStudent && userMaHV) {
      setSearchMaHV(userMaHV);
      // Auto search for student on mount
      handleSearch(userMaHV);
    }
  }, [isStudent, userMaHV]);

  // Load student options for autocomplete (admin/teacher only)
  useEffect(() => {
    if (!isStudent) {
      loadStudentOptions();
    }
  }, [isStudent]);

  const loadStudentOptions = async () => {
    setLoadingOptions(true);
    try {
      const students = await gradeService.searchStudents('', 100); // Load first 100
      const options: AutocompleteOption[] = students.map(student => ({
        value: student.maHV,
        label: `${student.maHV} - ${student.hoTen}`,
        subtitle: student.email + (student.tenNganh ? ` • ${student.tenNganh}` : ''),
        searchText: `${student.maHV} ${student.hoTen} ${student.email} ${student.maNganh || ''}`,
      }));
      setStudentOptions(options);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSearch = async (maHV?: string) => {
    const searchValue = maHV || searchMaHV.trim();

    if (!searchValue) {
      setError('Vui lòng nhập mã học viên');
      return;
    }

    // Security: Students can only search their own grades
    if (isStudent && userMaHV && searchValue !== userMaHV) {
      setError('Bạn chỉ có thể xem điểm của chính mình');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await gradeService.getGradesByMaHV(searchValue);
      setGrades(data);

      if (data.length === 0) {
        setError('Không tìm thấy điểm cho học viên này');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tra cứu điểm');
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };


  // Calculate statistics
  const stats = {
    total: grades.length,
    passed: grades.filter(g => (g.diem || 0) >= 5).length,
    failed: grades.filter(g => (g.diem || 0) < 5 && g.diem !== null).length,
    average: grades.length > 0
      ? grades.reduce((sum, g) => sum + (g.diem || 0), 0) / grades.length
      : 0,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <AcademicCapIcon className="h-8 w-8 text-blue-600" />
          Tra cứu Điểm
        </h1>
        <p className="text-gray-600 mt-2">
          {isStudent
            ? 'Xem điểm học tập của bạn'
            : 'Tra cứu điểm học tập của học viên theo mã học viên'}
        </p>
      </div>

      {/* Notice for students */}
      {isStudent && (
        <Card className="mb-6 border-l-4 border-blue-500">
          <div className="p-4 flex items-start gap-3">
            <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Thông báo</p>
              <p className="text-sm text-blue-700 mt-1">
                Bạn chỉ có thể xem điểm của chính mình. Mã học viên của bạn: <strong>{userMaHV}</strong>
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Search Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
          Tìm kiếm
        </h2>

        {/* Search Form - Outside Card to allow dropdown overflow */}
        <div className="bg-white shadow rounded-lg p-6 mb-4">
          <div className="flex gap-3 items-end">
            {isStudent ? (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã học viên
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                  <div className="font-medium text-gray-900">{userMaHV}</div>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <Autocomplete
                  label="Chọn học viên"
                  placeholder="Tìm kiếm theo mã HV, tên, email, ngành..."
                  options={studentOptions}
                  value={searchMaHV}
                  onChange={(value) => {
                    setSearchMaHV(String(value));
                    // Auto search when selecting from dropdown
                    handleSearch(String(value));
                  }}
                  isLoading={loadingOptions}
                  disabled={loading}
                />
              </div>
            )}

            <Button
              onClick={() => handleSearch()}
              disabled={loading || !searchMaHV}
              variant="primary"
              className="px-6"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang tải...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  Tra cứu
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>


      {/* Statistics */}
      {searched && grades.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600 mt-1">Tổng môn học</div>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.passed}</div>
              <div className="text-sm text-gray-600 mt-1">Đã đạt</div>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-600 mt-1">Chưa đạt</div>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.average.toFixed(2)}</div>
              <div className="text-sm text-gray-600 mt-1">Điểm TB</div>
            </div>
          </Card>
        </div>
      )}

      {/* Grades Table */}
      {searched && grades.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpenIcon className="h-6 w-6 text-green-600" />
              Bảng điểm chi tiết
              <span className="ml-2">
                <Badge variant="info">{grades.length} môn</Badge>
              </span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã học phần
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên môn học
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số TC
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TC thực học
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kết quả
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grades.map((grade, index) => {
                    const finalGrade = grade.diem || 0;
                    const passed = finalGrade >= 5;
                    const hasDiem = grade.diem !== null && grade.diem !== undefined;

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-blue-600">
                          {grade.hocPhanChu || grade.maMon || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {grade.tenMon || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <Badge variant="info">{grade.soTinChi || '-'}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-700">
                          {grade.soTinChiThucHoc || grade.soTinChi || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {hasDiem ? (
                            <span className="font-bold text-xl text-blue-600">
                              {finalGrade.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {hasDiem ? (
                            <div className="inline-flex items-center gap-1">
                              <Badge variant={passed ? 'success' : 'danger'}>
                                {passed ? (
                                  <>
                                    <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                                    Đạt
                                  </>
                                ) : (
                                  <>
                                    <XCircleIcon className="h-4 w-4 inline mr-1" />
                                    Chưa đạt
                                  </>
                                )}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Chưa có điểm</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {grade.ghiChu || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {searched && grades.length === 0 && !loading && !error && (
        <Card>
          <div className="p-12 text-center">
            <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy điểm
            </h3>
            <p className="text-gray-500">
              Không có dữ liệu điểm cho mã học viên <strong>{searchMaHV}</strong>
            </p>
          </div>
        </Card>
      )}

      {/* Initial State */}
      {!searched && !loading && (
        <Card>
          <div className="p-12 text-center">
            <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Bắt đầu tra cứu
            </h3>
            <p className="text-gray-500">
              {isStudent
                ? 'Nhấn nút "Tra cứu" để xem điểm của bạn'
                : 'Nhập mã học viên và nhấn "Tra cứu" để xem điểm'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
