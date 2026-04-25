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
  Tooltip,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import {
  lecturerAbsenceService,
  ABSENCE_REASON_LABELS,
  type LecturerAbsence,
  type LecturerAbsenceFormData,
  type AbsenceReason,
} from '~/services/lecturer-absence.service';
import { lecturerService } from '~/services/lecturer.service';

export function meta() {
  return [
    { title: 'Giảng viên nghỉ dạy - VMU' },
    { name: 'description', content: 'Ghi nhận lý do giảng viên nghỉ dạy' },
  ];
}

interface FormState extends LecturerAbsenceFormData {
  id?: number;
}

const emptyForm: FormState = {
  lecturer_id: 0,
  absence_date: new Date().toISOString().slice(0, 10),
  reason: 'sick',
  note: '',
};

export default function LecturerAbsencesPage() {
  const [rows, setRows] = useState<LecturerAbsence[]>([]);
  const [lecturers, setLecturers] = useState<Array<{ id: number; hoTen: string }>>([]);
  const [filterLecturer, setFilterLecturer] = useState<number | ''>('');
  const [filterFrom, setFilterFrom] = useState<string>('');
  const [filterTo, setFilterTo] = useState<string>('');
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
  }, [filterLecturer, filterFrom, filterTo]);

  async function loadInitial() {
    try {
      const data = await lecturerService.getSimpleLecturers();
      setLecturers(data);
    } catch (err: any) {
      setError(err?.message || 'Không tải được danh sách giảng viên');
    }
  }

  async function loadList() {
    try {
      setLoading(true);
      setError(null);
      const res = await lecturerAbsenceService.list({
        lecturer_id: filterLecturer || undefined,
        from: filterFrom || undefined,
        to: filterTo || undefined,
        per_page: 100,
      });
      setRows(res.data || []);
    } catch (err: any) {
      setError(err?.message || 'Không tải được danh sách');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({ ...emptyForm });
    setDialogOpen(true);
  }

  function openEdit(row: LecturerAbsence) {
    setForm({
      id: row.id,
      lecturer_id: row.lecturer_id,
      absence_date: row.absence_date.slice(0, 10),
      reason: row.reason,
      note: row.note ?? '',
      weekly_schedule_id: row.weekly_schedule_id,
    });
    setDialogOpen(true);
  }

  async function submitForm() {
    if (!form.lecturer_id || !form.absence_date) {
      setError('Vui lòng chọn giảng viên và ngày nghỉ');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      if (form.id) {
        await lecturerAbsenceService.update(form.id, form);
        setSuccess('Đã cập nhật');
      } else {
        await lecturerAbsenceService.create(form);
        setSuccess('Đã tạo bản ghi');
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
      await lecturerAbsenceService.remove(deleteId);
      setSuccess('Đã xoá');
      setDeleteId(null);
      await loadList();
    } catch (err: any) {
      setError(err?.message || 'Xoá thất bại');
    }
  }

  const columns: GridColDef<LecturerAbsence>[] = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'lecturer',
      headerName: 'Giảng viên',
      flex: 1,
      minWidth: 200,
      valueGetter: (_v, row) => row.lecturer?.hoTen || `#${row.lecturer_id}`,
    },
    {
      field: 'absence_date',
      headerName: 'Ngày nghỉ',
      width: 130,
      valueGetter: (_v, row) => new Date(row.absence_date).toLocaleDateString('vi-VN'),
    },
    {
      field: 'reason',
      headerName: 'Lý do',
      width: 140,
      valueGetter: (_v, row) => ABSENCE_REASON_LABELS[row.reason],
    },
    { field: 'note', headerName: 'Ghi chú', flex: 1, minWidth: 200, valueGetter: (_v, row) => row.note ?? '' },
    {
      field: 'recorder',
      headerName: 'Người ghi',
      width: 160,
      valueGetter: (_v, row) => row.recorder?.name ?? '—',
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
          <Box className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center">
            <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>Giảng viên nghỉ dạy</Typography>
            <Typography variant="body2" color="text.secondary">Ghi nhận lý do nghỉ và buổi học bị ảnh hưởng</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<PlusIcon className="w-4 h-4" />} onClick={openCreate}>
          Thêm bản ghi
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      <Paper sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel>Giảng viên</InputLabel>
          <Select
            label="Giảng viên"
            value={filterLecturer}
            onChange={(e) => setFilterLecturer(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {lecturers.map((l) => (
              <MenuItem key={l.id} value={l.id}>{l.hoTen}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          type="date"
          label="Từ ngày"
          InputLabelProps={{ shrink: true }}
          value={filterFrom}
          onChange={(e) => setFilterFrom(e.target.value)}
        />
        <TextField
          size="small"
          type="date"
          label="Đến ngày"
          InputLabelProps={{ shrink: true }}
          value={filterTo}
          onChange={(e) => setFilterTo(e.target.value)}
        />
      </Paper>

      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(r) => r.id}
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
          pageSizeOptions={[25, 50, 100]}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{form.id ? 'Sửa bản ghi nghỉ' : 'Thêm bản ghi nghỉ'}</DialogTitle>
        <DialogContent dividers>
          <Box className="grid grid-cols-1 gap-3 pt-2">
            <FormControl size="small" required>
              <InputLabel>Giảng viên</InputLabel>
              <Select
                label="Giảng viên"
                value={form.lecturer_id || ''}
                onChange={(e) => setForm((f) => ({ ...f, lecturer_id: Number(e.target.value) }))}
              >
                {lecturers.map((l) => (
                  <MenuItem key={l.id} value={l.id}>{l.hoTen}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              type="date"
              label="Ngày nghỉ"
              required
              InputLabelProps={{ shrink: true }}
              value={form.absence_date}
              onChange={(e) => setForm((f) => ({ ...f, absence_date: e.target.value }))}
            />
            <FormControl size="small">
              <InputLabel>Lý do</InputLabel>
              <Select
                label="Lý do"
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value as AbsenceReason }))}
              >
                {(Object.entries(ABSENCE_REASON_LABELS) as [AbsenceReason, string][]).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Ghi chú"
              multiline
              minRows={2}
              value={form.note ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Huỷ</Button>
          <Button variant="contained" onClick={submitForm} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Xác nhận xoá</DialogTitle>
        <DialogContent>Xoá bản ghi nghỉ này?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Huỷ</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>Xoá</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
