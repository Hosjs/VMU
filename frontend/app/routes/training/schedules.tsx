import { useState, useMemo, useEffect } from 'react';
import { teachingAssignmentService } from '~/services/teaching-assignment.service';
import { useTable } from '~/hooks/useTable';
import { useModal } from '~/hooks/useModal';
import type { TeachingAssignment } from '~/types/teaching-assignment';
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Table } from '~/components/ui/Table';
import { Modal } from '~/components/ui/Modal';
import { Pagination } from '~/components/ui/Pagination';

export function meta() {
  return [
    { title: "Thời khóa biểu - VMU Training" },
    { name: "description", content: "Quản lý thời khóa biểu giảng dạy" },
  ];
}

export default function SchedulesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    lecturer_id: '',
    status: '',
    day_of_week: '',
    start_date: '',
    end_date: '',
  });
  const [todaySchedules, setTodaySchedules] = useState<TeachingAssignment[]>([]);

  const detailModal = useModal();
  const [selectedAssignment, setSelectedAssignment] = useState<TeachingAssignment | null>(null);

  // Fetch today's schedules
  useEffect(() => {
    const fetchTodaySchedules = async () => {
      try {
        const response = await teachingAssignmentService.getToday();
        if (response.success && response.data.length > 0) {
          setTodaySchedules(response.data);
        }
      } catch (error) {
        console.error('Error fetching today schedules:', error);
      }
    };

    fetchTodaySchedules();
  }, []);

  // Use table hook for pagination and data management
  const {
    data: assignments,
    isLoading,
    meta,
    page,
    perPage,
    sortBy,
    sortDirection,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    handleSearch,
    handleFilter,
    handleClearFilters,
  } = useTable<TeachingAssignment>({
    fetchData: (params) => teachingAssignmentService.getList(params),
    initialPerPage: 15,
    initialSortBy: 'start_date',
    initialSortDirection: 'desc',
  });

  // Apply filters
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    // Apply search
    handleSearch(searchTerm);

    // Apply each filter individually
    if (filters.lecturer_id) handleFilter('lecturer_id', filters.lecturer_id);
    if (filters.status) handleFilter('status', filters.status);
    if (filters.day_of_week) handleFilter('day_of_week', filters.day_of_week);
    if (filters.start_date) handleFilter('start_date', filters.start_date);
    if (filters.end_date) handleFilter('end_date', filters.end_date);
  };

  const clearFilters = () => {
    setFilters({
      lecturer_id: '',
      status: '',
      day_of_week: '',
      start_date: '',
      end_date: '',
    });
    setSearchTerm('');
    handleClearFilters();
  };

  // View assignment details
  const handleViewDetails = (assignment: TeachingAssignment) => {
    setSelectedAssignment(assignment);
    detailModal.open();
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const statusMap = {
      scheduled: { label: 'Đã lên lịch', variant: 'info' as const },
      ongoing: { label: 'Đang diễn ra', variant: 'success' as const },
      completed: { label: 'Hoàn thành', variant: 'secondary' as const },
      cancelled: { label: 'Đã hủy', variant: 'danger' as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'default' as const };
  };

  // Get day of week label
  const getDayLabel = (day: string) => {
    return day === 'saturday' ? 'Thứ 7' : 'Chủ nhật';
  };

  // Format time
  const formatTime = (time: string) => {
    if (!time) return '';
    return time.substring(0, 5); // HH:mm
  };

  // Format date
  const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // Table columns
  const columns = useMemo(() => [
    {
      key: 'course_info',
      label: 'Môn học',
      width: '250px',
      render: (item: TeachingAssignment) => (
        <div>
          <div className="font-semibold text-gray-900">{item.course_name}</div>
          {item.course_code && (
            <div className="text-sm text-gray-500">{item.course_code}</div>
          )}
          {item.class_name && (
            <div className="text-xs text-blue-600 mt-1">Lớp: {item.class_name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'lecturer',
      label: 'Giảng viên',
      width: '180px',
      render: (item: TeachingAssignment) => (
        <div className="flex items-center gap-2">
          <AcademicCapIcon className="w-5 h-5 text-gray-400" />
          <span className="text-gray-900">
            {item.lecturer?.hoTen || item.lecturer?.ho_ten || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'schedule',
      label: 'Lịch học',
      width: '200px',
      render: (item: TeachingAssignment) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <span>{getDayLabel(item.day_of_week)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <span>{formatTime(item.start_time)} - {formatTime(item.end_time)}</span>
          </div>
          {item.room && (
            <div className="flex items-center gap-2 text-sm">
              <MapPinIcon className="w-4 h-4 text-gray-400" />
              <span>Phòng {item.room}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'duration',
      label: 'Thời gian',
      width: '180px',
      render: (item: TeachingAssignment) => (
        <div className="text-sm">
          <div>{formatDate(item.start_date)}</div>
          <div className="text-gray-500">đến {formatDate(item.end_date)}</div>
        </div>
      ),
    },
    {
      key: 'students',
      label: 'Học viên',
      width: '100px',
      render: (item: TeachingAssignment) => (
        <div className="flex items-center gap-2">
          <UserGroupIcon className="w-5 h-5 text-gray-400" />
          <span className="font-medium">{item.student_count || 0}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      width: '130px',
      render: (item: TeachingAssignment) => {
        const statusInfo = getStatusBadge(item.status);
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: '100px',
      render: (item: TeachingAssignment) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleViewDetails(item)}
            title="Xem chi tiết"
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ], []);

  // Statistics
  const statistics = useMemo(() => {
    const total = meta.total || 0;
    const scheduled = assignments.filter(a => a.status === 'scheduled').length;
    const ongoing = assignments.filter(a => a.status === 'ongoing').length;
    const completed = assignments.filter(a => a.status === 'completed').length;

    return { total, scheduled, ongoing, completed };
  }, [assignments, meta.total]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thời khóa biểu</h1>
          <p className="text-gray-600 mt-1">Quản lý lịch giảng dạy của giảng viên</p>
        </div>
      </div>

      {/* Today's Schedule Alert */}
      {todaySchedules.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="bg-blue-500 rounded-full p-2">
                <BellAlertIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📅 Lịch dạy hôm nay ({todaySchedules.length} buổi học)
              </h3>
              <div className="space-y-3">
                {todaySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="bg-white rounded-lg p-3 shadow-sm border border-blue-100 hover:border-blue-300 transition cursor-pointer"
                    onClick={() => handleViewDetails(schedule)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {schedule.course_name}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          </span>
                          {schedule.room && (
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="w-4 h-4" />
                              Phòng {schedule.room}
                            </span>
                          )}
                          {schedule.class_name && (
                            <span className="text-blue-600">
                              Lớp: {schedule.class_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(schedule);
                        }}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng lịch</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đã lên lịch</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.scheduled}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <AcademicCapIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đang diễn ra</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.ongoing}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.completed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm môn học, lớp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: '', label: 'Tất cả trạng thái' },
                { value: 'scheduled', label: 'Đã lên lịch' },
                { value: 'ongoing', label: 'Đang diễn ra' },
                { value: 'completed', label: 'Hoàn thành' },
                { value: 'cancelled', label: 'Đã hủy' },
              ]}
            />

            <Select
              value={filters.day_of_week}
              onChange={(e) => handleFilterChange('day_of_week', e.target.value)}
              options={[
                { value: '', label: 'Tất cả ngày' },
                { value: 'saturday', label: 'Thứ 7' },
                { value: 'sunday', label: 'Chủ nhật' },
              ]}
            />

            <Input
              type="date"
              placeholder="Từ ngày"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
            />

            <Input
              type="date"
              placeholder="Đến ngày"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={applyFilters} leftIcon={<FunnelIcon className="w-4 h-4" />}>
              Áp dụng
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={assignments}
          isLoading={isLoading}
          emptyMessage="Không có lịch giảng dạy nào"
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
        />

        {meta.total > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={meta.last_page}
              onPageChange={handlePageChange}
              perPage={perPage}
              onPerPageChange={handlePerPageChange}
              total={meta.total}
            />
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
        title="Chi tiết thời khóa biểu"
        size="lg"
      >
        {selectedAssignment && (
          <div className="space-y-6">
            {/* Course Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedAssignment.course_name}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {selectedAssignment.course_code && (
                  <div>
                    <span className="text-gray-600">Mã học phần:</span>
                    <span className="ml-2 font-medium">{selectedAssignment.course_code}</span>
                  </div>
                )}
                {selectedAssignment.class_name && (
                  <div>
                    <span className="text-gray-600">Lớp:</span>
                    <span className="ml-2 font-medium">{selectedAssignment.class_name}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Số tín chỉ:</span>
                  <span className="ml-2 font-medium">{selectedAssignment.credits || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="ml-2">
                    <Badge variant={getStatusBadge(selectedAssignment.status).variant}>
                      {getStatusBadge(selectedAssignment.status).label}
                    </Badge>
                  </span>
                </div>
              </div>
            </div>

            {/* Lecturer Info */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AcademicCapIcon className="w-5 h-5" />
                Giảng viên
              </h5>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 font-medium">
                  {selectedAssignment.lecturer?.hoTen || selectedAssignment.lecturer?.ho_ten || 'N/A'}
                </p>
                {selectedAssignment.lecturer?.trinh_do_chuyen_mon && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedAssignment.lecturer.trinh_do_chuyen_mon}
                  </p>
                )}
              </div>
            </div>

            {/* Schedule Info */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Lịch học
              </h5>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-32">Ngày học:</span>
                  <span className="font-medium">{getDayLabel(selectedAssignment.day_of_week)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-32">Giờ học:</span>
                  <span className="font-medium">
                    {formatTime(selectedAssignment.start_time)} - {formatTime(selectedAssignment.end_time)}
                  </span>
                </div>
                {selectedAssignment.room && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 w-32">Phòng học:</span>
                    <span className="font-medium">Phòng {selectedAssignment.room}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-32">Thời gian:</span>
                  <span className="font-medium">
                    {formatDate(selectedAssignment.start_date)} - {formatDate(selectedAssignment.end_date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Student Info */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5" />
                Học viên
              </h5>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Số lượng học viên:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {selectedAssignment.student_count || 0}
                  </span>
                </div>
                {selectedAssignment.class_name && (
                  <p className="text-sm text-gray-500 mt-2">
                    Lớp: {selectedAssignment.class_name}
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            {selectedAssignment.notes && (
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Ghi chú</h5>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedAssignment.notes}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
