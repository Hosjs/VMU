import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  Alert,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import {
  auditLogService,
  AUDIT_EVENT_LABELS,
  type AuditLog,
  type AuditEvent,
} from '~/services/audit-log.service';

export function meta() {
  return [
    { title: 'Lịch sử thay đổi - VMU' },
    { name: 'description', content: 'Audit log toàn hệ thống' },
  ];
}

const TYPE_LABELS: Record<string, string> = {
  'App\\Models\\WeeklySchedule': 'Lịch tuần',
  'App\\Models\\TeachingSchedule': 'Kế hoạch giảng dạy',
  'App\\Models\\ExamSchedule': 'Lịch thi',
};

function shortType(t: string): string {
  return TYPE_LABELS[t] ?? t.split('\\').pop() ?? t;
}

const EVENT_COLORS: Record<AuditEvent, 'success' | 'info' | 'error'> = {
  created: 'success',
  updated: 'info',
  deleted: 'error',
};

export default function AuditLogsPage() {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [filterType, setFilterType] = useState<string>('');
  const [filterEvent, setFilterEvent] = useState<AuditEvent | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AuditLog | null>(null);

  useEffect(() => {
    void loadList();
  }, [filterType, filterEvent]);

  async function loadList() {
    try {
      setLoading(true);
      setError(null);
      const res = await auditLogService.list({
        auditable_type: filterType || undefined,
        event: filterEvent || undefined,
        per_page: 100,
      });
      setRows(res.data || []);
    } catch (err: any) {
      setError(err?.message || 'Không tải được audit log');
    } finally {
      setLoading(false);
    }
  }

  const columns: GridColDef<AuditLog>[] = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'created_at',
      headerName: 'Thời gian',
      width: 170,
      valueGetter: (_v, row) => new Date(row.created_at).toLocaleString('vi-VN'),
    },
    {
      field: 'user',
      headerName: 'Người thực hiện',
      width: 200,
      valueGetter: (_v, row) => row.user?.name ?? `User #${row.user_id ?? 'system'}`,
    },
    {
      field: 'auditable_type',
      headerName: 'Đối tượng',
      width: 180,
      valueGetter: (_v, row) => `${shortType(row.auditable_type)} #${row.auditable_id}`,
    },
    {
      field: 'event',
      headerName: 'Sự kiện',
      width: 130,
      renderCell: (params) => (
        <Chip
          size="small"
          label={AUDIT_EVENT_LABELS[params.row.event]}
          color={EVENT_COLORS[params.row.event]}
        />
      ),
    },
    {
      field: 'changes',
      headerName: 'Thay đổi',
      flex: 1,
      minWidth: 250,
      sortable: false,
      valueGetter: (_v, row) => {
        if (row.event === 'updated' && row.new_values) {
          return Object.keys(row.new_values).join(', ');
        }
        if (row.event === 'created') return 'Tạo mới bản ghi';
        if (row.event === 'deleted') return 'Đã xoá';
        return '';
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button size="small" onClick={() => setDetail(params.row)}>
          Chi tiết
        </Button>
      ),
    },
  ], []);

  return (
    <Box className="p-6 space-y-4">
      <Box className="flex items-center gap-3">
        <Box className="w-12 h-12 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl flex items-center justify-center">
          <DocumentTextIcon className="w-6 h-6 text-white" />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>Lịch sử thay đổi</Typography>
          <Typography variant="body2" color="text.secondary">Audit log mọi thao tác lên dữ liệu nghiệp vụ</Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <Paper sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Đối tượng</InputLabel>
          <Select
            label="Đối tượng"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Sự kiện</InputLabel>
          <Select
            label="Sự kiện"
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value as AuditEvent | '')}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {(Object.entries(AUDIT_EVENT_LABELS) as [AuditEvent, string][]).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>
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

      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          {detail && (
            <>
              {AUDIT_EVENT_LABELS[detail.event]} · {shortType(detail.auditable_type)} #{detail.auditable_id}
            </>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {detail && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Giá trị cũ</Typography>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'grey.50', maxHeight: 360, overflow: 'auto' }}>
                  <pre style={{ margin: 0, fontSize: 12 }}>
                    {detail.old_values ? JSON.stringify(detail.old_values, null, 2) : '—'}
                  </pre>
                </Paper>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Giá trị mới</Typography>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'grey.50', maxHeight: 360, overflow: 'auto' }}>
                  <pre style={{ margin: 0, fontSize: 12 }}>
                    {detail.new_values ? JSON.stringify(detail.new_values, null, 2) : '—'}
                  </pre>
                </Paper>
              </Box>
              <Box sx={{ gridColumn: { md: '1 / -1' } }}>
                <Typography variant="caption" color="text.secondary">
                  IP: {detail.ip_address ?? '—'} · {new Date(detail.created_at).toLocaleString('vi-VN')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetail(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
