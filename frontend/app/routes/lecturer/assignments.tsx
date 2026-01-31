import { useState, useMemo, useEffect } from 'react';
import { teachingAssignmentService } from '~/services/teaching-assignment.service';
import { lecturerService } from '~/services/lecturer.service';
import { trainingService } from '~/services/training.service';
import { useTable } from '~/hooks/useTable';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useForm } from '~/hooks/useForm';
import { useNavigate } from 'react-router';
import type { TeachingAssignment, TeachingAssignmentFormData, DaySchedule, DayOfWeek } from '~/types/teaching-assignment';
import type { Lecturer } from '~/types/lecturer';
import { formatters } from '~/utils/formatters';
import {
  CalendarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  AcademicCapIcon,
  UserGroupIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Table } from '~/components/ui/Table';
import { Modal } from '~/components/ui/Modal';
import { Autocomplete, type AutocompleteOption } from '~/components/ui/Autocomplete';

export function meta() {
  return [
    { title: "Lịch giảng dạy - VMU Training" },
    { name: "description", content: "Quản lý lịch giảng dạy cho giảng viên" },
  ];
}

const dayOfWeekLabels: Record<DayOfWeek, string> = {
  monday: 'Thứ 2',
  tuesday: 'Thứ 3',
  wednesday: 'Thứ 4',
  thursday: 'Thứ 5',
  friday: 'Thứ 6',
  saturday: 'Thứ 7',
  sunday: 'Chủ nhật',
};

const statusLabels: Record<'in_progress' | 'cancelled' | 'in_exam' | 'paid', string> = {
  in_progress: 'Đang diễn ra',
  cancelled: 'Đã hủy',
  in_exam: 'Đang thi',
  paid: 'Đã thanh toán',
};

const statusColors: Record<'in_progress' | 'cancelled' | 'in_exam' | 'paid', 'info' | 'success' | 'warning' | 'danger'> = {
  in_progress: 'warning',
  cancelled: 'danger',
  in_exam: 'info',
  paid: 'success',
};

