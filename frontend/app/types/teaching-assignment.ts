import type { Lecturer } from './lecturer';

export interface TeachingAssignment {
  id: number;
  lecturer_id: number;
  course_code?: string;
  course_name: string;
  credits: number;
  start_date: string;
  end_date: string;
  day_of_week: 'saturday' | 'sunday';
  start_time: string;
  end_time: string;
  room?: string;
  class_name?: string;
  class_id?: number | string;  // Add class_id for linking to student list
  student_count: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  lecturer?: Lecturer;
}

export interface DaySchedule {
  day_of_week: 'saturday' | 'sunday';
  start_time: string;
  end_time: string;
  room?: string;
}

export interface TeachingAssignmentFormData {
  lecturer_id: number;
  course_code?: string;
  course_name: string;
  credits?: number;
  start_date: string;
  end_date: string;
  days_schedule: DaySchedule[];
  class_name?: string;
  student_count?: number;
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
}

export interface TeachingAssignmentFilters {
  lecturer_id?: number;
  status?: string;
  day_of_week?: 'saturday' | 'sunday';
  start_date?: string;
  end_date?: string;
  search?: string;
}

export const DayOfWeekLabels: Record<'saturday' | 'sunday', string> = {
  saturday: 'Thứ 7',
  sunday: 'Chủ nhật',
};

export const StatusLabels: Record<'scheduled' | 'ongoing' | 'completed' | 'cancelled', string> = {
  scheduled: 'Đã lên lịch',
  ongoing: 'Đang diễn ra',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy',
};

export const StatusColors: Record<'scheduled' | 'ongoing' | 'completed' | 'cancelled', 'info' | 'success' | 'warning' | 'danger'> = {
  scheduled: 'info',
  ongoing: 'warning',
  completed: 'success',
  cancelled: 'danger',
};
