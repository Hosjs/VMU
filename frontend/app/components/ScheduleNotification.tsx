import { useState, useEffect } from 'react';
import { teachingAssignmentService } from '~/services/teaching-assignment.service';
import type { TeachingAssignment } from '~/types/teaching-assignment';
import {
  BellIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

export function ScheduleNotification() {
  const [todaySchedules, setTodaySchedules] = useState<TeachingAssignment[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchTodaySchedules = async () => {
      try {
        const response = await teachingAssignmentService.getToday();
        if (response.success && response.data.length > 0) {
          setTodaySchedules(response.data);
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error fetching today schedules:', error);
      }
    };

    fetchTodaySchedules();

    // Refresh every 30 minutes
    const interval = setInterval(fetchTodaySchedules, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: string) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const getDayLabel = (day: string) => {
    return day === 'saturday' ? 'Thứ 7' : 'Chủ nhật';
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || todaySchedules.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-white rounded-lg shadow-2xl border border-blue-200 overflow-hidden">
        {/* Header */}
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <BellIcon className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {todaySchedules.length}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">Lịch dạy hôm nay</h3>
              <p className="text-xs text-blue-100">
                Bạn có {todaySchedules.length} buổi học hôm nay
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-white hover:text-blue-100 transition"
            >
              <svg
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="text-white hover:text-blue-100 transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="max-h-96 overflow-y-auto">
            {todaySchedules.map((schedule, index) => (
              <div
                key={schedule.id}
                className={`p-4 ${index !== todaySchedules.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <div className="space-y-2">
                  {/* Course Name */}
                  <div className="font-semibold text-gray-900">
                    {schedule.course_name}
                  </div>

                  {/* Course Code & Class */}
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    {schedule.course_code && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                        {schedule.course_code}
                      </span>
                    )}
                    {schedule.class_name && (
                      <span className="text-gray-600">Lớp: {schedule.class_name}</span>
                    )}
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                    </span>
                  </div>

                  {/* Room */}
                  {schedule.room && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                      <span>Phòng {schedule.room}</span>
                    </div>
                  )}

                  {/* Lecturer (for students) or Student count (for lecturers) */}
                  {schedule.lecturer && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                      <span>{schedule.lecturer.hoTen || schedule.lecturer.ho_ten}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer - Quick Actions */}
        {isExpanded && (
          <div className="bg-gray-50 px-4 py-2 flex justify-end">
            <a
              href="/training/schedules"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              onClick={handleClose}
            >
              Xem tất cả lịch học →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

