import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
} from '@mui/x-data-grid';
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import {
  examScheduleService,
  type ExamSchedule,
  type ExamScheduleFormData,
  type ExamType,
} from '~/services/exam-schedule.service';
import { courseService } from '~/services/course.service';
import { lecturerService } from '~/services/lecturer.service';
import { roomService } from '~/services/room.service';
import { subjectService } from '~/services/subject.service';
import type { Course } from '~/types/course';
import type { Subject } from '~/types/subject';
import type { Room } from '~/types/room';

export function meta() {
  return [
    { title: 'Lịch thi - VMU' },
    { name: 'description', content: 'Quản lý lịch thi học kỳ' },
  ];
}

const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  regular: 'Chính thức',
  retake: 'Thi lại',
  makeup: 'Thi bù',
};

interface FormState extends ExamScheduleFormData {
  id?: number;
}

const emptyForm: FormState = {
  khoa_hoc_id: 0,
  subject_id: null,
  subject_name: '',
  class_id: null,
  class_name: '',
  exam_start: '',
  exam_end: '',
  room_id: null,
  room: '',
  supervisor_1_id: null,
  supervisor_2_id: null,
  exam_type: 'regular',
  note: '',
};

function toLocalInput(iso: string): string {
  // <input type="datetime-local"> needs YYYY-MM-DDTHH:mm with no timezone.
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ExamSchedulesPage() {
  const [rows, setRows] = useState<ExamSchedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Room[]>([]);
  const [lecturers, setLecturers] = useState<Array<{ id: number; hoTen: string }>>([]);

  const [filterCourse, setFilterCourse] = useState<number | ''>('');
  const [filterClass, setFilterClass] = useState<number | ''>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    void loadInitial();
  }, []);

  useEffect(() => {
    void loadList();
  }, [filterCourse, filterClass]);

  async function loadInitial() {
    try {
      setLoading(true);
      const [coursesData, classesData, lecturersData, subjectsData] = await Promise.all([
        courseService.getSimpleCourses(),
        roomService.getClasses(),
        lecturerService.getSimpleLecturers(),
        subjectService.getSubjects({ per_page: 1000 }),
      ]);
      setCourses(coursesData);
      setClasses(classesData);
      setLecturers(lecturersData);
      setSubjects(subjectsData.data || []);
    } catch (err: any) {
      setError(err?.message || 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  async function loadList() {
    try {
      setLoading(true);
      setError(null);
      const res = await examScheduleService.list({
        khoa_hoc_id: filterCourse || undefined,
        class_id: filterClass || undefined,
        per_page: 100,
      });
      setRows(res.data || []);
    } catch (err: any) {
      setError(err?.message || 'Không tải được lịch thi');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({
      ...emptyForm,
      khoa_hoc_id: typeof filterCourse === 'number' ? filterCourse : 0,
      class_id: typeof filterClass === 'number' ? filterClass : null,
    });
    setDialogOpen(true);
  }

  function openEdit(row: ExamSchedule) {
    setForm({
      id: row.id,
      khoa_hoc_id: row.khoa_hoc_id,
      subject_id: row.subject_id,
      subject_name: row.subject_name,
      class_id: row.class_id,
      class_name: row.class_name ?? '',
      exam_start: toLocalInput(row.exam_start),
      exam_end: toLocalInput(row.exam_end),
      room_id: row.room_id,
      room: row.room ?? '',
      supervisor_1_id: row.supervisor_1_id,
      supervisor_2_id: row.supervisor_2_id,
      exam_type: row.exam_type,
      note: row.note ?? '',
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setDialogOpen(false);
  }

  async function submitForm() {
    if (!form.khoa_hoc_id || !form.subject_name || !form.exam_start || !form.exam_end) {
      setError('Vui lòng nhập đủ Năm học, Môn thi, Giờ bắt đầu/kết thúc');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const payload: ExamScheduleFormData = {
        ...form,
        // datetime-local has no timezone; let backend treat as local time
        exam_start: form.exam_start,
        exam_end: form.exam_end,
      };
      if (form.id) {
        await examScheduleService.update(form.id, payload);
        setSuccess('Đã cập nhật lịch thi');
      } else {
        await examScheduleService.create(payload);
        setSuccess('Đã tạo lịch thi');
      }
      setDialogOpen(false);
      await loadList();
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await examScheduleService.remove(deleteId);
      setSuccess('Đã xoá lịch thi');
      setDeleteId(null);
      await loadList();
    } catch (err: any) {
      setError(err?.message || 'Xoá thất bại');
    }
  }

  const columns: GridColDef<ExamSchedule>[] = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'subject_name', headerName: 'Môn thi', flex: 1, minWidth: 200 },
    { field: 'class_name', headerName: 'Lớp', width: 140, valueGetter: (_v, row) => row.class_name ?? '—' },
    {
      field: 'exam_start',
      headerName: 'Bắt đầu',
      width: 170,
      valueGetter: (_v, row) => new Date(row.exam_start).toLocaleString('vi-VN'),
    },
    {
      field: 'exam_end',
      headerName: 'Kết thúc',
      width: 170,
      valueGetter: (_v, row) => new Date(row.exam_end).toLocaleString('vi-VN'),
    },
    { field: 'room', headerName: 'Phòng', width: 110, valueGetter: (_v, row) => row.room ?? '—' },
    {
      field: 'supervisors',
      headerName: 'Giám thị',
      width: 240,
      sortable: false,
      valueGetter: (_v, row) => [row.supervisor1?.hoTen, row.supervisor2?.hoTen].filter(Boolean).join(' / ') || '—',
    },
    {
      field: 'exam_type',
      headerName: 'Loại',
      width: 110,
      valueGetter: (_v, row) => EXAM_TYPE_LABELS[row.exam_type],
    },
    {
      field: 'actions',
      headerName: '',
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Sửa">
            <Button size="small" onClick={() => openEdit(params.row)} sx={{ minWidth: 0, p: 0.5 }}>
              <PencilSquareIcon className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip title="Xoá">
            <Button size="small" color="error" onClick={() => setDeleteId(params.row.id)} sx={{ minWidth: 0, p: 0.5 }}>
              <TrashIcon className="w-4 h-4" />
            </Button>
          </Tooltip>
        </Box>
      ),
    },
  ], []);

  return (
    <Box className="p-6 space-y-4">
      <Box className="flex items-center justify-between">
        <Box className="flex items-center gap-3">
          <Box className="w-12 h-12 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center">
            <CalendarDaysIcon className="w-6 h-6 text-white" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>Lịch thi</Typography>
            <Typography variant="body2" color="text.secondary">Quản lý lịch thi theo năm học, lớp</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<PlusIcon className="w-4 h-4" />} onClick={openCreate}>
          Thêm lịch thi
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      <Paper sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Năm học</InputLabel>
          <Select
            label="Năm học"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {courses.map((c) => (
              <MenuItem key={c.id} value={c.id}>{(c as any).ten_khoa_hoc || (c as any).ma_khoa_hoc || c.id}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Lớp</InputLabel>
          <Select
            label="Lớp"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {classes.map((cl: any) => (
              <MenuItem key={cl.id} value={cl.id}>{cl.class_name || cl.ten_lop || cl.id}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper sx={{ height: 600 }}>
        {loading && rows.length === 0 ? (
          <Box className="h-full flex items-center justify-center">
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            getRowId={(r) => r.id}
            disableRowSelectionOnClick
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            pageSizeOptions={[25, 50, 100]}
          />
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>{form.id ? 'Cập nhật lịch thi' : 'Thêm lịch thi'}</DialogTitle>
        <DialogContent dividers>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <FormControl size="small" required>
              <InputLabel>Năm học</InputLabel>
              <Select
                label="Năm học"
                value={form.khoa_hoc_id || ''}
                onChange={(e) => setForm((f) => ({ ...f, khoa_hoc_id: Number(e.target.value) }))}
              >
                {courses.map((c: any) => (
                  <MenuItem key={c.id} value={c.id}>{c.ten_khoa_hoc || c.ma_khoa_hoc || c.id}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Loại</InputLabel>
              <Select
                label="Loại"
                value={form.exam_type}
                onChange={(e) => setForm((f) => ({ ...f, exam_type: e.target.value as ExamType }))}
              >
                {(Object.entries(EXAM_TYPE_LABELS) as [ExamType, string][]).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Môn (chọn từ danh sách)</InputLabel>
              <Select
                label="Môn (chọn từ danh sách)"
                value={form.subject_id ?? ''}
                onChange={(e) => {
                  const id = e.target.value === '' ? null : Number(e.target.value);
                  const subject = subjects.find((s) => s.id === id);
                  setForm((f) => ({
                    ...f,
                    subject_id: id,
                    subject_name: subject?.tenMon || f.subject_name,
                  }));
                }}
              >
                <MenuItem value="">— (nhập tay) —</MenuItem>
                {subjects.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.tenMon}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Tên môn (hiển thị)"
              required
              value={form.subject_name}
              onChange={(e) => setForm((f) => ({ ...f, subject_name: e.target.value }))}
            />

            <FormControl size="small">
              <InputLabel>Lớp</InputLabel>
              <Select
                label="Lớp"
                value={form.class_id ?? ''}
                onChange={(e) => {
                  const id = e.target.value === '' ? null : Number(e.target.value);
                  const cl: any = classes.find((c) => c.id === id);
                  setForm((f) => ({ ...f, class_id: id, class_name: cl?.class_name || cl?.ten_lop || '' }));
                }}
              >
                <MenuItem value="">— Không gán lớp —</MenuItem>
                {classes.map((cl: any) => (
                  <MenuItem key={cl.id} value={cl.id}>{cl.class_name || cl.ten_lop || cl.id}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Phòng (text)"
              value={form.room ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
            />

            <TextField
              size="small"
              type="datetime-local"
              label="Bắt đầu"
              required
              InputLabelProps={{ shrink: true }}
              value={form.exam_start}
              onChange={(e) => setForm((f) => ({ ...f, exam_start: e.target.value }))}
            />

            <TextField
              size="small"
              type="datetime-local"
              label="Kết thúc"
              required
              InputLabelProps={{ shrink: true }}
              value={form.exam_end}
              onChange={(e) => setForm((f) => ({ ...f, exam_end: e.target.value }))}
            />

            <FormControl size="small">
              <InputLabel>Giám thị 1</InputLabel>
              <Select
                label="Giám thị 1"
                value={form.supervisor_1_id ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, supervisor_1_id: e.target.value === '' ? null : Number(e.target.value) }))}
              >
                <MenuItem value="">—</MenuItem>
                {lecturers.map((l) => (
                  <MenuItem key={l.id} value={l.id}>{l.hoTen}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Giám thị 2</InputLabel>
              <Select
                label="Giám thị 2"
                value={form.supervisor_2_id ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, supervisor_2_id: e.target.value === '' ? null : Number(e.target.value) }))}
              >
                <MenuItem value="">—</MenuItem>
                {lecturers.map((l) => (
                  <MenuItem key={l.id} value={l.id}>{l.hoTen}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              className="md:col-span-2"
              label="Ghi chú"
              multiline
              minRows={2}
              value={form.note ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>Huỷ</Button>
          <Button variant="contained" onClick={submitForm} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Xác nhận xoá</DialogTitle>
        <DialogContent>Bạn có chắc muốn xoá lịch thi này? Thao tác không thể hoàn tác.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Huỷ</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>Xoá</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
