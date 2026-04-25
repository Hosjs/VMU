import { apiService } from './api.service';

export interface SubjectBreakdown {
  subject_id: number | null;
  subject_name: string | null;
  sessions: number;
}

export interface ClassBreakdown {
  class_id: number;
  class_name: string | null;
  sessions: number;
}

export interface LecturerBreakdown {
  lecturer_id: number;
  lecturer_name: string | null;
  sessions: number;
}

export interface AbsenceLite {
  id: number;
  absence_date: string;
  reason: string;
  note: string | null;
}

export interface LecturerTeachingStats {
  total_sessions: number;
  by_subject: SubjectBreakdown[];
  by_class: ClassBreakdown[];
  absences: AbsenceLite[];
  absences_count: number;
}

export interface ClassStudyStats {
  total_sessions: number;
  by_subject: SubjectBreakdown[];
  by_lecturer: LecturerBreakdown[];
}

class StatsService {
  lecturerTeaching(lecturerId: number, khoaHocId?: number): Promise<LecturerTeachingStats> {
    return apiService.get<LecturerTeachingStats>(
      `/lecturers/${lecturerId}/teaching-stats`,
      khoaHocId ? { khoa_hoc_id: khoaHocId } : undefined,
    );
  }

  classStudy(classId: number, khoaHocId?: number): Promise<ClassStudyStats> {
    return apiService.get<ClassStudyStats>(
      `/classes/${classId}/study-stats`,
      khoaHocId ? { khoa_hoc_id: khoaHocId } : undefined,
    );
  }
}

export const statsService = new StatsService();
