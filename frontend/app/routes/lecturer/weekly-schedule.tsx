import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Tooltip,
} from '@mui/material';
import { PlusIcon, TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import weeklyScheduleService from '~/services/weeklyScheduleService';
import { roomService } from '~/services/room.service';
import { subjectService } from '~/services/subject.service';
import { lecturerService } from '~/services/lecturer.service';
import { courseService } from '~/services/course.service';
import { majorSubjectService } from '~/services/major-subject.service';
import { getTeachingSchedules } from '~/services/teachingScheduleService';
import { exportWeeklyScheduleToExcel, exportWeeklyScheduleToPDF } from '~/utils/excelExporter';
import { parseWeeklyScheduleExcel } from '~/utils/weeklyScheduleExcelImporter';
import { formatters } from '~/utils/formatters';
import type { WeeklyScheduleRow, BulkSaveWeeklyScheduleRequest, Week } from '~/types/weekly-schedule';
import type { Room } from '~/types/room';
import type { Subject } from '~/types/subject';
import type { Course } from '~/types/course';
import type { TeachingSchedule } from '~/types/teaching-schedule';


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
  const [teachingSchedules, setTeachingSchedules] = useState<TeachingSchedule[]>([]); // ✅ Store teaching schedules for comparison
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [addingClassToRow, setAddingClassToRow] = useState<string | number | null>(null);
  const [newClassInput, setNewClassInput] = useState<string>('');
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

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
      loadTeachingSchedules(); // ✅ Load teaching schedules for lecturer comparison
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

  // ✅ Load teaching schedules for lecturer comparison
  const loadTeachingSchedules = async () => {
    if (!selectedCourse) return;

    try {
      // Load teaching schedules for this course
      const schedules = await getTeachingSchedules({
        khoa_hoc_id: selectedCourse,
      });
      setTeachingSchedules(schedules || []);
    } catch (err) {
      console.error('❌ Error loading teaching schedules:', err);
      setTeachingSchedules([]);
    }
  };

  // ✅ Helper: Get assigned lecturers for a subject from teaching_schedules
  // Returns array of all lecturers assigned to this subject
  const getAssignedLecturers = (subjectName: string): string[] => {
    if (!subjectName || teachingSchedules.length === 0) return [];

    // Find ALL teaching schedules with matching subject name
    const matchingSchedules = teachingSchedules.filter(
      ts => ts.ten_hoc_phan?.toLowerCase().trim() === subjectName.toLowerCase().trim()
    );

    // Extract lecturer names and remove duplicates
    const lecturerNames = matchingSchedules
      .map(schedule => schedule.can_bo_giang_day)
      .filter(name => name && name.trim() !== '') // Remove null/empty
      .map(name => name!.trim());

    // Return unique lecturer names
    return [...new Set(lecturerNames)];
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
        // Prefill from teaching plan for this course if weekly data does not exist yet.
        const planSchedules = await getTeachingSchedules({
          khoa_hoc_id: selectedCourse,
        });

        setTeachingSchedules(planSchedules || []);

        const prefilledRows = createRowsFromTeachingPlan(planSchedules || []);
        if (prefilledRows.length > 0) {
          setRows(prefilledRows);
          setSuccess(`Đã nạp ${prefilledRows.length} môn từ kế hoạch giảng dạy. Bạn có thể chỉnh sửa trước khi lưu.`);
        } else {
          // Create empty rows if no teaching plan data
          setRows(createEmptyRows(5));
        }
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

  const createRowsFromTeachingPlan = (planRows: TeachingSchedule[]): WeeklyScheduleRow[] => {
    if (!planRows.length) return [];

    const groupedBySubject = new Map<string, {
      stt: number;
      subject_name: string;
      lecturers: string[];
    }>();

    for (const plan of planRows) {
      const subjectName = plan.ten_hoc_phan?.trim() || '';
      const isBreakRow = plan.so_tin_chi === 0 || !subjectName;

      if (isBreakRow) continue;

      const key = subjectName.toLowerCase();
      const currentLecturer = plan.can_bo_giang_day?.trim();
      const currentStt = Number(plan.stt) || 0;

      if (!groupedBySubject.has(key)) {
        groupedBySubject.set(key, {
          stt: currentStt,
          subject_name: subjectName,
          lecturers: currentLecturer ? [currentLecturer] : [],
        });
        continue;
      }

      const existing = groupedBySubject.get(key);
      if (!existing) continue;

      if (currentStt > 0 && (existing.stt === 0 || currentStt < existing.stt)) {
        existing.stt = currentStt;
      }

      if (currentLecturer && !existing.lecturers.some(name => name.toLowerCase() === currentLecturer.toLowerCase())) {
        existing.lecturers.push(currentLecturer);
      }
    }

    const sortedSubjects = Array.from(groupedBySubject.values()).sort((a, b) => {
      if (a.stt === 0 && b.stt === 0) return a.subject_name.localeCompare(b.subject_name);
      if (a.stt === 0) return 1;
      if (b.stt === 0) return -1;
      return a.stt - b.stt;
    });

    return sortedSubjects.map((subject, index) => ({
      id: `prefill-${Date.now()}-${index}`,
      stt: index + 1,
      class_names: [],
      subject_name: subject.subject_name,
      lecturer_name: subject.lecturers.join(', '),
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

      // Prepare data for bulk save - each row has its own class_ids
      const schedulesData = rows
        .filter((row) => row.class_names.length > 0 && (row.subject_name.trim() || row.lecturer_name.trim()))
        .map((row) => {
          // Map class names to IDs for this specific row
          const rowClassIds = row.class_names
            .map(className => {
              const foundClass = classes.find(c => c.class_name === className);
              return foundClass?.id;
            })
            .filter((id): id is number => id !== undefined);

          return {
            stt: row.stt,
            class_ids: rowClassIds, // Each row has its own class_ids
            subject_id: null,
            subject_name: row.subject_name.trim() || null,
            lecturer_id: null,
            lecturer_name: row.lecturer_name.trim() || null,
            time_slot: row.time_slot.trim() || null,
            room: row.room.trim() || null,
            ghi_chu: row.ghi_chu?.trim() || null,
          };
        });

      if (schedulesData.length === 0) {
        setError('Không có dữ liệu hợp lệ để lưu');
        return;
      }

      const request: BulkSaveWeeklyScheduleRequest = {
        week_number: String(selectedWeek),
        khoa_hoc_id: selectedCourse,
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
      const selectedCourseData = courses.find(c => Number(c.id) === Number(selectedCourse));
      const selectedWeekData = weeks.find(w => Number(w.week_number) === Number(selectedWeek));

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

  const handleExportPDF = async () => {
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
      const selectedCourseData = courses.find(c => Number(c.id) === Number(selectedCourse));
      const selectedWeekData = weeks.find(w => Number(w.week_number) === Number(selectedWeek));

      if (!selectedCourseData || !selectedWeekData) {
        setError('Không tìm thấy thông tin kỳ học hoặc tuần học');
        return;
      }

      // Call the PDF export utility (async - html2canvas)
      await exportWeeklyScheduleToPDF({
        rows,
        selectedCourseData: {
          ma_khoa_hoc: selectedCourseData.ma_khoa_hoc,
          dot: selectedCourseData.dot,
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

  const handleImportExcelClick = () => {
    importFileInputRef.current?.click();
  };

  const handleImportExcelChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!selectedCourse || !selectedWeek) {
      setError('Vui lòng chọn kỳ học và tuần trước khi nhập file Excel');
      return;
    }

    try {
      setImporting(true);
      setError(null);
      setSuccess(null);

      const importedRows = await parseWeeklyScheduleExcel(file);
      setRows(importedRows);
      setSuccess(`✅ Đã nhập ${importedRows.length} dòng từ file Excel. Vui lòng kiểm tra và lưu lại.`);
    } catch (err: any) {
      console.error('❌ Error importing weekly schedule Excel:', err);
      setError(err?.message || 'Lỗi khi nhập file Excel lịch học tuần');
    } finally {
      setImporting(false);
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

        const handleRemoveClass = async (classNameToRemove: string) => {
          try {
            // Find the class ID
            const classToRemove = classes.find(c => c.class_name === classNameToRemove);

            // If we have course, week, and class selected, call API to delete from backend
            if (selectedCourse && selectedWeek && classToRemove) {
              await weeklyScheduleService.deleteByClass({
                week_number: String(selectedWeek),
                khoa_hoc_id: selectedCourse,
                class_id: classToRemove.id,
              });
              setSuccess(`✅ Đã xóa lớp ${classNameToRemove} khỏi lịch học`);
              setTimeout(() => setSuccess(null), 2000);
            }

            // Update local state
            const updatedRows = rows.map(r => {
              if (r.id === params.id) {
                return { ...r, class_names: r.class_names.filter(cn => cn !== classNameToRemove) };
              }
              return r;
            });
            setRows(updatedRows);
          } catch (err: any) {
            console.error('❌ Error removing class:', err);
            setError(err?.response?.data?.message || `Lỗi khi xóa lớp ${classNameToRemove}`);
          }
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
      renderCell: (params) => {
        const row = rows.find(r => r.id === params.id);
        if (!row) return null;

        const assignedLecturers = getAssignedLecturers(row.subject_name);
        const currentLecturer = row.lecturer_name;

        // Check if current lecturer is in the list of assigned lecturers
        const isMatch = assignedLecturers.length === 0 ||
                       !currentLecturer ||
                       assignedLecturers.some(assigned =>
                         assigned.toLowerCase().trim() === currentLecturer.toLowerCase().trim()
                       );

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <span>{currentLecturer}</span>
            {!isMatch && assignedLecturers.length > 0 && (
              <Tooltip title={`⚠️ Giảng viên được phân công: ${assignedLecturers.join(', ')}`}>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#ff9800',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'help',
                  }}
                >
                  !
                </Box>
              </Tooltip>
            )}
          </Box>
        );
      },
      renderEditCell: (params) => {
        const row = rows.find(r => r.id === params.id);
        const assignedLecturers = row ? getAssignedLecturers(row.subject_name) : [];

        // ✅ Build lecturer options with ALL assigned lecturers at top
        let lecturerOptions: Array<{
          label: string;
          subtitle: string;
          value: string;
          id: number;
          isAssigned?: boolean;
          isDivider?: boolean;
        }> = [];

        // Track IDs of assigned lecturers to avoid duplicates
        const assignedLecturerIds = new Set<number>();

        // Add ALL assigned lecturers at the top
        assignedLecturers.forEach(assignedLecturerName => {
          const assignedLecturerObj = lecturers.find(
            l => l.hoTen.toLowerCase().trim() === assignedLecturerName.toLowerCase().trim()
          );

          if (assignedLecturerObj) {
            let subtitle = '✅ Được phân công';
            if (assignedLecturerObj.hocHam || assignedLecturerObj.trinhDoChuyenMon) {
              subtitle = `✅ Được phân công • ${[assignedLecturerObj.hocHam, assignedLecturerObj.trinhDoChuyenMon].filter(Boolean).join(', ')}`;
            }

            lecturerOptions.push({
              label: assignedLecturerObj.hoTen,
              subtitle,
              value: assignedLecturerObj.hoTen,
              id: assignedLecturerObj.id,
              isAssigned: true,
            });

            assignedLecturerIds.add(assignedLecturerObj.id);
          }
        });

        // Add divider if there are assigned lecturers
        if (assignedLecturers.length > 0) {
          lecturerOptions.push({
            label: '─────────────────────',
            subtitle: 'Giảng viên khác',
            value: '',
            id: -1,
            isDivider: true,
          });
        }

        // Add other lecturers (excluding assigned lecturers)
        lecturers.forEach(l => {
          // Skip if already added as assigned lecturer
          if (assignedLecturerIds.has(l.id)) return;

          let subtitle = '';
          if (l.hocHam || l.trinhDoChuyenMon) {
            subtitle = [l.hocHam, l.trinhDoChuyenMon].filter(Boolean).join(', ');
          }

          lecturerOptions.push({
            label: l.hoTen,
            subtitle,
            value: l.hoTen,
            id: l.id,
          });
        });

        return (
          <Box sx={{ width: '100%' }}>
            {assignedLecturers.length > 0 && (
              <Box sx={{
                mb: 1,
                p: 0.5,
                backgroundColor: '#d4edda',
                borderRadius: 1,
                fontSize: '0.75rem',
                color: '#155724',
                border: '1px solid #c3e6cb',
              }}>
                ✅ Phân công: <strong>{assignedLecturers.join(', ')}</strong>
              </Box>
            )}
            <MuiAutocomplete
              freeSolo
              openOnFocus
              options={lecturerOptions}
              value={params.value || ''}
              getOptionDisabled={(option) => Boolean(option.isDivider)}
              onChange={(_, newValue) => {
                if (typeof newValue === 'string') {
                  params.api.setEditCellValue({ id: params.id, field: 'lecturer_name', value: newValue });
                } else if (newValue && typeof newValue === 'object' && !newValue.isDivider) {
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
                  placeholder={assignedLecturers.length > 0 ? `Phân công: ${assignedLecturers.join(', ')}` : "Chọn hoặc nhập giảng viên..."}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;

                // Divider style
                if (option.isDivider) {
                  return (
                    <li
                      key={key}
                      style={{
                        pointerEvents: 'none',
                        backgroundColor: '#f8f9fa',
                        padding: '4px 16px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: '#6c757d',
                      }}
                    >
                      {option.subtitle}
                    </li>
                  );
                }

                // Assigned lecturer style
                if (option.isAssigned) {
                  return (
                    <li
                      key={key}
                      {...otherProps}
                      style={{
                        ...otherProps.style,
                        backgroundColor: '#d4edda',
                        borderLeft: '4px solid #28a745',
                      }}
                    >
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-green-700">{option.subtitle}</div>
                      </div>
                    </li>
                  );
                }

                // Regular lecturer style
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
          </Box>
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
  ], [rows, classes, subjects, majorSubjectsMap, lecturers, teachingSchedules, loadSubjectsByMajor, handleDeleteRow]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Quản lý Lịch học theo Tuần
        </Typography>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 250 }} size="small">
            <InputLabel>Năm học *</InputLabel>
            <Select
              value={selectedCourse || ''}
              onChange={(e) => {
                setSelectedCourse(Number(e.target.value));
                setSelectedWeek(null);
                setRows([]);
              }}
              label="Năm học *"
            >
              <MenuItem value="">
                <em>-- Chọn năm học --</em>
              </MenuItem>
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {formatters.courseCode(course)} ({formatters.courseCodeDetail(course)})
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
            disabled={saving || importing || rows.length === 0}
          >
            {saving ? <CircularProgress size={20} /> : 'Lưu lịch học'}
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<ArrowUpTrayIcon className="h-5 w-5" />}
            onClick={handleImportExcelClick}
            disabled={loading || importing}
          >
            {importing ? 'Đang nhập...' : 'Nhập Excel'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
            onClick={handleExport}
            disabled={importing || rows.length === 0}
          >
            Xuất Excel
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
            onClick={handleExportPDF}
            disabled={importing || rows.length === 0}
          >
            Xuất PDF
          </Button>
        </Box>

        <input
          ref={importFileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleImportExcelChange}
        />

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
            <li>Chọn năm học từ dropdown (VD: 2025.1)</li>
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
