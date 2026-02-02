import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { teachingSessionService } from '~/services/teaching-session.service';
import { lecturerService } from '~/services/lecturer.service';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import type { TeachingSession } from '~/types/teaching-session';
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
  ArrowPathIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Card } from '~/components/ui/Card';
import { Select } from '~/components/ui/Select';
import { Modal } from '~/components/ui/Modal';
import { Input } from '~/components/ui/Input';
import { Toast } from '~/components/ui/Toast';
import type { ToastType } from '~/components/ui/Toast';

export function meta() {
  return [
    { title: "Lịch giảng viên - VMU" },
    { name: "description", content: "Xem lịch giảng dạy của giảng viên theo tháng" },
  ];
}

export default function LecturerCalendarPage() {
  const navigate = useNavigate();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedLecturerId, setSelectedLecturerId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Reschedule modal state
  const rescheduleModal = useModal();
  const [sessionToReschedule, setSessionToReschedule] = useState<TeachingSession | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Load lecturers
  const lecturersAsync = useAsync(
    () => lecturerService.getList({ per_page: 1000 }),
    { immediate: true }
  );

  // State for schedule data (now using sessions)
  const [sessionsData, setSessionsData] = useState<PaginatedResponse<TeachingSession> | null>(null);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  // Load schedule when lecturer or month changes
  useEffect(() => {
    const loadSchedule = async () => {
      if (!selectedLecturerId) {
        setSessionsData(null);
        return;
      }

      setIsLoadingSchedule(true);
      try {
        // Calculate date range for the month
        const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
        const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        console.log('📅 Loading sessions for:', {
          lecturerId: selectedLecturerId,
          month: selectedMonth,
          year: selectedYear,
          startDate,
          endDate,
        });

        // Fetch sessions for this lecturer and month
        const result = await teachingSessionService.getLecturerSessions(
          selectedLecturerId,
          startDate,
          endDate
        );

        console.log('📊 Received sessions:', result.data?.length || 0);

        setSessionsData(result);
      } catch (error) {
        console.error('❌ Error loading sessions:', error);
        setSessionsData(null);
      } finally {
        setIsLoadingSchedule(false);
      }
    };

    loadSchedule();
  }, [selectedLecturerId, selectedMonth, selectedYear]);

  // Get days in month - ONLY current month days
  const daysInMonth = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    const daysArray: Date[] = [];

    // Only add current month days (no prev/next month padding)
    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysArray.push(new Date(selectedYear, selectedMonth - 1, i));
    }


    return daysArray;
  }, [selectedMonth, selectedYear]);

  // Get sessions by date - MUCH SIMPLER with sessions!
  const sessionsByDate = useMemo(() => {
    const map: Record<string, TeachingSession[]> = {};
    const sessions = sessionsData?.data || [];

    console.log('🔍 sessionsByDate memo running', {
      sessionsDataExists: !!sessionsData,
      sessionsCount: sessions.length,
      selectedMonth,
      selectedYear,
    });

    if (sessions && sessions.length > 0) {
      console.log('📅 Processing sessions:', sessions.length);

      sessions.forEach((session: TeachingSession) => {
        // ⚠️ IMPORTANT: Skip "rescheduled" sessions - they shouldn't appear on original date
        // These will be auto-updated to "completed" when past due
        if (session.status === 'rescheduled') {
          console.log('⏭️ Skipping rescheduled session:', session.id, 'on', session.session_date);
          return;
        }

        // Backend returns snake_case
        const teachingAssignment = (session as any).teaching_assignment || session.teachingAssignment;

        // ⚠️ Skip sessions without teaching_assignment (orphaned sessions)
        if (!teachingAssignment) {
          console.warn('⚠️ Session has no teaching_assignment:', {
            sessionId: session.id,
            assignmentId: session.teaching_assignment_id,
            date: session.session_date,
          });
          return;
        }

        // Session already has exact date!
        const dateStr = session.session_date.split('T')[0]; // "2026-01-20"

        if (!map[dateStr]) {
          map[dateStr] = [];
        }
        map[dateStr].push(session);

        console.log('✅ Added session to date:', dateStr, 'course:', teachingAssignment?.course_name, 'status:', session.status);
      });

      console.log('📅 Sessions by date:', Object.keys(map).length, 'dates');
      console.log('📅 Dates:', Object.keys(map).sort());
    } else {
      console.log('⚠️ No sessions data to process');
    }
    return map;
  }, [sessionsData, selectedMonth, selectedYear]);

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

  // Get sessions for selected date
  const selectedDateSessions = useMemo(() => {
    if (!selectedDate) return [];
    return sessionsByDate[selectedDate] || [];
  }, [selectedDate, sessionsByDate]);

  // Handle reschedule
  const handleRescheduleClick = (session: TeachingSession) => {
    setSessionToReschedule(session);
    setNewDate('');
    rescheduleModal.open();
  };

  const handleRescheduleSubmit = async () => {
    if (!sessionToReschedule || !newDate) {
      setToast({ message: 'Vui lòng chọn ngày mới', type: 'error' });
      return;
    }

    setIsRescheduling(true);
    try {
      console.log('🔄 Rescheduling session:', {
        sessionId: sessionToReschedule.id,
        oldDate: sessionToReschedule.session_date,
        newDate: newDate,
      });

      // Update the session with new date
      await teachingSessionService.update(sessionToReschedule.id, {
        session_date: newDate,
        status: 'rescheduled',
      } as any);

      setToast({ message: 'Đã đổi lịch thành công', type: 'success' });
      rescheduleModal.close();

      // Reload sessions
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const result = await teachingSessionService.getLecturerSessions(
        selectedLecturerId!,
        startDate,
        endDate
      );
      setSessionsData(result);
      setSelectedDate(null);
    } catch (error: any) {
      console.error('❌ Error rescheduling:', error);
      setToast({ message: error.message || 'Có lỗi xảy ra khi đổi lịch', type: 'error' });
    } finally {
      setIsRescheduling(false);
    }
  };

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
          {/* Warning for orphaned sessions */}
          {(() => {
            const orphanedSessions = sessionsData?.data?.filter(s => {
              const assignment = (s as any).teaching_assignment || s.teachingAssignment;
              return !assignment;
            }) || [];

            if (orphanedSessions.length === 0) return null;
          })()}

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

                {/* Calendar days - organized by weeks */}
                <div className="grid grid-cols-7">
                  {/* Empty cells for days before first day of month */}
                  {(() => {
                    const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
                    const firstDayOfWeek = firstDayOfMonth.getDay();
                    // Convert Sunday=0 to Monday=0 system
                    const emptyCells = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
                    return Array.from({ length: emptyCells }).map((_, index) => (
                      <div key={`empty-${index}`} className="min-h-[80px] border-r border-b bg-gray-50/30"></div>
                    ));
                  })()}

                  {/* Actual days of the month */}
                  {daysInMonth.map((date, index) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;

                    const sessions = sessionsByDate[dateStr] || [];
                    const hasSessions = sessions.length > 0;
                    const isTodayDate = isToday(date);

                    // Debug log for first few days
                    if (index < 5) {
                      console.log(`📆 Date ${dateStr}:`, {
                        hasSessions,
                        sessionsCount: sessions.length,
                        sessions: sessions.map(s => ({
                          id: s.id,
                          date: s.session_date,
                          course: s.teachingAssignment?.course_name
                        }))
                      });
                    }

                    return (
                      <div
                        key={index}
                        className={`min-h-[80px] border-r border-b p-2 cursor-pointer transition-all duration-200 bg-white hover:bg-blue-50/30 ${
                          selectedDate === dateStr ? 'ring-2 ring-blue-400 bg-blue-50/50' : ''
                        }`}
                        onClick={() => setSelectedDate(dateStr)}
                      >
                        <div className="flex flex-col h-full">
                          <div className={`text-sm font-semibold mb-1 inline-flex items-center justify-center ${
                            isTodayDate 
                              ? 'bg-blue-500 text-white w-7 h-7 rounded-full' 
                              : hasSessions 
                                ? 'bg-red-500 text-white w-7 h-7 rounded-full'
                                : 'text-gray-700'
                          }`}>
                            {date.getDate()}
                          </div>

                          {hasSessions && (
                            <div className="space-y-1 flex-1 overflow-hidden">
                              {sessions.slice(0, 2).map((session, idx) => {
                                // Backend returns snake_case
                                const teachingAssignment = (session as any).teaching_assignment || session.teachingAssignment;
                                const courseName = teachingAssignment?.course_name || '⚠️ Không có dữ liệu';
                                const isOrphaned = !teachingAssignment;

                                return (
                                  <div
                                    key={idx}
                                    className={`text-[10px] border rounded px-1.5 py-0.5 truncate ${
                                      isOrphaned 
                                        ? 'bg-yellow-50 border-yellow-300 text-yellow-900'
                                        : 'bg-red-50 border-red-200'
                                    }`}
                                    title={isOrphaned
                                      ? '⚠️ Session không có assignment - Cần kiểm tra!'
                                      : `${courseName} - ${formatters.formatTime(session.start_time)}-${formatters.formatTime(session.end_time)}`
                                    }
                                  >
                                    <div className={`font-medium truncate ${isOrphaned ? 'text-yellow-900' : 'text-red-900'}`}>
                                      {courseName}
                                    </div>
                                    <div className={`truncate ${isOrphaned ? 'text-yellow-700' : 'text-red-700'}`}>
                                      {formatters.formatTime(session.start_time)}
                                    </div>
                                  </div>
                                );
                              })}
                              {sessions.length > 2 && (
                                <div className="text-[10px] text-red-600 font-semibold px-1">
                                  +{sessions.length - 2} buổi
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
          {selectedDate && selectedDateSessions.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Chi tiết lịch giảng dạy - {formatters.formatDate(selectedDate)}
                </h3>
                <div className="space-y-4">
                  {selectedDateSessions.map((session) => {
                    // Backend returns snake_case, so we need to access it correctly
                    const teachingAssignment = (session as any).teaching_assignment || session.teachingAssignment;
                    const courseName = teachingAssignment?.course_name || '⚠️ Không có dữ liệu khóa học';
                    const courseCode = teachingAssignment?.course_code;
                    const isOrphaned = !teachingAssignment;

                    return (
                      <div
                        key={session.id}
                        className={`border rounded-lg p-4 transition-colors ${
                          isOrphaned 
                            ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400' 
                            : 'hover:border-blue-300'
                        }`}
                      >
                        {isOrphaned && (
                          <div className="mb-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-900">
                            ⚠️ <strong>Cảnh báo:</strong> Buổi học này không liên kết với khóa học. Assignment ID: {session.teaching_assignment_id}
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-gray-900">
                                {courseName}
                              </h4>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                Buổi #{session.session_number}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {courseCode && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <AcademicCapIcon className="w-4 h-4 flex-shrink-0" />
                                  <span>Mã HP: {courseCode}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-gray-600">
                                <ClockIcon className="w-4 h-4 flex-shrink-0" />
                                <span>
                                  {formatters.formatTime(session.start_time)} - {formatters.formatTime(session.end_time)}
                                </span>
                              </div>
                              {session.room && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                                  <span>Phòng: {session.room}</span>
                                </div>
                              )}
                              {session.notes && (
                                <div className="text-gray-600 col-span-2">
                                  Ghi chú: {session.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              session.status === 'scheduled' 
                                ? 'bg-blue-100 text-blue-800'
                                : session.status === 'in_progress'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : session.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : session.status === 'cancelled'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-purple-100 text-purple-800'
                            }`}>
                              {session.status === 'scheduled' && 'Đã lên lịch'}
                              {session.status === 'in_progress' && 'Đang diễn ra'}
                              {session.status === 'completed' && 'Đã hoàn thành'}
                              {session.status === 'cancelled' && 'Đã hủy'}
                              {session.status === 'rescheduled' && 'Đã đổi lịch'}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRescheduleClick(session)}
                              className="flex items-center gap-1"
                            >
                              <ArrowPathIcon className="w-4 h-4" />
                              Đổi lịch
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
          {!isLoadingSchedule && sessionsData?.data && sessionsData.data.length === 0 && (
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

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModal.isOpen}
        onClose={rescheduleModal.close}
        title="Đổi lịch buổi học"
      >
        {sessionToReschedule && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-gray-900">
                  {((sessionToReschedule as any).teaching_assignment || sessionToReschedule.teachingAssignment)?.course_name || 'Không rõ'}
                </h4>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  Buổi #{sessionToReschedule.session_number}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <span className="font-medium">Ngày hiện tại:</span> {formatters.formatDate(sessionToReschedule.session_date)}
                </div>
                <div>
                  <span className="font-medium">Thời gian:</span> {formatters.formatTime(sessionToReschedule.start_time)} - {formatters.formatTime(sessionToReschedule.end_time)}
                </div>
                {sessionToReschedule.room && (
                  <div>
                    <span className="font-medium">Phòng:</span> {sessionToReschedule.room}
                  </div>
                )}
              </div>
            </div>

            <Input
              label="Chọn ngày mới"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />

            <div className="text-xs text-gray-500">
              💡 Chỉ buổi học này sẽ được đổi lịch, các buổi khác không bị ảnh hưởng
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={rescheduleModal.close}
                disabled={isRescheduling}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleRescheduleSubmit}
                disabled={isRescheduling || !newDate}
              >
                {isRescheduling ? 'Đang xử lý...' : 'Xác nhận đổi lịch'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Teaching History Tracking Table */}
      {selectedLecturerId && sessionsData?.data && sessionsData.data.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              Bảng theo dõi buổi học trong tháng
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3 font-semibold text-gray-700">STT</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Buổi</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Môn học</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Mã HP</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Ngày học</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Thời gian</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Phòng</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionsData.data.map((session, index) => {
                    // Backend returns snake_case, so we need to access it correctly
                    const teachingAssignment = (session as any).teaching_assignment || session.teachingAssignment;
                    const courseName = teachingAssignment?.course_name || '⚠️ Không có dữ liệu';
                    const courseCode = teachingAssignment?.course_code;
                    const isOrphaned = !teachingAssignment;

                    return (
                      <tr key={session.id} className={`border-b transition-colors ${
                        isOrphaned ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'
                      }`}>
                        <td className="p-3 text-gray-600">{index + 1}</td>
                        <td className="p-3">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            #{session.session_number}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`font-medium ${isOrphaned ? 'text-yellow-900' : 'text-gray-900'}`}>
                            {courseName}
                          </span>
                          {isOrphaned && (
                            <span className="ml-2 text-xs text-yellow-600">
                              (Assignment ID: {session.teaching_assignment_id})
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-gray-600">{courseCode || '-'}</td>
                        <td className="p-3 text-gray-600">
                          {formatters.formatDate(session.session_date)}
                        </td>
                        <td className="p-3 text-gray-600">
                          <div className="text-xs">
                            {formatters.formatTime(session.start_time)} - {formatters.formatTime(session.end_time)}
                          </div>
                        </td>
                        <td className="p-3 text-gray-600">{session.room || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.status === 'scheduled' 
                              ? 'bg-blue-100 text-blue-800'
                              : session.status === 'in_progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : session.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : session.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-purple-100 text-purple-800'
                          }`}>
                            {session.status === 'scheduled' && 'Đã lên lịch'}
                            {session.status === 'in_progress' && 'Đang diễn ra'}
                            {session.status === 'completed' && 'Hoàn thành'}
                            {session.status === 'cancelled' && 'Đã hủy'}
                            {session.status === 'rescheduled' && 'Đã đổi lịch'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Tổng buổi học</div>
                  <div className="text-xl font-bold text-gray-900">{sessionsData.data.length}</div>
                </div>
                <div>
                  <div className="text-gray-600">Đã lên lịch</div>
                  <div className="text-xl font-bold text-blue-600">
                    {sessionsData.data.filter(s => s.status === 'scheduled').length}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Đang diễn ra</div>
                  <div className="text-xl font-bold text-yellow-600">
                    {sessionsData.data.filter(s => s.status === 'in_progress').length}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Hoàn thành</div>
                  <div className="text-xl font-bold text-green-600">
                    {sessionsData.data.filter(s => s.status === 'completed').length}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Đã đổi lịch</div>
                  <div className="text-xl font-bold text-purple-600">
                    {sessionsData.data.filter(s => s.status === 'rescheduled').length}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section - Show assignments ready for payment */}
            {(() => {
              // Get unique teaching assignments and check their status
              // Use Set to track which assignment IDs we've already added to avoid duplicates
              const assignmentsMap = new Map<number, any>();

              sessionsData.data.forEach(session => {
                const assignment = (session as any).teaching_assignment || session.teachingAssignment;

                // Only add if:
                // 1. Assignment exists (not orphaned)
                // 2. We haven't added this assignment yet (by ID)
                // 3. Assignment status is 'in_exam'
                if (assignment && assignment.status === 'in_exam' && !assignmentsMap.has(assignment.id)) {
                  assignmentsMap.set(assignment.id, assignment);
                }
              });

              const assignmentsInExam = Array.from(assignmentsMap.values());

              if (assignmentsInExam.length === 0) return null;

              return (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-bold text-gray-900 flex items-center gap-2">
                      <BanknotesIcon className="w-5 h-5 text-green-600" />
                      Khóa học sẵn sàng thanh toán ({assignmentsInExam.length})
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {assignmentsInExam.map((assignment: any) => {
                      // Count sessions for this assignment
                      const sessionCount = sessionsData.data.filter(
                        s => s.teaching_assignment_id === assignment.id
                      ).length;

                      return (
                        <div
                          key={assignment.id}
                          className="bg-green-50 border border-green-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 mb-1">
                                {assignment.course_name}
                              </div>
                              <div className="text-sm text-gray-600 mb-1">
                                Mã HP: {assignment.course_code} | Lớp: {assignment.class_name || 'N/A'}
                              </div>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-green-700">
                                  ✅ Tất cả buổi học đã hoàn thành - Đang trong kỳ thi
                                </span>
                                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                  {sessionCount} buổi học
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => navigate('/teachers/salaries', {
                                state: {
                                  autoFillAssignment: {
                                    assignmentId: assignment.id,
                                    lecturerId: assignment.lecturer_id,
                                    subjectId: assignment.subject_id,
                                    classId: assignment.class_id,
                                    courseName: assignment.course_name,
                                    courseCode: assignment.course_code,
                                    className: assignment.class_name
                                  }
                                }
                              })}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 ml-4"
                            >
                              <BanknotesIcon className="w-4 h-4" />
                              Thanh toán
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </Card>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
