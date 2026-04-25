import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import {
  statsService,
  type LecturerTeachingStats,
  type ClassStudyStats,
} from '~/services/stats.service';
import { lecturerService } from '~/services/lecturer.service';
import { roomService } from '~/services/room.service';
import { courseService } from '~/services/course.service';
import { ABSENCE_REASON_LABELS, type AbsenceReason } from '~/services/lecturer-absence.service';
import type { Course } from '~/types/course';
import type { Room } from '~/types/room';

export function meta() {
  return [
    { title: 'Thống kê - VMU' },
    { name: 'description', content: 'Thống kê giảng viên và lớp' },
  ];
}

function StatCard({ title, value, color }: { title: string; value: number | string; color: string }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="caption" color="text.secondary">{title}</Typography>
      <Typography variant="h4" sx={{ color, fontWeight: 700 }}>{value}</Typography>
    </Paper>
  );
}

function SimpleList({ rows, label }: { rows: Array<{ label: string; sessions: number }>; label: string }) {
  if (rows.length === 0) {
    return <Typography color="text.secondary" sx={{ p: 2 }}>Chưa có dữ liệu</Typography>;
  }
  const max = Math.max(...rows.map((r) => r.sessions), 1);
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {rows.map((r, i) => (
          <Box key={i}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">{r.label}</Typography>
              <Typography variant="body2" fontWeight={600}>{r.sessions} buổi</Typography>
            </Box>
            <Box sx={{ height: 6, bgcolor: 'grey.200', borderRadius: 1 }}>
              <Box sx={{ height: '100%', width: `${(r.sessions / max) * 100}%`, bgcolor: 'primary.main', borderRadius: 1 }} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function StatsPage() {
  const [tab, setTab] = useState<'lecturer' | 'class'>('lecturer');
  const [lecturers, setLecturers] = useState<Array<{ id: number; hoTen: string }>>([]);
  const [classes, setClasses] = useState<Room[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [lecturerId, setLecturerId] = useState<number | ''>('');
  const [classId, setClassId] = useState<number | ''>('');
  const [courseId, setCourseId] = useState<number | ''>('');

  const [lecturerStats, setLecturerStats] = useState<LecturerTeachingStats | null>(null);
  const [classStats, setClassStats] = useState<ClassStudyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadInitial();
  }, []);

  useEffect(() => {
    if (tab === 'lecturer' && lecturerId) {
      void loadLecturerStats();
    }
  }, [tab, lecturerId, courseId]);

  useEffect(() => {
    if (tab === 'class' && classId) {
      void loadClassStats();
    }
  }, [tab, classId, courseId]);

  async function loadInitial() {
    try {
      const [lectData, classData, courseData] = await Promise.all([
        lecturerService.getSimpleLecturers(),
        roomService.getClasses(),
        courseService.getSimpleCourses(),
      ]);
      setLecturers(lectData);
      setClasses(classData);
      setCourses(courseData);
    } catch (err: any) {
      setError(err?.message || 'Không tải được danh mục');
    }
  }

  async function loadLecturerStats() {
    if (!lecturerId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await statsService.lecturerTeaching(
        Number(lecturerId),
        courseId ? Number(courseId) : undefined,
      );
      setLecturerStats(data);
    } catch (err: any) {
      setError(err?.message || 'Không tải được thống kê GV');
    } finally {
      setLoading(false);
    }
  }

  async function loadClassStats() {
    if (!classId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await statsService.classStudy(
        Number(classId),
        courseId ? Number(courseId) : undefined,
      );
      setClassStats(data);
    } catch (err: any) {
      setError(err?.message || 'Không tải được thống kê lớp');
    } finally {
      setLoading(false);
    }
  }

  const lecturerSubjectRows = useMemo(
    () => (lecturerStats?.by_subject ?? []).map((r) => ({ label: r.subject_name || '—', sessions: r.sessions })),
    [lecturerStats],
  );
  const lecturerClassRows = useMemo(
    () => (lecturerStats?.by_class ?? []).map((r) => ({ label: r.class_name || `Lớp #${r.class_id}`, sessions: r.sessions })),
    [lecturerStats],
  );
  const classSubjectRows = useMemo(
    () => (classStats?.by_subject ?? []).map((r) => ({ label: r.subject_name || '—', sessions: r.sessions })),
    [classStats],
  );
  const classLecturerRows = useMemo(
    () => (classStats?.by_lecturer ?? []).map((r) => ({ label: r.lecturer_name || `GV #${r.lecturer_id}`, sessions: r.sessions })),
    [classStats],
  );

  return (
    <Box className="p-6 space-y-4">
      <Box className="flex items-center gap-3">
        <Box className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
          <ChartBarIcon className="w-6 h-6 text-white" />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>Thống kê giảng dạy</Typography>
          <Typography variant="body2" color="text.secondary">Số buổi giảng viên đã dạy & số buổi lớp đã học</Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <Paper>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab value="lecturer" label="Theo giảng viên" />
          <Tab value="class" label="Theo lớp" />
        </Tabs>

        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {tab === 'lecturer' ? (
            <FormControl size="small" sx={{ minWidth: 260 }}>
              <InputLabel>Giảng viên</InputLabel>
              <Select
                label="Giảng viên"
                value={lecturerId}
                onChange={(e) => setLecturerId(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <MenuItem value="">— Chọn —</MenuItem>
                {lecturers.map((l) => (
                  <MenuItem key={l.id} value={l.id}>{l.hoTen}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl size="small" sx={{ minWidth: 260 }}>
              <InputLabel>Lớp</InputLabel>
              <Select
                label="Lớp"
                value={classId}
                onChange={(e) => setClassId(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <MenuItem value="">— Chọn —</MenuItem>
                {classes.map((c: any) => (
                  <MenuItem key={c.id} value={c.id}>{c.class_name || c.ten_lop || c.id}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Năm học (tuỳ chọn)</InputLabel>
            <Select
              label="Năm học (tuỳ chọn)"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {courses.map((c: any) => (
                <MenuItem key={c.id} value={c.id}>{c.ten_khoa_hoc || c.ma_khoa_hoc || c.id}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {loading && (
        <Box className="flex justify-center py-8">
          <CircularProgress />
        </Box>
      )}

      {!loading && tab === 'lecturer' && lecturerStats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <StatCard title="Tổng số buổi đã dạy" value={lecturerStats.total_sessions} color="#1976d2" />
            <StatCard title="Số ngày đã nghỉ" value={lecturerStats.absences_count} color="#d32f2f" />
          </Box>
          <Paper sx={{ p: 2 }}>
            <SimpleList rows={lecturerSubjectRows} label="Phân bổ theo môn" />
          </Paper>
          <Paper sx={{ p: 2 }}>
            <SimpleList rows={lecturerClassRows} label="Phân bổ theo lớp" />
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Lịch sử nghỉ gần nhất</Typography>
            {lecturerStats.absences.length === 0 ? (
              <Typography color="text.secondary">Không có ngày nghỉ nào</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {lecturerStats.absences.slice(0, 10).map((a) => (
                  <Box key={a.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">{new Date(a.absence_date).toLocaleDateString('vi-VN')}</Typography>
                    <Chip size="small" label={ABSENCE_REASON_LABELS[a.reason as AbsenceReason] ?? a.reason} />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {!loading && tab === 'class' && classStats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <StatCard title="Tổng số buổi đã học" value={classStats.total_sessions} color="#2e7d32" />
            <StatCard title="Số môn khác nhau" value={classStats.by_subject.length} color="#7b1fa2" />
          </Box>
          <Paper sx={{ p: 2 }}>
            <SimpleList rows={classSubjectRows} label="Phân bổ theo môn" />
          </Paper>
          <Paper sx={{ p: 2 }}>
            <SimpleList rows={classLecturerRows} label="Phân bổ theo giảng viên" />
          </Paper>
        </Box>
      )}
    </Box>
  );
}