export default function TeachingAssignmentsPage() {
  const navigate = useNavigate();
  const [editingAssignment, setEditingAssignment] = useState<TeachingAssignment | null>(null);
  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();
  const [assignmentToDelete, setAssignmentToDelete] = useState<TeachingAssignment | null>(null);

  // State for courses list
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  // Load lecturers for dropdown
  const lecturersAsync = useAsync(
    () => lecturerService.getList({ per_page: 1000 }),
    { immediate: true }
  );

  // Table with pagination
  const table = useTable<TeachingAssignment>({
    fetchData: (params) => teachingAssignmentService.getList(params),
    initialSortBy: 'start_date',
    initialSortDirection: 'desc',
  });

  // Form for create/edit
  const form = useForm<TeachingAssignmentFormData>({
    initialValues: {
      lecturer_id: 0,
      course_code: '',
      course_name: '',
      credits: 0,
      start_date: '',
      end_date: '',
      days_schedule: [],
      class_name: '',
      student_count: 0,
      status: 'in_progress',
      notes: '',
    },
    onSubmit: async (values) => {
      try {
        // Validate that at least one day is selected
        if (!values.days_schedule || values.days_schedule.length === 0) {
          form.setFieldError('submit', 'Vui lòng chọn ít nhất một ngày học');
          return;
        }

        // ✅ Validate start_date < end_date
        if (values.start_date && values.end_date && values.start_date > values.end_date) {
          form.setFieldError('submit', '❌ Ngày kết thúc phải sau ngày bắt đầu!');
          return;
        }

        // ✅ Validate start_time < end_time for each day
        for (const daySchedule of values.days_schedule) {
          if (!daySchedule.start_time || !daySchedule.end_time) {
            form.setFieldError('submit', '❌ Vui lòng nhập đầy đủ giờ học!');
            return;
          }

          // ✅ Allow overnight classes (22:00 - 02:00 is valid)
          // Only check if start and end are the same time
          if (daySchedule.start_time === daySchedule.end_time) {
            const dayLabel = daySchedule.day_of_week === 'saturday' ? 'Thứ 7' : 'Chủ nhật';
            form.setFieldError('submit', `❌ Giờ bắt đầu và kết thúc không thể giống nhau (${dayLabel})!`);
            return;
          }
        }

        console.log('✅ Validation passed, submitting...', {
          days: values.days_schedule.map(d => ({
            day: d.day_of_week,
            start: d.start_time,
            end: d.end_time
          }))
        });

        if (editingAssignment) {
          // ✅ Strategy for Edit:
          // - Update the existing record (first day)
          // - Create new records for additional days

          const promises: Promise<any>[] = [];

          // Update first day (existing record)
          console.log('🔍 Form values.status:', values.status, 'Type:', typeof values.status);

          const firstDayData = {
            lecturer_id: values.lecturer_id,
            course_code: values.course_code,
            course_name: values.course_name,
            credits: values.credits,
            start_date: values.start_date,
            end_date: values.end_date,
            day_of_week: values.days_schedule[0].day_of_week,
            start_time: values.days_schedule[0].start_time,
            end_time: values.days_schedule[0].end_time,
            room: values.days_schedule[0].room,
            class_name: values.class_name,
            student_count: values.student_count,
            status: values.status,
            notes: values.notes,
          };
          console.log('📤 Updating existing assignment (day 1):', firstDayData);
          console.log('📤 Status being sent:', firstDayData.status);
          promises.push(
            teachingAssignmentService.update(editingAssignment.id, firstDayData as any)
          );

          // Create new records for additional days (if any)
          if (values.days_schedule.length > 1) {
            console.log(`📤 Creating ${values.days_schedule.length - 1} additional day(s)...`);

            for (let i = 1; i < values.days_schedule.length; i++) {
              const daySchedule = values.days_schedule[i];
              const newDayData = {
                lecturer_id: values.lecturer_id,
                course_code: values.course_code,
                course_name: values.course_name,
                credits: values.credits,
                start_date: values.start_date,
                end_date: values.end_date,
                day_of_week: daySchedule.day_of_week,
                start_time: daySchedule.start_time,
                end_time: daySchedule.end_time,
                room: daySchedule.room,
                class_name: values.class_name,
                student_count: values.student_count,
                status: values.status,
                notes: values.notes,
              };
              console.log(`📤 Creating new assignment (day ${i + 1}):`, newDayData);
              promises.push(
                teachingAssignmentService.create(newDayData as any)
              );
            }
          }

          await Promise.all(promises);
          console.log('✅ All assignments saved successfully!');
          editModal.close();
        } else {
          // For create, create multiple records if multiple days selected
          const promises = values.days_schedule.map((daySchedule: DaySchedule) => {
            const singleDayData = {
              lecturer_id: values.lecturer_id,
              course_code: values.course_code,
              course_name: values.course_name,
              credits: values.credits,
              start_date: values.start_date,
              end_date: values.end_date,
              day_of_week: daySchedule.day_of_week,
              start_time: daySchedule.start_time,
              end_time: daySchedule.end_time,
              room: daySchedule.room,
              class_name: values.class_name,
              student_count: values.student_count,
              status: values.status,
              notes: values.notes,
            };
            console.log('📤 Creating assignment:', singleDayData);
            return teachingAssignmentService.create(singleDayData as any);
          });

          await Promise.all(promises);
          createModal.close();
        }
        table.refresh();
        form.reset();
        setEditingAssignment(null);
      } catch (error: any) {
        console.error('❌ Submit error:', error);
        console.error('❌ Error response:', error.response?.data);

        if (error.response?.status === 409) {
          form.setFieldError('submit', 'Giảng viên đã có lịch giảng dạy trùng thời gian này');
        } else if (error.response?.data?.errors) {
          // Show specific validation errors
          const errors = error.response.data.errors;
          console.error('❌ Validation errors:', errors);
          const errorMessages = Object.entries(errors)
            .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join(' | ');
          form.setFieldError('submit', `❌ ${errorMessages}`);
        } else {
          form.setFieldError('submit', error.message || 'Có lỗi xảy ra khi lưu lịch giảng dạy');
        }
      }
    },
  });

  // Load courses when lecturer changes
  useEffect(() => {
    const loadCourses = async () => {
      if (!form.values.lecturer_id) {
        setAvailableCourses([]);
        return;
      }

      // Find selected lecturer to get maNganh from major relationship
      const selectedLecturer = lecturersAsync.data?.data?.find(
        (l: Lecturer) => l.id === form.values.lecturer_id
      );

      // Get actual maNganh from major relationship, not the foreign key ID
      const actualMaNganh = selectedLecturer?.major?.maNganh;

      if (!actualMaNganh) {
        console.warn('⚠️ Giảng viên không có thông tin ngành hoặc mã ngành');
        form.setFieldError('lecturer_id', 'Giảng viên chưa được phân công ngành học');
        setAvailableCourses([]);
        return;
      }

      setIsLoadingCourses(true);
      try {
        const response = await trainingService.getCoursesByMajor(actualMaNganh);

        if (response.success && response.data && response.data.length > 0) {
          setAvailableCourses(response.data);
          // Clear any previous error
          form.setFieldError('lecturer_id', '');
        } else {
          console.warn('⚠️ No courses found:', response.message);
          setAvailableCourses([]);
          // Show warning to user
          form.setFieldError('lecturer_id', response.message || 'Không tìm thấy môn học cho giảng viên này');
        }
      } catch (error) {
        console.error('❌ Error loading courses:', error);
        setAvailableCourses([]);
        form.setFieldError('lecturer_id', 'Lỗi khi tải danh sách môn học');
      } finally {
        setIsLoadingCourses(false);
      }
    };

    loadCourses();
  }, [form.values.lecturer_id, lecturersAsync.data]);

  // Handle delete
  const handleDelete = async () => {
    if (!assignmentToDelete) return;

    try {
      await teachingAssignmentService.delete(assignmentToDelete.id);
      deleteModal.close();
      setAssignmentToDelete(null);
      table.refresh();
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  // Open create modal
  const handleCreate = () => {
    form.reset();
    form.setFieldValue('days_schedule', []);
    setEditingAssignment(null);
    createModal.open();
  };

  // Open edit modal
  const handleEdit = (assignment: TeachingAssignment) => {
    setEditingAssignment(assignment);

    // Extract time from datetime format using formatters
    const startTime = formatters.formatTime(assignment.start_time);
    const endTime = formatters.formatTime(assignment.end_time);

    // Ensure status is valid - fallback to 'in_progress' if invalid
    const validStatuses = ['in_progress', 'cancelled', 'in_exam', 'paid'];
    const validStatus = validStatuses.includes(assignment.status) ? assignment.status : 'in_progress';

    console.log('🔍 Editing assignment:', assignment.id);
    console.log('🔍 Original status:', assignment.status, 'Valid status:', validStatus);

    form.setValues({
      lecturer_id: assignment.lecturer_id,
      course_code: assignment.course_code || '',
      course_name: assignment.course_name,
      credits: assignment.credits,
      start_date: formatters.dateForInput(assignment.start_date) || assignment.start_date,
      end_date: formatters.dateForInput(assignment.end_date) || assignment.end_date,
      days_schedule: [{
        day_of_week: assignment.day_of_week,
        start_time: startTime,
        end_time: endTime,
        room: assignment.room || '',
      }],
      class_name: assignment.class_name || '',
      student_count: assignment.student_count,
      status: validStatus as 'in_progress' | 'cancelled' | 'in_exam' | 'paid',
      notes: assignment.notes || '',
    });
    editModal.open();
  };

  // Open delete modal
  const handleDeleteClick = (assignment: TeachingAssignment) => {
    setAssignmentToDelete(assignment);
    deleteModal.open();
  };

  // Navigate to class students page with subject info
  const handleViewClassStudents = (assignment: TeachingAssignment) => {
    // Truyền cả classId và course_name để lọc sinh viên theo môn học
    const classId = assignment.course_code || assignment.class_id || assignment.id;
    const courseName = encodeURIComponent(assignment.course_name);
    navigate(`/lecturer/class-students/${classId}?subject=${courseName}`);
  };

  // Convert lecturers to autocomplete options
  const lecturerOptions: AutocompleteOption[] = useMemo(() => {
    if (!lecturersAsync.data?.data) return [];
    return lecturersAsync.data.data.map((lecturer: Lecturer) => ({
      value: lecturer.id,
      label: lecturer.hoTen || lecturer.ho_ten || '',
      subtitle: lecturer.trinhDoChuyenMon || lecturer.trinh_do_chuyen_mon || undefined,
    }));
  }, [lecturersAsync.data]);

  // Convert courses to autocomplete options
  const courseOptions: AutocompleteOption[] = useMemo(() => {
    if (!availableCourses || availableCourses.length === 0) return [];
    return availableCourses.map((course: any) => ({
      value: course.maHocPhan || course.tenMon, // Use maHocPhan as unique identifier
      label: course.tenMon || '',
      subtitle: `${course.maHocPhan || ''} - ${course.soTinChi || 0} TC`,
    }));
  }, [availableCourses]);

  // Handle course selection - auto fill course info
  const handleCourseSelect = (courseKey: string | number) => {
    const selectedCourse = availableCourses.find(
      (c: any) => (c.maHocPhan || c.tenMon) === courseKey
    );

    if (selectedCourse) {
      form.setFieldValue('course_code', selectedCourse.maHocPhan || '');
      form.setFieldValue('course_name', selectedCourse.tenMon || '');
      form.setFieldValue('credits', selectedCourse.soTinChi || 0);
    }
  };

  // Helper functions for managing day schedules
  const toggleDay = (day: DayOfWeek) => {
    const currentSchedules = form.values.days_schedule || [];
    const existingIndex = currentSchedules.findIndex(s => s.day_of_week === day);

    if (existingIndex >= 0) {
      // Remove day
      const newSchedules = currentSchedules.filter((_, i) => i !== existingIndex);
      form.setFieldValue('days_schedule', newSchedules);
    } else {
      // Add day with default times
      const newSchedule: DaySchedule = {
        day_of_week: day,
        start_time: '08:00',
        end_time: '12:00',
        room: '',
      };
      form.setFieldValue('days_schedule', [...currentSchedules, newSchedule]);
    }
  };

  const updateDaySchedule = (day: DayOfWeek, field: keyof DaySchedule, value: string) => {
    const currentSchedules = form.values.days_schedule || [];
    const updatedSchedules = currentSchedules.map(s =>
      s.day_of_week === day ? { ...s, [field]: value } : s
    );
    form.setFieldValue('days_schedule', updatedSchedules);
  };

  const isDaySelected = (day: DayOfWeek) => {
    return (form.values.days_schedule || []).some(s => s.day_of_week === day);
  };

  const getDaySchedule = (day: DayOfWeek): DaySchedule | undefined => {
    return (form.values.days_schedule || []).find(s => s.day_of_week === day);
  };

  // Table columns
  const columns = useMemo(() => [
    {
      key: 'lecturer',
      label: 'Giảng viên',
      render: (item: TeachingAssignment) => (
        <div>
          <div className="font-medium text-gray-900">{item.lecturer?.hoTen || item.lecturer?.ho_ten || '-'}</div>
          <div className="text-xs text-gray-500">{item.lecturer?.trinhDoChuyenMon || item.lecturer?.trinh_do_chuyen_mon || ''}</div>
        </div>
      ),
    },
    {
      key: 'course',
      label: 'Môn học',
      render: (item: TeachingAssignment) => (
        <div>
          <div className="font-medium text-gray-900">{item.course_name}</div>
          {item.course_code && (
            <div className="text-xs text-gray-500">{item.course_code}</div>
          )}
          {item.class_name && (
            <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
              <UserGroupIcon className="w-3 h-3" />
              Lớp: {item.class_name}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'schedule',
      label: 'Lịch học',
      render: (item: TeachingAssignment) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <span>{dayOfWeekLabels[item.day_of_week]}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <span>{formatters.formatTime(item.start_time)} - {formatters.formatTime(item.end_time)}</span>
          </div>
          <div className="text-xs text-gray-500">
            {formatters.formatDate(item.start_date)} - {formatters.formatDate(item.end_date)}
          </div>
        </div>
      ),
    },
    {
      key: 'details',
      label: 'Chi tiết',
      render: (item: TeachingAssignment) => (
        <div className="space-y-1 text-sm">
          {item.room && (
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Phòng:</span>
              <span className="font-medium">{item.room}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <UserGroupIcon className="w-4 h-4 text-gray-400" />
            <span>{item.student_count} SV</span>
          </div>
          {item.credits > 0 && (
            <div className="flex items-center gap-1">
              <AcademicCapIcon className="w-4 h-4 text-gray-400" />
              <span>{item.credits} TC</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      width: '120px',
      render: (item: TeachingAssignment) => (
        <Badge variant={statusColors[item.status]}>
          {statusLabels[item.status]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: '150px',
      render: (item: TeachingAssignment) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(item)}
            title="Sửa"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(item)}
            title="Xóa"
          >
            <TrashIcon className="w-4 h-4 text-red-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewClassStudents(item)}
            title="Xem danh sách học viên"
          >
            <UserGroupIcon className="w-4 h-4 text-green-600" />
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lịch giảng dạy</h1>
            <p className="text-sm text-gray-500">Quản lý lịch giảng dạy cho giảng viên (Thứ 7 & Chủ nhật)</p>
          </div>
        </div>
        <Button onClick={handleCreate} variant="primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Thêm lịch giảng dạy
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Tìm kiếm môn học, lớp..."
              value={table.search}
              onChange={(e) => table.handleSearch(e.target.value)}
            />
            <Select
              value={table.filters.lecturer_id || ''}
              onChange={(e) => table.handleFilter('lecturer_id', e.target.value || undefined)}
            >
              <option value="">Tất cả giảng viên</option>
              {lecturersAsync.data?.data?.map((lecturer: Lecturer) => (
                <option key={lecturer.id} value={lecturer.id}>
                  {lecturer.hoTen || lecturer.ho_ten}
                </option>
              ))}
            </Select>
            <Select
              value={table.filters.day_of_week || ''}
              onChange={(e) => table.handleFilter('day_of_week', e.target.value || undefined)}
            >
              <option value="">Tất cả các ngày</option>
              <option value="saturday">Thứ 7</option>
              <option value="sunday">Chủ nhật</option>
            </Select>
            <Select
              value={table.filters.status || ''}
              onChange={(e) => table.handleFilter('status', e.target.value || undefined)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="in_progress">Đang diễn ra</option>
              <option value="cancelled">Đã hủy</option>
              <option value="in_exam">Đang thi</option>
              <option value="paid">Đã thanh toán</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="p-6">
          <Table
            columns={columns}
            data={table.data}
            isLoading={table.isLoading}
            emptyMessage="Chưa có lịch giảng dạy nào"
          />

          {table.meta.total > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Hiển thị {table.meta.from} - {table.meta.to} trong tổng số {table.meta.total} bản ghi
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => table.handlePageChange(table.page - 1)}
                  disabled={table.page === 1}
                >
                  Trước
                </Button>
                <span className="px-3 py-1 text-sm">
                  Trang {table.page} / {table.meta.last_page}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => table.handlePageChange(table.page + 1)}
                  disabled={table.page === table.meta.last_page}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={createModal.isOpen || editModal.isOpen}
        onClose={() => {
          createModal.close();
          editModal.close();
          form.reset();
          setEditingAssignment(null);
        }}
        title={editingAssignment ? 'Sửa lịch giảng dạy' : 'Thêm lịch giảng dạy mới'}
      >
        <form onSubmit={form.handleSubmit} className="space-y-4">
          {/* Lecturer - Using Autocomplete instead of Select */}
          <Autocomplete
            label="Giảng viên"
            placeholder="Tìm kiếm giảng viên theo tên hoặc trình độ..."
            options={lecturerOptions}
            value={form.values.lecturer_id}
            onChange={(value) => form.setFieldValue('lecturer_id', Number(value))}
            error={form.errors.lecturer_id}
            required
            isLoading={lecturersAsync.isLoading}
          />

          {/* Course Selection - Show only after lecturer is selected */}
          {form.values.lecturer_id > 0 && (
            <Autocomplete
              label="Môn học"
              placeholder="Tìm kiếm môn học..."
              options={courseOptions}
              value={form.values.course_code}
              onChange={handleCourseSelect}
              isLoading={isLoadingCourses}
            />
          )}

          {/* Course Info - Auto filled or manual input */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mã học phần"
              value={form.values.course_code || ''}
              onChange={(e) => form.setFieldValue('course_code', e.target.value)}
              placeholder="VD: CS101"
              disabled={isLoadingCourses}
            />
            <Input
              label="Số tín chỉ"
              type="number"
              value={form.values.credits?.toString() || '0'}
              onChange={(e) => form.setFieldValue('credits', parseInt(e.target.value) || 0)}
              min="0"
              disabled={isLoadingCourses}
            />
          </div>

          <Input
            label="Tên môn học"
            value={form.values.course_name}
            onChange={(e) => form.setFieldValue('course_name', e.target.value)}
            error={form.errors.course_name}
            required
            placeholder="VD: Lập trình Web"
            disabled={isLoadingCourses}
          />

          <Input
            label="Tên lớp"
            value={form.values.class_name || ''}
            onChange={(e) => form.setFieldValue('class_name', e.target.value)}
            placeholder="VD: K17-CNTT"
          />

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={form.values.start_date}
              onChange={(e) => form.setFieldValue('start_date', e.target.value)}
              error={form.errors.start_date}
              required
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              value={form.values.end_date}
              onChange={(e) => form.setFieldValue('end_date', e.target.value)}
              error={form.errors.end_date}
              required
            />
          </div>

          {/* Day selection - All 7 days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn ngày học <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {/* Weekdays */}
              <Button
                type="button"
                variant={isDaySelected('monday') ? 'primary' : 'outline'}
                className="text-sm"
                onClick={() => toggleDay('monday')}
              >
                Thứ 2
              </Button>
              <Button
                type="button"
                variant={isDaySelected('tuesday') ? 'primary' : 'outline'}
                className="text-sm"
                onClick={() => toggleDay('tuesday')}
              >
                Thứ 3
              </Button>
              <Button
                type="button"
                variant={isDaySelected('wednesday') ? 'primary' : 'outline'}
                className="text-sm"
                onClick={() => toggleDay('wednesday')}
              >
                Thứ 4
              </Button>
              <Button
                type="button"
                variant={isDaySelected('thursday') ? 'primary' : 'outline'}
                className="text-sm"
                onClick={() => toggleDay('thursday')}
              >
                Thứ 5
              </Button>
              <Button
                type="button"
                variant={isDaySelected('friday') ? 'primary' : 'outline'}
                className="text-sm"
                onClick={() => toggleDay('friday')}
              >
                Thứ 6
              </Button>
              <Button
                type="button"
                variant={isDaySelected('saturday') ? 'primary' : 'outline'}
                className="text-sm"
                onClick={() => toggleDay('saturday')}
              >
                Thứ 7
              </Button>
              <Button
                type="button"
                variant={isDaySelected('sunday') ? 'primary' : 'outline'}
                className="text-sm"
                onClick={() => toggleDay('sunday')}
              >
                CN
              </Button>
            </div>
            {form.errors.days_schedule && (
              <p className="text-sm text-red-600 mt-1">{form.errors.days_schedule}</p>
            )}
          </div>

          {/* Render time and room inputs for each selected day */}
          {(form.values.days_schedule || []).map((daySchedule, index) => (
            <div key={index} className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">
                  {dayOfWeekLabels[daySchedule.day_of_week]}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const currentSchedules = form.values.days_schedule || [];
                    const newSchedules = currentSchedules.filter((_, i) => i !== index);
                    form.setFieldValue('days_schedule', newSchedules);
                  }}
                >
                  <XCircleIcon className="w-4 h-4 text-red-600" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <Input
                  label="Giờ bắt đầu"
                  type="time"
                  value={daySchedule.start_time}
                  onChange={(e) => {
                    const newStartTime = e.target.value;
                    updateDaySchedule(daySchedule.day_of_week, 'start_time', newStartTime);

                    // Clear error when start time changes
                    if (form.errors.submit) {
                      form.setFieldError('submit', '');
                    }
                  }}
                  error={form.errors.start_time}
                  required
                />
                <Input
                  label="Giờ kết thúc"
                  type="time"
                  value={daySchedule.end_time}
                  onChange={(e) => {
                    const newEndTime = e.target.value;
                    const startTime = daySchedule.start_time;

                    // ⚠️ Validate: end_time must be after start_time
                    if (startTime && newEndTime) {
                      const [startHour, startMin] = startTime.split(':').map(Number);
                      const [endHour, endMin] = newEndTime.split(':').map(Number);
                      const startMinutes = startHour * 60 + startMin;
                      const endMinutes = endHour * 60 + endMin;

                      if (endMinutes <= startMinutes) {
                        console.warn('⚠️ Giờ kết thúc phải sau giờ bắt đầu!', {
                          start: startTime,
                          end: newEndTime
                        });
                        form.setFieldError('submit', '⚠️ Giờ kết thúc phải sau giờ bắt đầu!');
                        // Still update the value, but show warning
                        updateDaySchedule(daySchedule.day_of_week, 'end_time', newEndTime);
                        return;
                      }
                    }

                    // Clear error if valid
                    if (form.errors.submit) {
                      form.setFieldError('submit', '');
                    }

                    updateDaySchedule(daySchedule.day_of_week, 'end_time', newEndTime);
                  }}
                  error={form.errors.end_time}
                  required
                />
              </div>

              <Input
                label="Phòng học"
                value={daySchedule.room}
                onChange={(e) => updateDaySchedule(daySchedule.day_of_week, 'room', e.target.value)}
                placeholder="VD: A101"
                className="mt-2"
              />
            </div>
          ))}

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số lượng sinh viên"
              type="number"
              value={form.values.student_count?.toString() || '0'}
              onChange={(e) => form.setFieldValue('student_count', parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>

          <Select
            label="Trạng thái"
            value={form.values.status || 'in_progress'}
            onChange={(e) => form.setFieldValue('status', e.target.value as any)}
          >
            <option value="in_progress">Đang diễn ra</option>
            <option value="cancelled">Đã hủy</option>
            <option value="in_exam">Đang thi</option>
            <option value="paid">Đã thanh toán</option>
          </Select>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={form.values.notes || ''}
              onChange={(e) => form.setFieldValue('notes', e.target.value)}
              placeholder="Ghi chú thêm về lịch giảng dạy..."
            />
          </div>

          {form.errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {form.errors.submit}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                createModal.close();
                editModal.close();
                form.reset();
                setEditingAssignment(null);
              }}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={form.isSubmitting}>
              {editingAssignment ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => {
          deleteModal.close();
          setAssignmentToDelete(null);
        }}
        title="Xác nhận xóa"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn xóa lịch giảng dạy <strong>{assignmentToDelete?.course_name}</strong> không?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                deleteModal.close();
                setAssignmentToDelete(null);
              }}
            >
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
