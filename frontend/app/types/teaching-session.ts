import type { TeachingAssignment } from './teaching-assignment';
import type { Lecturer } from './lecturer';

export interface TeachingSession {
  id: number;
  teaching_assignment_id: number;
  lecturer_id: number;
  class_id?: number | null;
  session_date: string;
  start_time: string;
  end_time: string;
  room?: string;
  session_number: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  cancellation_reason?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  created_at?: string;
  updated_at?: string;

  // Relationships
  teachingAssignment?: TeachingAssignment;
  lecturer?: Lecturer;
}

export interface TeachingSessionFormData {
  teaching_assignment_id: number;
  lecturer_id?: number;
  class_id?: number | null;
  session_date: string;
  start_time: string;
  end_time: string;
  room?: string;
  session_number?: number;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  cancellation_reason?: string;
}

export interface TeachingSessionFilters {
  lecturer_id?: number;
  teaching_assignment_id?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export const SessionStatusLabels: Record<TeachingSession['status'], string> = {
  scheduled: 'Đã lên lịch',
  in_progress: 'Đang diễn ra',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy',
  rescheduled: 'Đã đổi lịch',
};

export const SessionStatusColors: Record<TeachingSession['status'], 'info' | 'success' | 'warning' | 'danger'> = {
  scheduled: 'info',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'danger',
  rescheduled: 'info',
};
