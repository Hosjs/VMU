import { useState, useEffect } from 'react';
import { studentService } from '~/services/student.service';
import type { Student } from '~/types/student';
import { UserGroupIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Table } from '~/components/ui/Table';
import { Badge } from '~/components/ui/Badge';
import { Card } from '~/components/ui/Card';

export function meta() {
  return [
    { title: "Danh sách học viên - VMU Training" },
    { name: "description", content: "Quản lý thông tin học viên thạc sỹ" },
  ];
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters - Người dùng tự lọc, không hardcode
  const [namVao, setNamVao] = useState<number>(new Date().getFullYear());
  const [maNganh, setMaNganh] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [gioiTinhFilter, setGioiTinhFilter] = useState<string>('');
  const [trinhDoFilter, setTrinhDoFilter] = useState<string>(''); // Thêm filter trình độ

  useEffect(() => {
    loadStudents();
  }, [namVao, maNganh]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Gọi API lấy TẤT CẢ học viên từ external API
      // Người dùng sẽ tự filter theo trình độ nếu muốn
      const data = await studentService.getThacSyList(namVao, maNganh || '8310110');
      setStudents(data);
    } catch (err) {
      setError('Không thể tải danh sách học viên. Vui lòng thử lại.');
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter students - Bao gồm filter theo trình độ
  const filteredStudents = students.filter(student => {
    const matchSearch = searchTerm === '' ||
      student.maHV.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${student.hoDem} ${student.ten}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.dienThoai?.includes(searchTerm);

    const matchGender = gioiTinhFilter === '' || student.gioiTinh === gioiTinhFilter;

    // Filter theo trình độ đào tạo nếu người dùng chọn
    const matchTrinhDo = trinhDoFilter === '' ||
      student.maTrinhDoDaoTao === trinhDoFilter ||
      student.trinhDoDaoTao?.maTrinhDoDaoTao === trinhDoFilter;

    return matchSearch && matchGender && matchTrinhDo;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }> = {
      'DangHoc': { label: 'Đang học', variant: 'success' },
      'BaoLuu': { label: 'Bảo lưu', variant: 'warning' },
      'DaTotNghiep': { label: 'Đã tốt nghiệp', variant: 'info' },
      'ThoiHoc': { label: 'Thôi học', variant: 'danger' },
    };

    const config = statusMap[status] || { label: status, variant: 'info' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns = [
    {
      key: 'maHV',
      label: 'Mã học viên',
      render: (student: Student) => (
        <span className="font-semibold text-blue-600">{student.maHV}</span>
      ),
    },
    {
      key: 'hoTen',
      label: 'Họ và tên',
      render: (student: Student) => (
        <div>
          <div className="font-medium">{`${student.hoDem} ${student.ten}`}</div>
          <div className="text-xs text-gray-500">{student.email}</div>
        </div>
      ),
    },
    {
      key: 'gioiTinh',
      label: 'Giới tính',
      render: (student: Student) => student.gioiTinh,
    },
    {
      key: 'dienThoai',
      label: 'Điện thoại',
      render: (student: Student) => student.dienThoai,
    },
    {
      key: 'nganh',
      label: 'Ngành học',
      render: (student: Student) => (
        <div>
          <div className="text-sm">
            {student.nganhHoc || student.nganh?.tenNganh || student.maNganh}
          </div>
          <div className="text-xs text-gray-500">Mã: {student.maNganh}</div>
        </div>
      ),
    },
    {
      key: 'namVaoTruong',
      label: 'Năm vào',
      render: (student: Student) => (
        // Hiển thị namVaotruong từ external API hoặc namVaoTruong từ internal API
        student.namVaotruong || student.namVaoTruong
      ),
    },
    {
      key: 'trangThai',
      label: 'Trạng thái',
      render: (student: Student) => (
        // Hiển thị trangThaiHoc từ external API hoặc trangThai từ internal API
        getStatusBadge(student.trangThaiHoc || student.trangThai)
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách học viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Danh sách học viên</h1>
            <p className="text-sm text-gray-500">Quản lý thông tin học viên</p>
          </div>
        </div>

        <Button variant="primary" onClick={() => {}}>
          + Thêm học viên
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <FunnelIcon className="w-5 h-5" />
            <span>Bộ lọc</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm theo mã, tên, email, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Năm vào */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Năm vào trường
              </label>
              <Select
                value={namVao.toString()}
                onChange={(e) => setNamVao(Number(e.target.value))}
              >
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </Select>
            </div>

            {/* Trình độ đào tạo - QUAN TRỌNG: Người dùng tự lọc */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trình độ đào tạo
              </label>
              <Select
                value={trinhDoFilter}
                onChange={(e) => setTrinhDoFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="ThacSi">Thạc sỹ</option>
                <option value="TienSi">Tiến sỹ</option>
                <option value="DaiHoc">Đại học</option>
              </Select>
            </div>

            {/* Giới tính */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính
              </label>
              <Select
                value={gioiTinhFilter}
                onChange={(e) => setGioiTinhFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </Select>
            </div>
          </div>

          {/* Mã ngành - có thể thay đổi */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Mã ngành:</label>
            <Input
              type="text"
              value={maNganh}
              onChange={(e) => setMaNganh(e.target.value)}
              placeholder="Nhập mã ngành (vd: 8310110)"
              className="w-64"
            />
            <span className="text-xs text-gray-500">Để trống = tất cả</span>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Tổng số: <span className="text-blue-600">{filteredStudents.length}</span> học viên
              {trinhDoFilter && (
                <span className="text-sm text-gray-500 ml-2">
                  (Lọc: {trinhDoFilter === 'ThacSi' ? 'Thạc sỹ' : trinhDoFilter})
                </span>
              )}
            </h2>
          </div>

          <Table
            data={filteredStudents}
            columns={columns}
            keyExtractor={(student) => student.maHV}
          />

          {filteredStudents.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <UserGroupIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Không tìm thấy học viên</p>
              <p className="text-sm">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
