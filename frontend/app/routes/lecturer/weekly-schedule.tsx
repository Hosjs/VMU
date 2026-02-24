import React, { useState, useEffect, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type {
  GridColDef,
  GridRowsProp,
  GridRowId,
  GridRowModel,
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Typography,
  Autocomplete as MuiAutocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { PlusIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import weeklyScheduleService from '~/services/weeklyScheduleService';
import { roomService } from '~/services/room.service';
import { subjectService } from '~/services/subject.service';
import { lecturerService } from '~/services/lecturer.service';
import { courseService } from '~/services/course.service';
import { majorSubjectService } from '~/services/major-subject.service';
import { exportWeeklyScheduleToExcel, exportWeeklyScheduleToPDF } from '~/utils/excelExporter';
import type { WeeklyScheduleRow, BulkSaveWeeklyScheduleRequest, Week } from '~/types/weekly-schedule';
import type { Room } from '~/types/room';
import type { Subject } from '~/types/subject';
import type { Course } from '~/types/course';

export async function loader() {
  return {};
}

export default function WeeklySchedulePage() {
  const [rows, setRows] = useState<GridRowsProp<WeeklyScheduleRow>>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [classes, setClasses] = useState<Room[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [majorSubjectsMap, setMajorSubjectsMap] = useState<Map<string, Subject[]>>(new Map());
  const [lecturers, setLecturers] = useState<Array<{ id: number; hoTen: string; tenKhoa?: string; hocHam?: string; trinhDoChuyenMon?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [addingClassToRow, setAddingClassToRow] = useState<string | number | null>(null);
  const [newClassInput, setNewClassInput] = useState<string>('');

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load weeks when course is selected
  useEffect(() => {
    if (selectedCourse) {
      loadWeeks();
    } else {
      setWeeks([]);
      setSelectedWeek(null);
    }
  }, [selectedCourse]);

  // Load existing schedules when week is selected
  useEffect(() => {
    if (selectedCourse && selectedWeek) {
      loadExistingSchedules();
    }
  }, [selectedCourse, selectedWeek]);

  // Debug: Log when majorSubjectsMap changes
  useEffect(() => {
  }, [majorSubjectsMap]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [coursesData, classesData, lecturersData, subjectsResponse] = await Promise.all([
        courseService.getSimpleCourses(),
        roomService.getClasses(),
        lecturerService.getSimpleLecturers(),
        subjectService.getSubjects({ per_page: 1000 }),
      ]);

      setCourses(coursesData || []);
      setClasses(classesData || []);
      setLecturers(lecturersData || []);

      const subjectsData = subjectsResponse?.data || [];
      setSubjects(subjectsData);

      // Debug: Log classes with their major_id
      if (classesData && classesData.length > 0) {
      }
    } catch (err) {
      setError('Lỗi khi tải dữ liệu');
      console.error('❌ Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadWeeks = async () => {
    if (!selectedCourse) return;

    try {
      setLoading(true);
      const response = await weeklyScheduleService.getWeeksBySemester(selectedCourse);
      setWeeks(response.weeks || []);
    } catch (err) {
      console.error('❌ Error loading weeks:', err);
      setError('Lỗi khi tải danh sách tuần');
      setWeeks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectsByMajor = async (majorId: string) => {
    // Check if already loaded
    if (majorSubjectsMap.has(majorId)) {
      return majorSubjectsMap.get(majorId) || [];
    }

    try {

      // ✅ FIX: Pass major_id as-is (could be number or string)
      // Backend will handle both numeric ID and string maNganh
      const majorSubjects = await majorSubjectService.getSubjectsByMajor(majorId);
      const subjectsForMajor = majorSubjects.map(ms => ({
        id: ms.id,
        maMon: ms.maMon,
        tenMon: ms.tenMon,
        soTinChi: ms.soTinChi,
      })) as Subject[];

      // Cache it
      setMajorSubjectsMap(prev => new Map(prev).set(majorId, subjectsForMajor));
      return subjectsForMajor;
    } catch (err) {
      console.error(`❌ Error loading subjects for major ${majorId}:`, err);
      return [];
    }
  };

  const loadExistingSchedules = async () => {
    if (!selectedCourse || !selectedWeek) return;

    try {
      setLoading(true);
      const schedules = await weeklyScheduleService.getAll({
        khoa_hoc_id: selectedCourse,
        week_number: String(selectedWeek),
      });

      if (schedules && schedules.length > 0) {
        // Group schedules by STT and other fields (subject, lecturer, time, room)
        const groupedBySTT = schedules.reduce((acc, schedule) => {
          const key = `${schedule.stt}-${schedule.subject_name || ''}-${schedule.lecturer_name || ''}-${schedule.time_slot || ''}-${schedule.room || ''}`;

          if (!acc[key]) {
            acc[key] = {
              id: schedule.id,
              stt: schedule.stt,
              class_names: [],
              subject_name: schedule.subject_name || schedule.subject?.tenMonHoc || '',
              lecturer_name: schedule.lecturer_name || schedule.lecturer?.hoTen || '',
              time_slot: schedule.time_slot || '',
              room: schedule.room || '',
              ghi_chu: schedule.ghi_chu || '',
            };
          }

          // Add class name if not empty
          const className = schedule.class?.class_name || '';
          if (className && !acc[key].class_names.includes(className)) {
            acc[key].class_names.push(className);
          }

          return acc;
        }, {} as Record<string, WeeklyScheduleRow>);

        const formattedRows = Object.values(groupedBySTT).sort((a, b) => a.stt - b.stt);
        setRows(formattedRows);
      } else {
        // Create empty rows if no existing data
        setRows(createEmptyRows(5));
      }
    } catch (err) {
      console.error('❌ Error loading schedules:', err);
      setError('Lỗi khi tải lịch học');
      setRows(createEmptyRows(5));
    } finally {
      setLoading(false);
    }
  };

  const createEmptyRows = (count: number = 5): WeeklyScheduleRow[] => {
    return Array.from({ length: count }, (_, index) => ({
      id: `new-${Date.now()}-${index}`,
      stt: index + 1,
      class_names: [],
      subject_name: '',
      lecturer_name: '',
      time_slot: '',
      room: '',
      ghi_chu: '',
      isNew: true,
    }));
  };

  const handleAddRow = () => {
    const newRow: WeeklyScheduleRow = {
      id: `new-${Date.now()}`,
      stt: rows.length + 1,
      class_names: [],
      subject_name: '',
      lecturer_name: '',
      time_slot: '',
      room: '',
      ghi_chu: '',
      isNew: true,
    };
    setRows([...rows, newRow]);
  };

  const handleDeleteRow = (id: GridRowId) => {
    setRows(rows.filter((row) => row.id !== id));
    // Reorder STT
    const reorderedRows = rows
      .filter((row) => row.id !== id)
      .map((row, index) => ({ ...row, stt: index + 1 }));
    setRows(reorderedRows);
  };

  const processRowUpdate = (newRow: GridRowModel<WeeklyScheduleRow>) => {
    const updatedRows = rows.map((row) => (row.id === newRow.id ? (newRow as WeeklyScheduleRow) : row));
    setRows(updatedRows);
    return newRow;
  };

  const handleProcessRowUpdateError = (error: Error) => {
    console.error('Row update error:', error);
    setError('Lỗi khi cập nhật dòng');
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!selectedCourse) {
        setError('Vui lòng chọn kỳ học');
        return;
      }

      if (!selectedWeek) {
        setError('Vui lòng chọn tuần học');
        return;
      }

      // Check if at least one row has data
      const hasData = rows.some(
        (row) => row.class_names.length > 0 && (row.subject_name.trim() || row.lecturer_name.trim())
      );

      if (!hasData) {
        setError('Vui lòng nhập ít nhất một lớp và môn học/giảng viên');
        return;
      }

      setSaving(true);
      setError(null);

      // Extract unique class_ids from all rows
      const allClassNames = rows
        .filter(row => row.class_names.length > 0)
        .flatMap(row => row.class_names);

      const uniqueClassNames = [...new Set(allClassNames)];

      // Map class names to IDs
      const classIds = uniqueClassNames
        .map(className => {
          const foundClass = classes.find(c => c.class_name === className);
          return foundClass?.id;
        })
        .filter((id): id is number => id !== undefined);

      if (classIds.length === 0) {
        setError('Không tìm thấy lớp học hợp lệ');
        return;
      }

      // Prepare data for bulk save
      const schedulesData = rows
        .filter((row) => row.class_names.length > 0 && (row.subject_name.trim() || row.lecturer_name.trim()))
        .map((row) => ({
          stt: row.stt,
          subject_id: null,
          subject_name: row.subject_name.trim() || null,
          lecturer_id: null,
          lecturer_name: row.lecturer_name.trim() || null,
          time_slot: row.time_slot.trim() || null,
          room: row.room.trim() || null,
          ghi_chu: row.ghi_chu?.trim() || null,
        }));

      const request: BulkSaveWeeklyScheduleRequest = {
        week_number: String(selectedWeek),
        khoa_hoc_id: selectedCourse,
        class_ids: classIds,
        schedules: schedulesData,
      };

      await weeklyScheduleService.bulkSave(request);

      setSuccess('Lưu lịch học thành công!');

      // Reload schedules
      setTimeout(() => {
        loadExistingSchedules();
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      console.error('❌ Error saving schedules:', err);
      setError(err?.response?.data?.message || 'Lỗi khi lưu lịch học');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (!selectedCourse || !selectedWeek) {
      setError('Vui lòng chọn kỳ học và tuần để xuất file');
      return;
    }

    if (rows.length === 0) {
      setError('Không có dữ liệu để xuất');
      return;
    }

    try {
      // Find the selected course and week data
      const selectedCourseData = courses.find(c => c.id === selectedCourse);
      const selectedWeekData = weeks.find(w => w.week_number === selectedWeek);

      if (!selectedCourseData || !selectedWeekData) {
        setError('Không tìm thấy thông tin kỳ học hoặc tuần học');
        return;
      }

      // Call the export utility
      exportWeeklyScheduleToExcel({
        rows,
        selectedCourseData: {
          ma_khoa_hoc: selectedCourseData.ma_khoa_hoc,
          dot: selectedCourseData.dot,
          hoc_ky: selectedCourseData.hoc_ky,
          nam_hoc: selectedCourseData.nam_hoc,
        },
        selectedWeekData: {
          week_number: selectedWeekData.week_number,
          week_label: selectedWeekData.week_label,
          start_date: selectedWeekData.start_date,
          end_date: selectedWeekData.end_date,
          display_label: selectedWeekData.display_label,
        },
      });

      setSuccess('✅ Xuất file Excel thành công!');
    } catch (err) {
      console.error('❌ Error exporting:', err);
      setError('Lỗi khi xuất file Excel');
    }
  };

  const handleExportPDF = () => {
    if (!selectedCourse || !selectedWeek) {
      setError('Vui lòng chọn kỳ học và tuần để xuất file');
      return;
    }

    if (rows.length === 0) {
      setError('Không có dữ liệu để xuất');
      return;
    }

    try {
      // Find the selected course and week data
      const selectedCourseData = courses.find(c => c.id === selectedCourse);
      const selectedWeekData = weeks.find(w => w.week_number === selectedWeek);

      if (!selectedCourseData || !selectedWeekData) {
        setError('Không tìm thấy thông tin kỳ học hoặc tuần học');
        return;
      }

      // Call the PDF export utility
      exportWeeklyScheduleToPDF({
        rows,
        selectedCourseData: {
          ma_khoa_hoc: selectedCourseData.ma_khoa_hoc,
          dot: selectedCourseData.dot,
          hoc_ky: selectedCourseData.hoc_ky,
          nam_hoc: selectedCourseData.nam_hoc,
        },
        selectedWeekData: {
          week_number: selectedWeekData.week_number,
          week_label: selectedWeekData.week_label,
          start_date: selectedWeekData.start_date,
          end_date: selectedWeekData.end_date,
          display_label: selectedWeekData.display_label,
        },
      });

      setSuccess('✅ Xuất file PDF thành công!');
    } catch (err) {
      console.error('❌ Error exporting PDF:', err);
      setError('Lỗi khi xuất file PDF');
    }
  };

  const handleConfirmAddClass = () => {
    if (!addingClassToRow || !newClassInput.trim()) {
      return;
    }

    const updatedRows = rows.map(r => {
      if (r.id === addingClassToRow) {
        const newClassNames = [...r.class_names, newClassInput.trim()];
        // Load subjects for the new class's major
        const selectedClass = classes.find(c => c.class_name === newClassInput.trim());
        if (selectedClass && selectedClass.major_id) {
          loadSubjectsByMajor(String(selectedClass.major_id));
        }
        return { ...r, class_names: newClassNames };
      }
      return r;
    });
    setRows(updatedRows);
    setAddingClassToRow(null);
    setNewClassInput('');
  };

  const handleCancelAddClass = () => {
    setAddingClassToRow(null);
    setNewClassInput('');
  };

  // ✅ Memoize columns with majorSubjectsMap dependency
  // This ensures columns re-render when subjects are loaded
  const columns: GridColDef<WeeklyScheduleRow>[] = useMemo(() => [
    {
      field: 'stt',
      headerName: 'TT',
      width: 60,
      align: 'center',
      headerAlign: 'center',
      editable: false,
    },
    {
      field: 'class_names',
      headerName: 'Lớp Học *',
      width: 300,
      minWidth: 250,
      flex: 1,
      editable: false,
      renderCell: (params) => {
        const row = rows.find(r => r.id === params.id);
        if (!row) return null;

        const handleAddClass = () => {
          setAddingClassToRow(params.id);
        };

        const handleRemoveClass = (classNameToRemove: string) => {
          const updatedRows = rows.map(r => {
            if (r.id === params.id) {
              return { ...r, class_names: r.class_names.filter(cn => cn !== classNameToRemove) };
            }
            return r;
          });
          setRows(updatedRows);
        };

        return (
          <Box sx={{
            display: 'flex',
            gap: 0.5,
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            py: 1,
            width: '100%',
            minHeight: '52px',
          }}>
            {row.class_names.map((className, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '16px',
                  padding: '6px 10px',
                  fontSize: '0.875rem',
                  border: '1px solid #90caf9',
                  whiteSpace: 'nowrap',
                  marginBottom: '4px',
                }}
              >
                <span style={{ fontWeight: 500 }}>{className}</span>
                <button
                  onClick={() => handleRemoveClass(className)}
                  style={{
                    marginLeft: '6px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#1976d2',
                    fontSize: '18px',
                    padding: 0,
                    lineHeight: 1,
                    fontWeight: 'bold',
                  }}
                  title="Xóa lớp"
                >
                  ×
                </button>
              </Box>
            ))}
            <button
              onClick={handleAddClass}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '28px',
                minHeight: '28px',
                borderRadius: '50%',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1565c0';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#1976d2';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Thêm lớp học"
            >
              +
            </button>
          </Box>
        );
      },
    },
    {
      field: 'subject_name',
      headerName: 'Học phần *',
      width: 280,
      minWidth: 200,
      editable: true,
      renderEditCell: (params) => {
        // Get the class for this row (use first class if multiple)
        const row = rows.find(r => r.id === params.id);
        const firstClassName = row?.class_names[0];
        const selectedClass = firstClassName ? classes.find(c => c.class_name === firstClassName) : undefined;

        // Use cached major subjects if available, otherwise use all subjects
        let availableSubjects = subjects;
        if (selectedClass?.major_id && majorSubjectsMap.has(String(selectedClass.major_id))) {
          availableSubjects = majorSubjectsMap.get(String(selectedClass.major_id)) || subjects;
        }

        const subjectOptions = availableSubjects.map(s => ({
          label: s.tenMon,
          value: s.tenMon,
          id: s.id,
          soTinChi: s.soTinChi,
        }));

        // Load subjects for this major if not already loaded
        if (selectedClass?.major_id && !majorSubjectsMap.has(String(selectedClass.major_id))) {
          loadSubjectsByMajor(String(selectedClass.major_id));
        }

        return (
          <MuiAutocomplete
            freeSolo
            openOnFocus
            options={subjectOptions}
            value={params.value || ''}
            onFocus={() => {
              // Load subjects when the field is focused
              if (selectedClass?.major_id && !majorSubjectsMap.has(String(selectedClass.major_id))) {
                loadSubjectsByMajor(String(selectedClass.major_id));
              }
            }}
            onChange={(_, newValue) => {
              if (typeof newValue === 'string') {
                params.api.setEditCellValue({ id: params.id, field: 'subject_name', value: newValue });
              } else if (newValue && typeof newValue === 'object') {
                params.api.setEditCellValue({ id: params.id, field: 'subject_name', value: newValue.label });
              }
            }}
            onInputChange={(_, newInputValue) => {
              params.api.setEditCellValue({ id: params.id, field: 'subject_name', value: newInputValue });
            }}
            renderInput={(inputParams) => (
              <TextField
                {...inputParams}
                autoFocus
                fullWidth
                variant="standard"
                placeholder={selectedClass?.major_id ? "Chọn học phần của ngành..." : "Chọn lớp trước..."}
                helperText={selectedClass?.major_id ? `Ngành: ${selectedClass.major_id}` : 'Vui lòng chọn lớp'}
              />
            )}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <li key={key} {...otherProps}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.soTinChi && <div className="text-xs text-gray-500">{option.soTinChi} tín chỉ</div>}
                  </div>
                </li>
              );
            }}
            sx={{ width: '100%' }}
          />
        );
      },
    },
    {
      field: 'lecturer_name',
      headerName: 'Giảng viên *',
      width: 220,
      minWidth: 180,
      editable: true,
      renderEditCell: (params) => {
        const lecturerOptions = lecturers.map(l => {
          let label = l.hoTen;
          let subtitle = '';
          if (l.hocHam || l.trinhDoChuyenMon) {
            const credentials = [l.hocHam, l.trinhDoChuyenMon].filter(Boolean).join(', ');
            subtitle = credentials;
          }
          return {
            label,
            subtitle,
            value: l.hoTen,
            id: l.id,
          };
        });

        return (
          <MuiAutocomplete
            freeSolo
            openOnFocus
            options={lecturerOptions}
            value={params.value || ''}
            onChange={(_, newValue) => {
              if (typeof newValue === 'string') {
                params.api.setEditCellValue({ id: params.id, field: 'lecturer_name', value: newValue });
              } else if (newValue && typeof newValue === 'object') {
                params.api.setEditCellValue({ id: params.id, field: 'lecturer_name', value: newValue.value });
              }
            }}
            onInputChange={(_, newInputValue) => {
              params.api.setEditCellValue({ id: params.id, field: 'lecturer_name', value: newInputValue });
            }}
            renderInput={(inputParams) => (
              <TextField
                {...inputParams}
                autoFocus
                fullWidth
                variant="standard"
                placeholder="Chọn hoặc nhập giảng viên..."
              />
            )}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <li key={key} {...otherProps}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.subtitle && <div className="text-xs text-gray-500">{option.subtitle}</div>}
                  </div>
                </li>
              );
            }}
            sx={{ width: '100%' }}
          />
        );
      },
    },
    {
      field: 'time_slot',
      headerName: 'Thời gian',
      width: 180,
      minWidth: 150,
      editable: true,
      renderEditCell: (params) => (
        <TextField
          value={params.value || ''}
          onChange={(e) => {
            params.api.setEditCellValue({
              id: params.id,
              field: params.field,
              value: e.target.value,
            });
          }}
          variant="standard"
          placeholder="VD: Thứ 2, 7h-9h"
          fullWidth
        />
      ),
    },
    {
      field: 'room',
      headerName: 'Phòng Học',
      width: 110,
      minWidth: 90,
      editable: true,
      renderEditCell: (params) => (
        <TextField
          value={params.value || ''}
          onChange={(e) => {
            params.api.setEditCellValue({
              id: params.id,
              field: params.field,
              value: e.target.value,
            });
          }}
          variant="standard"
          placeholder="VD: P201"
          fullWidth
        />
      ),
    },
    {
      field: 'ghi_chu',
      headerName: 'Ghi chú',
      width: 180,
      minWidth: 150,
      editable: true,
      renderEditCell: (params) => (
        <TextField
          value={params.value || ''}
          onChange={(e) => {
            params.api.setEditCellValue({
              id: params.id,
              field: params.field,
              value: e.target.value,
            });
          }}
          variant="standard"
          placeholder="Ghi chú..."
          fullWidth
          multiline
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          color="error"
          onClick={() => handleDeleteRow(params.id)}
          startIcon={<TrashIcon className="h-4 w-4" />}
        >
          Xóa
        </Button>
      ),
    },
  ], [rows, classes, subjects, majorSubjectsMap, lecturers, loadSubjectsByMajor, handleDeleteRow]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Quản lý Lịch học theo Tuần
        </Typography>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 250 }} size="small">
            <InputLabel>Kỳ học *</InputLabel>
            <Select
              value={selectedCourse || ''}
              onChange={(e) => {
                setSelectedCourse(Number(e.target.value));
                setSelectedWeek(null);
                setRows([]);
              }}
              label="Kỳ học *"
            >
              <MenuItem value="">
                <em>-- Chọn kỳ học --</em>
              </MenuItem>
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.ma_khoa_hoc} ({course.nam_hoc}.{course.hoc_ky}.{course.dot})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 300 }} size="small" disabled={!selectedCourse || weeks.length === 0}>
            <InputLabel>Tuần *</InputLabel>
            <Select
              value={selectedWeek || ''}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              label="Tuần *"
            >
              <MenuItem value="">
                <em>-- Chọn tuần --</em>
              </MenuItem>
              {weeks.map((week) => (
                <MenuItem key={week.week_number} value={week.week_number}>
                  {week.display_label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loading && <CircularProgress size={24} />}
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PlusIcon className="h-5 w-5" />}
            onClick={handleAddRow}
          >
            Thêm dòng
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving || rows.length === 0}
          >
            {saving ? <CircularProgress size={20} /> : 'Lưu lịch học'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
            onClick={handleExport}
            disabled={rows.length === 0}
          >
            Xuất Excel
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
            onClick={handleExportPDF}
            disabled={rows.length === 0}
          >
            Xuất PDF
          </Button>
        </Box>

        {/* DataGrid */}
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={handleProcessRowUpdateError}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            disableRowSelectionOnClick
            editMode="cell"
            getRowHeight={() => 'auto'}
            sx={{
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'flex-start',
                paddingTop: '8px',
                paddingBottom: '8px',
              },
              '& .MuiDataGrid-row': {
                minHeight: '52px !important',
                maxHeight: 'none !important',
              },
            }}
          />
        </Box>

        {/* Instructions */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Hướng dẫn:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" component="ul">
            <li>Chọn kỳ học từ dropdown (VD: 2025.1.1)</li>
            <li>Hệ thống sẽ tự động tính và hiển thị danh sách các tuần trong kỳ</li>
            <li>Chọn tuần cần xem/chỉnh sửa (VD: Tuần 4 (06/01 - 12/01))</li>
            <li>Lịch học của tuần đó sẽ tự động được tải lên</li>
            <li>Click vào từng ô trong bảng để chỉnh sửa trực tiếp</li>
            <li><strong>Chọn Lớp học trước:</strong> Sau khi chọn lớp, danh sách Học phần sẽ tự động lọc theo ngành của lớp đó</li>
            <li><strong>Thêm nhiều lớp:</strong> Click nút "+" trong cột Lớp học để thêm nhiều lớp vào cùng một lịch</li>
            <li>Tất cả các cột (Lớp học, Học phần, Giảng viên) đều có gợi ý tìm kiếm</li>
            <li>Có thể nhập tự do hoặc chọn từ danh sách gợi ý</li>
            <li>Thời gian và Phòng học nhập tự do (VD: Thứ 2, 7h-9h)</li>
            <li>Click "Thêm dòng" để thêm lớp/môn học mới</li>
            <li>Click "Lưu lịch học" để lưu toàn bộ thay đổi</li>
          </Typography>
        </Box>

        {/* Add Class Dialog */}
        <Dialog open={addingClassToRow !== null} onClose={handleCancelAddClass} maxWidth="sm" fullWidth>
          <DialogTitle>Thêm Lớp Học</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <MuiAutocomplete
                freeSolo
                options={classes.map(c => c.class_name || '')}
                value={newClassInput}
                onChange={(_, newValue) => {
                  setNewClassInput(newValue || '');
                }}
                onInputChange={(_, newInputValue) => {
                  setNewClassInput(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tên lớp học"
                    placeholder="Chọn hoặc nhập tên lớp học..."
                    autoFocus
                    fullWidth
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelAddClass}>Hủy</Button>
            <Button
              onClick={handleConfirmAddClass}
              variant="contained"
              disabled={!newClassInput.trim()}
            >
              Thêm
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
