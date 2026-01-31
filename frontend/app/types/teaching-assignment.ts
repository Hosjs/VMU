import type { Lecturer } from './lecturer';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TeachingAssignment {
  id: number;
  lecturer_id: number;
  course_code?: string;
  course_name: string;
  credits: number;
  start_date: string;
  end_date: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  room?: string;
  class_name?: string;
  class_id?: number | string;  // Add class_id for linking to student list
  student_count: number;
  status: 'in_progress' | 'cancelled' | 'in_exam' | 'paid';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  lecturer?: Lecturer;
}

export interface DaySchedule {
  day_of_week: DayOfWeek;
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
  status?: 'in_progress' | 'cancelled' | 'in_exam' | 'paid';
  notes?: string;
}

export interface TeachingAssignmentFilters {
  lecturer_id?: number;
  status?: string;
  day_of_week?: DayOfWeek;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export const DayOfWeekLabels: Record<'saturday' | 'sunday', string> = {
  saturday: 'Thứ 7',
  sunday: 'Chủ nhật',
};

export const StatusLabels: Record<'in_progress' | 'cancelled' | 'in_exam' | 'paid', string> = {
  in_progress: 'Đang diễn ra',
  cancelled: 'Đã hủy',
  in_exam: 'Đang thi',
  paid: 'Đã thanh toán',
};

export const StatusColors: Record<'in_progress' | 'cancelled' | 'in_exam' | 'paid', 'info' | 'success' | 'warning' | 'danger'> = {
  in_progress: 'warning',
  cancelled: 'danger',
  in_exam: 'info',
  paid: 'success',
};
