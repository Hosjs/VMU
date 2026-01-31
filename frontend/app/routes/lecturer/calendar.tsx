import { useState, useMemo, useEffect } from 'react';
import { teachingAssignmentService } from '~/services/teaching-assignment.service';
import { lecturerService } from '~/services/lecturer.service';
import { useAsync } from '~/hooks/useAsync';
import type { TeachingAssignment } from '~/types/teaching-assignment';
import type { Lecturer } from '~/types/lecturer';
import type { PaginatedResponse } from '~/types/common';
import { formatters } from '~/utils/formatters';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  AcademicCapIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Card } from '~/components/ui/Card';
import { Select } from '~/components/ui/Select';

export function meta() {
  return [
    { title: "Lịch giảng viên - VMU" },
    { name: "description", content: "Xem lịch giảng dạy của giảng viên theo tháng" },
  ];
}

export default function LecturerCalendarPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedLecturerId, setSelectedLecturerId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Load lecturers
  const lecturersAsync = useAsync(
    () => lecturerService.getList({ per_page: 1000 }),
    { immediate: true }
  );

  // State for schedule data
  const [scheduleData, setScheduleData] = useState<PaginatedResponse<TeachingAssignment> | null>(null);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  // Load schedule when lecturer or month changes
  useEffect(() => {
    const loadSchedule = async () => {
      if (!selectedLecturerId) {
        setScheduleData(null);
        return;
      }

      setIsLoadingSchedule(true);
      try {
        // Calculate date range for the month
        const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
        const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        console.log('📅 Loading calendar for:', {
          lecturerId: selectedLecturerId,
          month: selectedMonth,
          year: selectedYear,
          startDate,
          endDate,
        });

        // Fetch assignments for this lecturer and month
        const result = await teachingAssignmentService.getList({
          page: 1,
          per_page: 1000, // Get all assignments
          filters: {
            lecturer_id: selectedLecturerId,
            start_date: startDate,
            end_date: endDate,
          }
        });

        console.log('📊 Received data:', result);
        console.log('📋 Assignments count:', result.data?.length || 0);

        setScheduleData(result);
      } catch (error) {
        console.error('❌ Error loading schedule:', error);
        setScheduleData(null);
      } finally {
        setIsLoadingSchedule(false);
      }
    };

    loadSchedule();
  }, [selectedLecturerId, selectedMonth, selectedYear]);

  // Get days in month
  const daysInMonth = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    const daysArray: Date[] = [];

    // Add previous month days to fill the first week
    const firstDayOfWeek = firstDay.getDay();
    const daysToAdd = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Monday = 0
    for (let i = daysToAdd; i > 0; i--) {
      const day = new Date(selectedYear, selectedMonth - 1, -i + 1);
      daysArray.push(day);
    }

    // Add current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysArray.push(new Date(selectedYear, selectedMonth - 1, i));
    }

    // Add next month days to complete the grid
    const remainingDays = 42 - daysArray.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      daysArray.push(new Date(selectedYear, selectedMonth, i));
    }

    return daysArray;
  }, [selectedMonth, selectedYear]);

  // Get assignments by date
  const assignmentsByDate = useMemo(() => {
    const map: Record<string, TeachingAssignment[]> = {};
    const assignments = scheduleData?.data || [];

    if (assignments && assignments.length > 0) {
      console.log('📅 Processing assignments:', assignments.length);

      assignments.forEach((assignment: TeachingAssignment) => {
        console.log('📋 Assignment:', {
          id: assignment.id,
          course: assignment.course_name,
          day_of_week: assignment.day_of_week,
          start_date: assignment.start_date,
          end_date: assignment.end_date,
        });

        // ✅ Parse date WITHOUT timezone offset (treat as local date)
        // Extract YYYY-MM-DD from ISO string
        const startDateStr = assignment.start_date.split('T')[0]; // "2026-01-23"
        const endDateStr = assignment.end_date.split('T')[0];     // "2026-02-08"

        const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
        const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);

        const start = new Date(startYear, startMonth - 1, startDay);
        const end = new Date(endYear, endMonth - 1, endDay);

        console.log('📅 Parsed dates:', {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
          startDay: start.getDay(),
          endDay: end.getDay()
        });

        // Map day_of_week to JS day number
        const dayMapping: Record<string, number> = {
          'sunday': 0,
          'monday': 1,
          'tuesday': 2,
          'wednesday': 3,
          'thursday': 4,
          'friday': 5,
          'saturday': 6,
        };

        const targetDay = dayMapping[assignment.day_of_week];

        if (targetDay === undefined) {
          console.warn('⚠️ Unknown day_of_week:', assignment.day_of_week);
          return;
        }

        // For each day in the assignment range
        let currentDate = new Date(start);
        while (currentDate <= end) {
          const dayOfWeek = currentDate.getDay();

          // Only add if day matches
          if (dayOfWeek === targetDay) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            if (!map[dateStr]) {
              map[dateStr] = [];
            }
            map[dateStr].push(assignment);
            console.log('✅ Added assignment to date:', dateStr, 'day:', assignment.day_of_week, 'dayOfWeek:', dayOfWeek);
          }

          // Move to next day
          currentDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });

      console.log('📅 Assignments by date:', map);
      console.log('📅 Dates with assignments:', Object.keys(map));
    }
    return map;
  }, [scheduleData]);

  // Navigate months
  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth() + 1);
    setSelectedYear(today.getFullYear());
  };

  // Get month name
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === selectedMonth - 1;
  };

  // Get assignments for a date
  const getAssignmentsForDate = (date: Date): TeachingAssignment[] => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return assignmentsByDate[dateStr] || [];
  };

  // Get assignments for selected date
  const selectedDateAssignments = useMemo(() => {
    if (!selectedDate) return [];
    return assignmentsByDate[selectedDate] || [];
  }, [selectedDate, assignmentsByDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lịch giảng viên</h1>
            <p className="text-sm text-gray-500">Xem lịch giảng dạy theo tháng</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Chọn giảng viên"
              value={selectedLecturerId?.toString() || ''}
              onChange={(e) => {
                const lecturerId = e.target.value ? Number(e.target.value) : null;
                setSelectedLecturerId(lecturerId);
              }}
            >
              <option value="">-- Chọn giảng viên --</option>
              {lecturersAsync.data?.data?.map((lecturer: Lecturer) => (
                <option key={lecturer.id} value={lecturer.id}>
                  {lecturer.hoTen || lecturer.ho_ten} {lecturer.trinhDoChuyenMon && `(${lecturer.trinhDoChuyenMon})`}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {selectedLecturerId && (
        <>
          {/* Calendar Controls */}
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">
                  {monthNames[selectedMonth - 1]} {selectedYear}
                </h2>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousMonth}
                    className="px-2 py-1"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    className="px-3 py-1 text-xs"
                  >
                    Hôm nay
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextMonth}
                    className="px-2 py-1"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="border rounded-lg overflow-hidden shadow-sm">
                {/* Day headers */}
                <div className="grid grid-cols-7 bg-gradient-to-r from-gray-100 to-gray-50 border-b">
                  {dayLabels.map((day, index) => (
                    <div
                      key={index}
                      className="py-2 text-center text-xs font-bold text-gray-700 border-r last:border-r-0"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7">
                  {daysInMonth.map((date, index) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;

                    const assignments = getAssignmentsForDate(date);
                    const hasAssignments = assignments.length > 0;
                    const isTodayDate = isToday(date);
                    const isInCurrentMonth = isCurrentMonth(date);

                    return (
                      <div
                        key={index}
                        className={`min-h-[70px] border-r border-b last:border-r-0 p-1.5 cursor-pointer transition-all duration-200 ${
                          !isInCurrentMonth ? 'bg-gray-50/50' : 'bg-white hover:bg-blue-50/30'
                        } ${
                          selectedDate === dateStr ? 'ring-2 ring-blue-400 bg-blue-50/50' : ''
                        }`}
                        onClick={() => setSelectedDate(dateStr)}
                      >
                        <div className="flex flex-col h-full">
                          <div className={`text-xs font-semibold mb-0.5 inline-flex items-center justify-center ${
                            isTodayDate 
                              ? 'bg-blue-500 text-white w-6 h-6 rounded-full' 
                              : hasAssignments 
                                ? 'bg-red-500 text-white w-6 h-6 rounded-full'
                                : !isInCurrentMonth 
                                  ? 'text-gray-400' 
                                  : 'text-gray-700'
                          }`}>
                            {date.getDate()}
                          </div>

                          {hasAssignments && (
                            <div className="space-y-0.5 flex-1 overflow-hidden">
                              {assignments.slice(0, 1).map((assignment, idx) => (
                                <div
                                  key={idx}
                                  className="text-[10px] bg-red-50 border border-red-200 rounded px-1 py-0.5 truncate"
                                  title={`${assignment.course_name} - ${formatters.formatTime(assignment.start_time)}-${formatters.formatTime(assignment.end_time)}`}
                                >
                                  <div className="font-medium text-red-900 truncate">
                                    {assignment.course_name}
                                  </div>
                                  <div className="text-red-700 truncate">
                                    {formatters.formatTime(assignment.start_time)}
                                  </div>
                                </div>
                              ))}
                              {assignments.length > 1 && (
                                <div className="text-[10px] text-red-600 font-semibold px-1">
                                  +{assignments.length - 1} lớp
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-3 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Hôm nay</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Có lịch dạy</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Selected Date Details */}
          {selectedDate && selectedDateAssignments.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Chi tiết lịch giảng dạy - {formatters.formatDate(selectedDate)}
                </h3>
                <div className="space-y-4">
                  {selectedDateAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="border rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-2">
                            {assignment.course_name}
                          </h4>
                          <div className="space-y-2 text-sm">
                            {assignment.course_code && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <AcademicCapIcon className="w-4 h-4" />
                                <span>Mã HP: {assignment.course_code}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600">
                              <ClockIcon className="w-4 h-4" />
                              <span>
                                {formatters.formatTime(assignment.start_time)} - {formatters.formatTime(assignment.end_time)}
                              </span>
                            </div>
                            {assignment.room && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPinIcon className="w-4 h-4" />
                                <span>Phòng: {assignment.room}</span>
                              </div>
                            )}
                            {assignment.class_name && (
                              <div className="text-gray-600">
                                Lớp: {assignment.class_name}
                              </div>
                            )}
                            {assignment.student_count > 0 && (
                              <div className="text-gray-600">
                                Số sinh viên: {assignment.student_count}
                              </div>
                            )}
                            {assignment.notes && (
                              <div className="text-gray-600">
                                Ghi chú: {assignment.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          assignment.status === 'in_progress' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : assignment.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : assignment.status === 'in_exam'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                        }`}>
                          {assignment.status === 'in_progress' && 'Đang diễn ra'}
                          {assignment.status === 'cancelled' && 'Đã hủy'}
                          {assignment.status === 'in_exam' && 'Đang thi'}
                          {assignment.status === 'paid' && 'Đã thanh toán'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Loading state */}
          {isLoadingSchedule && (
            <div className="text-center py-8 text-gray-500">
              Đang tải lịch giảng dạy...
            </div>
          )}

          {/* Empty state */}
          {!isLoadingSchedule && scheduleData?.data && scheduleData.data.length === 0 && (
            <Card>
              <div className="p-8 text-center text-gray-500">
                Không có lịch giảng dạy trong tháng này
              </div>
            </Card>
          )}
        </>
      )}

      {/* No lecturer selected */}
      {!selectedLecturerId && (
        <Card>
          <div className="p-8 text-center text-gray-500">
            Vui lòng chọn giảng viên để xem lịch giảng dạy
          </div>
        </Card>
      )}
    </div>
  );
}
