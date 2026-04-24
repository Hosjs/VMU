import React, { useState, useEffect, useRef } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type {
  GridColDef,
  GridRowsProp,
  GridRowId,
  GridRowModel,
  GridPreProcessEditCellProps
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Typography,
  Autocomplete as MuiAutocomplete
} from '@mui/material';
import { PlusIcon, TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { getTeachingSchedules, bulkSaveTeachingSchedules } from '~/services/teachingScheduleService';
import { courseService } from '~/services/course.service';
import { majorService } from '~/services/major.service';
import { lecturerService } from '~/services/lecturer.service';
import { majorSubjectService } from '~/services/major-subject.service';
import { Autocomplete } from '~/components/ui/Autocomplete';
import type { AutocompleteOption } from '~/components/ui/Autocomplete';
import type { TeachingScheduleRow, BulkSaveTeachingScheduleRequest } from '~/types/teaching-schedule';
import type { Course } from '~/types/course';
import type { Major } from '~/types/major';
import { exportTeachingScheduleToExcel } from '~/utils/excelExporter';
import { parseTeachingScheduleExcel } from '~/utils/teachingScheduleExcelImporter';
import { formatters } from '~/utils/formatters';


export default function TeachingSchedulePage() {
  const [rows, setRows] = useState<GridRowsProp<TeachingScheduleRow>>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [subjects, setSubjects] = useState<Array<{ id: number; maMon: string; tenMon: string; soTinChi: number }>>([]);
  const [lecturers, setLecturers] = useState<Array<{ id: number; hoTen: string; trinhDoChuyenMon?: string; hocHam?: string }>>([]);
  const [majorOptions, setMajorOptions] = useState<AutocompleteOption[]>([]);
  const [courseOptions, setCourseOptions] = useState<AutocompleteOption[]>([]);
  const [loadingMajors, setLoadingMajors] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [selectedMajor, setSelectedMajor] = useState<number | ''>('');
  const [semesterCode, setSemesterCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const normalizeComparisonText = (value?: string | null) =>
    (value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

  // Load courses and majors on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Debug courseOptions changes
  useEffect(() => {
    if (courseOptions.length > 0) {
    }
  }, [courseOptions]);

  // Load existing schedules when course and major are selected
  useEffect(() => {
    if (selectedCourse && selectedMajor && semesterCode) {
      loadExistingSchedules();
    }
  }, [selectedCourse, selectedMajor, semesterCode]);

  // Load subjects when major is selected
  useEffect(() => {
    const loadSubjects = async () => {
      if (selectedMajor) {
        try {
          const subjectsData = await majorSubjectService.getSubjectsByMajor(Number(selectedMajor));
          setSubjects(subjectsData || []);
        } catch (err) {
          console.error('❌ Error loading subjects:', err);
          setSubjects([]);
        }
      } else {
        setSubjects([]);
      }
    };
    loadSubjects();
  }, [selectedMajor]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setLoadingMajors(true);
      setLoadingCourses(true);
      const [coursesData, majorsResponse, lecturersData] = await Promise.all([
        courseService.getSimpleCourses(),
        majorService.getMajors({ page: 1, per_page: 100 }),
        lecturerService.getSimpleLecturers(),
      ]);

      setCourses(coursesData || []);
      setMajors(majorsResponse.data || []);
      setLecturers(lecturersData || []);

      // Create autocomplete options for majors
      const majorOpts: AutocompleteOption[] = (majorsResponse.data || []).map(major => ({
        value: major.id,
        label: `${major.tenNganh}`,
        subtitle: `Mã ngành: ${major.maNganh}`,
        searchText: `${major.maNganh} ${major.tenNganh}`,
      }));
      setMajorOptions(majorOpts);

      // Create autocomplete options for courses
      const courseOpts: AutocompleteOption[] = (coursesData || []).map(course => ({
        value: course.id,
        label: formatters.courseCode(course),
        subtitle: formatters.courseCodeDetail(course),
        searchText: `${formatters.courseCode(course)} ${course.nam_hoc} ${course.dot} ${formatters.courseCodeDetail(course)}`,
      }));

      setCourseOptions(courseOpts);
    } catch (err) {
      setError('Lỗi khi tải dữ liệu');
      console.error('❌ Error loading initial data:', err);
    } finally {
      setLoading(false);
      setLoadingMajors(false);
      setLoadingCourses(false);
    }
  };

  // Create default fixed subjects (always included)
  const createDefaultSubjects = (): TeachingScheduleRow[] => {
    return [
      {
        id: 'default-triet-hoc-1',
        stt: 1,
        ten_hoc_phan: 'Triết học',
        so_tin_chi: 3,
        can_bo_giang_day: 'Các thầy cô khoa LL chính trị',
        tuan: '',
        ngay: '',
        ghi_chu: '',
        isNew: true,
      },
      {
        id: 'default-tieng-anh-1',
        stt: 2,
        ten_hoc_phan: 'Tiếng Anh',
        so_tin_chi: 3,
        can_bo_giang_day: 'Khoa Ngoại ngữ',
        tuan: '',
        ngay: '',
        ghi_chu: '',
        isNew: true,
      },
    ];
  };

  const loadExistingSchedules = async () => {
    try {
      setLoading(true);

      const schedules = await getTeachingSchedules({
        khoa_hoc_id: Number(selectedCourse),
        major_id: Number(selectedMajor),
        semester_code: semesterCode,
      });

      if (schedules && Array.isArray(schedules) && schedules.length > 0) {
        const mappedRows = schedules.map((schedule): TeachingScheduleRow => {
          return {
            id: schedule.id,
            stt: schedule.stt,
            ten_hoc_phan: schedule.ten_hoc_phan,
            so_tin_chi: (schedule.so_tin_chi === 0 ? '' : schedule.so_tin_chi) as number | '',
            can_bo_giang_day: schedule.can_bo_giang_day ?? '',
            tuan: schedule.tuan ?? '',
            ngay: schedule.ngay ?? '',
            ghi_chu: schedule.ghi_chu ?? '',
            isNew: false,
            isBreak: schedule.so_tin_chi === 0,
          };
        });
        setRows(mappedRows);
      } else {
        // Start with default subjects + one empty row
        const defaultRows = createDefaultSubjects();
        setRows([...defaultRows, createNewRow(3)]);
      }
    } catch (err) {
      console.error('❌ Error loading schedules:', err);
      const defaultRows = createDefaultSubjects();
      setRows([...defaultRows, createNewRow(3)]);
    } finally {
      setLoading(false);
    }
  };

  const createNewRow = (stt: number): TeachingScheduleRow => {
    const newId = `new-${Date.now()}-${Math.random()}`;
    return {
      id: newId,
      stt,
      ten_hoc_phan: '',
      so_tin_chi: '',
      can_bo_giang_day: '',
      tuan: '',
      ngay: '',
      ghi_chu: '',
      isNew: true,
    };
  };

  const validateRow = (row: TeachingScheduleRow): boolean => {
    // Break/holiday rows only need ten_hoc_phan
    if (row.isBreak) {
      return !!row.ten_hoc_phan && row.ten_hoc_phan.trim() !== '';
    }

    // Regular rows require: ten_hoc_phan, so_tin_chi, can_bo_giang_day
    const hasTenHocPhan = !!row.ten_hoc_phan && row.ten_hoc_phan.trim() !== '';
    const hasSoTinChi = row.so_tin_chi !== '' && Number(row.so_tin_chi) > 0;
    const hasCanBo = !!row.can_bo_giang_day && row.can_bo_giang_day.trim() !== '';

    return hasTenHocPhan && hasSoTinChi && hasCanBo;
  };

  const canAddNewRow = (): boolean => {
    if (rows.length === 0) return true;

    // Check if last row is complete
    const lastRow = rows[rows.length - 1];
    return validateRow(lastRow);
  };

  const getIncompleteRows = (): number[] => {
    return rows
      .filter(row => !validateRow(row))
      .map(row => row.stt);
  };

  const getLecturerGroupCount = (stt: number): number => {
    return rows.filter(row => row.stt === stt && !row.isBreak).length;
  };

  const handleCourseChange = (value: string | number) => {
    const courseId = value ? Number(value) : '';
    setSelectedCourse(courseId);

    if (courseId) {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        // Generate semester code based on selected major and course
        if (selectedMajor) {
          const major = majors.find(m => m.id === selectedMajor);
          if (major) {
              setSemesterCode(`${major.maNganh} ${course.ma_khoa_hoc}`);
          }
        }
      }
    }
  };

  const handleMajorChange = (value: string | number) => {
    const majorId = value ? Number(value) : '';
    setSelectedMajor(majorId);

    if (majorId && selectedCourse) {
      const major = majors.find(m => m.id === majorId);
      const course = courses.find(c => c.id === selectedCourse);
      if (major && course) {
        setSemesterCode(`${major.maNganh} ${course.ma_khoa_hoc}`);
      }
    }
  };

  const handleAddRow = () => {
    if (!canAddNewRow()) {
      const incompleteRows = getIncompleteRows();
      setError(`Vui lòng hoàn thiện dòng ${incompleteRows.join(', ')} trước khi thêm dòng mới`);
      return;
    }
    const newRow = createNewRow(rows.length + 1);
    setRows([...rows, newRow]);
    setError(null);
  };

  // Add additional lecturer for existing subject (for Excel export - will be merged)
  const handleAddLecturerToSubject = (rowId: GridRowId) => {
    const originalRow = rows.find(r => r.id === rowId);
    if (!originalRow) return;

    const insertIndex = rows.findIndex(r => r.id === rowId) + 1;
    const newId = `lecturer-${Date.now()}-${Math.random()}`;

    // Create new row with same subject info but empty lecturer
    const newLecturerRow: TeachingScheduleRow = {
      id: newId,
      stt: originalRow.stt, // Same STT (will merge in Excel)
      ten_hoc_phan: originalRow.ten_hoc_phan, // Same subject name (will merge in Excel)
      so_tin_chi: originalRow.so_tin_chi, // Same credits
      can_bo_giang_day: '', // Empty - user will fill in
      tuan: '',
      ngay: '',
      ghi_chu: '',
      isNew: true,
      isAdditionalLecturer: true, // Flag to indicate this is additional lecturer for same subject
    };

    // Insert after the original row
    const newRows = [...rows];
    newRows.splice(insertIndex, 0, newLecturerRow);
    setRows(newRows);
    setSuccess(`✅ Đã thêm dòng giảng viên thứ 2 cho môn "${originalRow.ten_hoc_phan}". STT, Tên môn và Số tín chỉ sẽ tự động merge trong Excel. Giảng viên đầu tiên sẽ được in đậm.`);
    setError(null);
  };

  const handleDeleteRow = (id: GridRowId) => {
    setRows(rows.filter((row) => row.id !== id));
    // Re-calculate STT
    const updatedRows = rows
      .filter((row) => row.id !== id)
      .map((row, index) => ({ ...row, stt: index + 1 }));
    setRows(updatedRows);
  };

  const processRowUpdate = (newRow: GridRowModel<TeachingScheduleRow>): GridRowModel<TeachingScheduleRow> => {
    const updatedRows = rows.map((row) => (row.id === newRow.id ? newRow : row));
    setRows(updatedRows as TeachingScheduleRow[]);
    return newRow;
  };

  const handleProcessRowUpdateError = (error: Error) => {
    console.error('Row update error:', error);
    setError('Lỗi khi cập nhật dòng');
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!selectedCourse || !selectedMajor || !semesterCode) {
      setError('Vui lòng chọn kỳ học và ngành học');
      return;
    }

    // Validate all rows
    const invalidRows = rows.filter((row) => !validateRow(row));
    if (invalidRows.length > 0) {
      setError(`Có ${invalidRows.length} dòng chưa đầy đủ thông tin (thiếu tên học phần, số tín chỉ hoặc cán bộ giảng dạy)`);
      return;
    }

    try {
      setSaving(true);

      // Map all rows including break rows
      const schedules = rows.map((row) => ({
        stt: row.stt,
        ten_hoc_phan: row.ten_hoc_phan,
        so_tin_chi: row.isBreak ? 0 : Number(row.so_tin_chi), // Break rows have 0 credits
        can_bo_giang_day: row.isBreak ? null : row.can_bo_giang_day, // Break rows have null instructor
        tuan: row.tuan || undefined,
        ngay: row.ngay || undefined,
        ghi_chu: row.ghi_chu || undefined,
      }));

      const requestData: BulkSaveTeachingScheduleRequest = {
        major_id: Number(selectedMajor),
        khoa_hoc_id: Number(selectedCourse),
        semester_code: semesterCode,
        schedules,
      };

      await bulkSaveTeachingSchedules(requestData);
      setSuccess('Lưu lịch giảng dạy thành công!');

      // Reload the schedules
      await loadExistingSchedules();
    } catch (err: any) {
      console.error('❌ Save error:', err);
      console.error('❌ Error response:', err.response);
      setError(err.response?.data?.message || 'Lỗi khi lưu lịch giảng dạy');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportToExcel = () => {
    if (!selectedCourse || !selectedMajor || !semesterCode || rows.length === 0) {
      setError('Vui lòng chọn kỳ học, ngành học và có dữ liệu để xuất');
      return;
    }

    try {
      const selectedCourseData = courses.find(c => Number(c.id) === Number(selectedCourse));
      const selectedMajorData = majors.find(m => Number(m.id) === Number(selectedMajor));

      if (!selectedCourseData || !selectedMajorData) {
        setError('Không tìm thấy thông tin kỳ học hoặc ngành học');
        return;
      }

      exportTeachingScheduleToExcel({
        rows,
        selectedCourseData,
        selectedMajorData,
      });

      setSuccess('✅ Xuất file Excel thành công!');
    } catch (err) {
      console.error('Export error:', err);
      setError('Lỗi khi xuất file Excel');
    }
  };

  const handleImportExcelClick = () => {
    if (!selectedCourse || !selectedMajor || !semesterCode) {
      setError('Vui lòng chọn kỳ học và ngành học trước khi nhập Excel');
      return;
    }

    fileInputRef.current?.click();
  };

  const handleImportExcelChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!selectedCourse || !selectedMajor || !semesterCode) {
      setError('Vui lòng chọn kỳ học và ngành học trước khi nhập Excel');
      return;
    }

    try {
      setImporting(true);
      setError(null);
      setSuccess(null);

      const { rows: importedRows, metadata } = await parseTeachingScheduleExcel(file);

      if (!importedRows.length) {
        setError('File Excel không có dòng dữ liệu kế hoạch giảng dạy hợp lệ');
        return;
      }

      const selectedCourseData = courses.find(c => c.id === selectedCourse);
      const selectedMajorData = majors.find(m => m.id === selectedMajor);

      if (metadata.courseCode && selectedCourseData && normalizeComparisonText(metadata.courseCode) !== normalizeComparisonText(selectedCourseData.ma_khoa_hoc)) {
        setError(`File Excel đang thuộc khóa ${metadata.courseCode}, không khớp với năm học hiện tại ${formatters.courseCode(selectedCourseData)}`);
        return;
      }

      if (metadata.majorName && selectedMajorData && normalizeComparisonText(metadata.majorName) !== normalizeComparisonText(selectedMajorData.tenNganh)) {
        setError(`File Excel đang thuộc chuyên ngành "${metadata.majorName}", không khớp với ngành học hiện tại "${selectedMajorData.tenNganh || ''}"`);
        return;
      }

      setRows(importedRows);
      setSuccess(`✅ Đã nhập thành công ${importedRows.length} dòng từ file Excel. Vui lòng kiểm tra lại trước khi lưu.`);
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err?.message || 'Lỗi khi nhập file Excel');
    } finally {
      setImporting(false);
    }
  };

  const handleAddBreakRow = () => {
    if (!canAddNewRow()) {
      const incompleteRows = getIncompleteRows();
      setError(`Vui lòng hoàn thiện dòng ${incompleteRows.join(', ')} trước khi thêm lịch nghỉ`);
      return;
    }

    const newId = `break-${Date.now()}-${Math.random()}`;
    const newBreakRow: TeachingScheduleRow = {
      id: newId,
      stt: rows.length + 1,
      ten_hoc_phan: 'Lịch nghỉ',
      so_tin_chi: '',
      can_bo_giang_day: '',
      tuan: 'Tuần',
      ngay: 'Ngày',
      ghi_chu: '',
      isNew: true,
      isBreak: true,
    };
    setRows([...rows, newBreakRow]);
    setSuccess('✅ Đã thêm lịch nghỉ. Hãy nhấp vào các ô để chỉnh sửa tên kỳ nghỉ, tuần và ngày nghỉ.');
    setError(null);
  };

  const columns: GridColDef<TeachingScheduleRow>[] = [
    {
      field: 'stt',
      headerName: 'TT',
      width: 70,
      editable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        params.row.isAdditionalLecturer ? null : (
        <Chip
          label={params.value}
          size="small"
            color={getLecturerGroupCount(params.row.stt) > 1 ? 'info' : (validateRow(params.row) ? 'success' : 'warning')}
        />
        )
      ),
    },
    {
      field: 'ten_hoc_phan',
      headerName: 'Tên học phần *',
      width: 280,
      editable: true,
      renderCell: (params) => (
        params.row.isAdditionalLecturer ? null : (
          <div className="flex items-center gap-2">
            <span className="font-medium">{params.value}</span>
            {getLecturerGroupCount(params.row.stt) > 1 && (
              <Chip label={`${getLecturerGroupCount(params.row.stt)} GV`} size="small" color="primary" variant="outlined" />
            )}
          </div>
        )
      ),
      cellClassName: (params) => {
        return !params.value ? 'bg-red-50 border-red-200' : '';
      },
      renderEditCell: (params) => {
        const subjectOptions = subjects.map(s => ({
          label: s.tenMon,
          value: s.tenMon,
          id: s.id,
          soTinChi: s.soTinChi,
        }));

        return (
          <MuiAutocomplete
            freeSolo
            openOnFocus // Open dropdown when field is focused
            options={subjectOptions}
            value={params.value || ''}
            onChange={(_, newValue) => {
              if (typeof newValue === 'string') {
                params.api.setEditCellValue({ id: params.id, field: 'ten_hoc_phan', value: newValue });
              } else if (newValue && typeof newValue === 'object') {
                // Set subject name
                params.api.setEditCellValue({ id: params.id, field: 'ten_hoc_phan', value: newValue.label });
                // Auto-fill credit hours
                if (newValue.soTinChi) {
                  setTimeout(() => {
                    params.api.setEditCellValue({ id: params.id, field: 'so_tin_chi', value: newValue.soTinChi });
                  }, 0);
                }
              }
            }}
            onInputChange={(_, newInputValue) => {
              params.api.setEditCellValue({ id: params.id, field: 'ten_hoc_phan', value: newInputValue });
            }}
            renderInput={(inputParams) => (
              <TextField
                {...inputParams}
                autoFocus
                fullWidth
                variant="standard"
                placeholder="Chọn hoặc nhập tên học phần..."
              />
            )}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <li key={key} {...otherProps}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.soTinChi} tín chỉ</div>
                  </div>
                </li>
              );
            }}
            sx={{ width: '100%' }}
          />
        );
      },
      preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
        const hasError = !params.props.value || params.props.value.trim() === '';
        return { ...params.props, error: hasError };
      },
    },
    {
      field: 'so_tin_chi',
      headerName: 'Số tín chỉ *',
      width: 120,
      editable: true,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        params.row.isAdditionalLecturer ? null : (
          <span>{params.value}</span>
        )
      ),
      cellClassName: (params) => {
        // Don't mark as error if it's a break row
        if (params.row.isBreak) return '';
        return !params.value || params.value === '' ? 'bg-red-50 border-red-200' : '';
      },
      preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
        // Don't validate break rows
        if (params.row.isBreak) return { ...params.props, error: false };
        const value = params.props.value;
        const hasError = value === '' || value === null || Number(value) <= 0;
        return { ...params.props, error: hasError };
      },
    },
    {
      field: 'can_bo_giang_day',
      headerName: 'Cán bộ giảng dạy *',
      width: 300,
      editable: true,
      cellClassName: (params) => {
        // Don't mark as error if it's a break row
        if (params.row.isBreak) return '';
        return !params.value ? 'bg-red-50 border-red-200' : '';
      },
      renderEditCell: (params) => {
        const lecturerOptions = lecturers.map(l => {
          let label = l.hoTen;
          let subtitle = '';
          if (l.hocHam || l.trinhDoChuyenMon) {
            subtitle = [l.hocHam, l.trinhDoChuyenMon].filter(Boolean).join(', ');
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
            openOnFocus // Open dropdown when field is focused
            options={lecturerOptions}
            value={params.value || ''}
            onChange={(_, newValue) => {
              if (typeof newValue === 'string') {
                params.api.setEditCellValue({ id: params.id, field: 'can_bo_giang_day', value: newValue });
              } else if (newValue && typeof newValue === 'object') {
                params.api.setEditCellValue({ id: params.id, field: 'can_bo_giang_day', value: newValue.value });
              }
            }}
            onInputChange={(_, newInputValue) => {
              params.api.setEditCellValue({ id: params.id, field: 'can_bo_giang_day', value: newInputValue });
            }}
            renderInput={(inputParams) => (
              <TextField
                {...inputParams}
                autoFocus
                fullWidth
                variant="standard"
                placeholder="Chọn hoặc nhập tên giảng viên..."
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
      renderCell: (params) => (
        params.row.isAdditionalLecturer ? (
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">↳</span>
            <span className="font-medium text-gray-700">{params.value}</span>
          </div>
        ) : (
          <span>{params.value}</span>
        )
      ),
      preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
        // Don't validate break rows
        if (params.row.isBreak) return { ...params.props, error: false };
        const hasError = !params.props.value || params.props.value.trim() === '';
        return { ...params.props, error: hasError };
      },
    },
    {
      field: 'tuan',
      headerName: 'Tuần',
      width: 200,
      editable: true,
    },
    {
      field: 'ngay',
      headerName: 'Ngày',
      width: 250,
      editable: true,
    },
    {
      field: 'ghi_chu',
      headerName: 'Ghi chú',
      width: 200,
      editable: true,
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          {/* Don't show "Add Lecturer" button for break rows or additional lecturer rows */}
          {!params.row.isBreak && !params.row.isAdditionalLecturer && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => handleAddLecturerToSubject(params.id)}
              title="Thêm giảng viên thứ 2 cho môn này"
            >
              + GV
            </Button>
          )}
          <Button
            size="small"
            color="error"
            onClick={() => handleDeleteRow(params.id)}
            startIcon={<TrashIcon className="w-4 h-4" />}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Lên lịch giảng dạy
        </h1>
        <p className="text-gray-600">
          Quản lý lịch giảng dạy cho từng ngành và kỳ học
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Autocomplete
            label="Năm học"
            placeholder="Tìm kiếm theo mã kỳ học hoặc năm học..."
            options={courseOptions}
            value={selectedCourse}
            onChange={handleCourseChange}
            isLoading={loadingCourses}
            disabled={loading}
          />

          <Autocomplete
            label="Ngành học"
            placeholder="Tìm kiếm theo mã ngành hoặc tên ngành..."
            options={majorOptions}
            value={selectedMajor}
            onChange={handleMajorChange}
            isLoading={loadingMajors}
            disabled={loading}
          />

          <TextField
            label="Mã kỳ học - Ngành"
            value={semesterCode}
            onChange={(e) => setSemesterCode(e.target.value)}
            fullWidth
            helperText="VD: QLKT 2025.1"
          />
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" className="mb-4" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* DataGrid */}
      {selectedCourse && selectedMajor && semesterCode ? (
        <Paper elevation={2} className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <Typography variant="h6" className="text-gray-900 font-semibold">
                Danh sách môn học
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                {rows.length} dòng | {getIncompleteRows().length > 0 ?
                  <span className="text-red-600">
                    {getIncompleteRows().length} dòng chưa hoàn thiện
                  </span> :
                  <span className="text-green-600">Tất cả dòng đã hoàn thiện</span>
                }
              </Typography>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<PlusIcon className="w-5 h-5" />}
                onClick={handleAddBreakRow}
                disabled={loading}
              >
                Thêm lịch nghỉ
              </Button>
              <Button
                variant="outlined"
                startIcon={<PlusIcon className="w-5 h-5" />}
                onClick={handleAddRow}
                disabled={!canAddNewRow() || loading}
                color={canAddNewRow() ? 'primary' : 'warning'}
              >
                Thêm dòng
              </Button>
              <Button
                variant="outlined"
                color="info"
                startIcon={<ArrowDownTrayIcon className="w-5 h-5" />}
                onClick={handleExportToExcel}
                disabled={loading || importing || rows.length === 0}
              >
                Xuất Excel
              </Button>
              <Button
                variant="outlined"
                color="success"
                startIcon={<ArrowUpTrayIcon className="w-5 h-5" />}
                onClick={handleImportExcelClick}
                disabled={loading || importing}
              >
                {importing ? 'Đang nhập...' : 'Nhập Excel'}
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || loading || importing || rows.length === 0 || getIncompleteRows().length > 0}
              >
                {saving ? <CircularProgress size={20} /> : 'Lưu tất cả'}
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImportExcelChange}
          />

          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              processRowUpdate={processRowUpdate}
              onProcessRowUpdateError={handleProcessRowUpdateError}
              loading={loading || importing}
              disableRowSelectionOnClick
              editMode="cell"
              getRowClassName={(params) => {
                // Highlight break/holiday rows
                if (params.row.isBreak) return 'bg-red-50';
                // Highlight additional lecturer rows
                        if (params.row.isAdditionalLecturer) return 'bg-blue-50 group-child-row';
                return '';
              }}
              sx={{
                '& .bg-red-50': {
                  backgroundColor: '#fee2e2',
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                  '&:hover': {
                    backgroundColor: '#fecaca',
                  },
                },
                '& .bg-blue-50': {
                  backgroundColor: '#eff6ff',
                  borderLeft: '3px solid #3b82f6',
                  '&:hover': {
                    backgroundColor: '#dbeafe',
                  },
                },
                '& .group-child-row .MuiDataGrid-cell': {
                  borderTop: '1px dashed #bfdbfe',
                },
                '& .group-child-row .MuiDataGrid-cell:nth-of-type(1)': {
                  color: '#6b7280',
                },
                '& .border-red-200': {
                  borderColor: '#fecaca',
                },
                '& .MuiDataGrid-cell:focus': {
                  outline: '2px solid #3b82f6',
                },
                '& .MuiDataGrid-cell:focus-within': {
                  outline: '2px solid #3b82f6',
                },
                '& .MuiDataGrid-cell--editable': {
                  cursor: 'text',
                  '&:hover': {
                    backgroundColor: '#f3f4f6',
                  },
                },
              }}
            />
          </Box>
        </Paper>
      ) : (
        <Paper elevation={1} className="p-12 text-center">
          <Typography variant="h6" className="text-gray-500">
            Vui lòng chọn kỳ học và ngành học để bắt đầu
          </Typography>
          <Typography variant="body2" className="text-gray-400 mt-2">
            Chọn kỳ học và ngành học ở trên để tạo lịch giảng dạy
          </Typography>
        </Paper>
      )}
    </div>
  );
}
