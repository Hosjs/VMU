import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { gradeManagementService } from '~/services/grade-management.service';
import {
  AcademicCapIcon,
  UsersIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  XMarkIcon,
  ArrowLeftIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';

export function meta() {
  return [
    { title: "Quản lý điểm - VMU Training" },
    { name: "description", content: "Hệ thống quản lý và nhập điểm cho học sinh" },
  ];
}

interface Major {
  id: string | number;
  maNganh: string;
  tenNganh: string;
  classCount?: number;
  studentCount?: number;
}

interface Class {
  id: number;
  tenLop: string;
  khoaHoc: string | number;
  khoaHoc_id?: number;
  trangThai: string;
  tenNganh: string;
  maNganh: string;
  studentCount: number;
}

interface Grade {
  grade_id: number;
  subject_id: number;
  maMon: string;
  tenMon: string;
  soTinChi: number;
  x1: number | null;
  x2: number | null;
  x3: number | null;
  x: number | null;
  y: number | null;
  z: number | null;
}

interface Student {
  maHV: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  email: string;
  trangThaiHoc: string;
  grades: Grade[];
}

interface Subject {
  id: number;
  maMon: string;
  tenMon: string;
  soTinChi: number;
}

export default function GradeManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse URL paths manually since we're using splat route
  const pathParts = location.pathname.replace('/academic/grades', '').split('/').filter(Boolean);

  // Extract params from path
  const params = {
    majorId: pathParts[0] || undefined,
    classId: pathParts[1] || undefined,
    subjectId: pathParts[2] || undefined,
  };

  // Determine current step from URL params
  const step = useMemo(() => {
    if (params.subjectId) return 'manage-grades';
    if (params.classId) return 'select-subject';
    if (params.majorId) return 'select-class';
    return 'select-major';
  }, [params.majorId, params.classId, params.subjectId]);

  // Filters
  const [majorSearchTerm, setMajorSearchTerm] = useState('');
  const [classSearchTerm, setClassSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState('');

  // Step 1: Select major
  const [allMajors, setAllMajors] = useState<Major[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [loadingMajors, setLoadingMajors] = useState(false);

  // Step 2: Select class
  const [majorClasses, setMajorClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Step 3: Select subject
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Step 4: Manage grades
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [editingGrade, setEditingGrade] = useState<{ studentId: string; subjectId: number } | null>(null);
  const [gradeForm, setGradeForm] = useState({ x1: '', x2: '', x3: '', y: '', z: '' });
  const [saving, setSaving] = useState(false);

  // ✅ Grade permissions
  const [gradePermissions, setGradePermissions] = useState({
    canEditX: false,
    canEditY: false,
    canEditZ: false,
    isSubjectTeacher: false,
    isHomeroomTeacher: false,
  });

  // Load majors on mount
  useEffect(() => {
    loadMajors();
  }, []);

  // Load data based on URL params
  useEffect(() => {
    if (params.majorId && !selectedMajor) {
      loadMajorById(params.majorId);
    }
    if (params.classId && !selectedClass) {
      loadClassById(Number(params.classId));
    }
    if (params.subjectId && !selectedSubject) {
      loadSubjectById(Number(params.subjectId));
    }
  }, [params]);

  // Update breadcrumb context when data changes
  useEffect(() => {
    const event = new CustomEvent('grade-context-update', {
      detail: {
        major: selectedMajor,
        class: selectedClass,
        subject: selectedSubject,
      },
    });
    window.dispatchEvent(event);
  }, [selectedMajor, selectedClass, selectedSubject]);

  const loadMajors = async () => {
    setLoadingMajors(true);
    try {
      console.log('🔄 Loading majors...');
      const allClasses = await gradeManagementService.getAllClassesWithInfo();
      console.log('✅ getAllClassesWithInfo response:', allClasses);
      console.log('📊 Is array?', Array.isArray(allClasses));
      console.log('📊 Length:', allClasses?.length);

      const majorMap = new Map<string, { classes: Class[], students: number }>();

      if (Array.isArray(allClasses)) {
        allClasses.forEach((cls: Class) => {
          console.log('🔍 Processing class:', cls);
          if (cls.maNganh && cls.tenNganh) {
            const key = cls.maNganh;
            if (!majorMap.has(key)) {
              majorMap.set(key, { classes: [], students: 0 });
            }
            const majorData = majorMap.get(key)!;
            majorData.classes.push(cls);
            majorData.students += cls.studentCount || 0;
          } else {
            console.warn('⚠️  Class missing maNganh or tenNganh:', cls);
          }
        });
      }

      console.log('📦 MajorMap size:', majorMap.size);

      const majors: Major[] = Array.from(majorMap.entries()).map(([maNganh, data]) => {
        const firstClass = data.classes[0];
        return {
          id: maNganh,
          maNganh: maNganh,
          tenNganh: firstClass.tenNganh,
          classCount: data.classes.length,
          studentCount: data.students,
        };
      });

      console.log('✅ Final majors:', majors);
      setAllMajors(majors);
    } catch (error) {
      console.error('❌ Error loading majors:', error);
      setAllMajors([]);
      alert('Lỗi khi tải danh sách ngành');
    } finally {
      setLoadingMajors(false);
    }
  };

  const loadMajorById = async (majorId: string) => {
    const allClasses = await gradeManagementService.getAllClassesWithInfo();
    const filteredByMajor = allClasses.filter((cls: Class) => cls.maNganh === majorId);

    if (filteredByMajor.length > 0) {
      const firstClass = filteredByMajor[0];
      const major: Major = {
        id: majorId,
        maNganh: majorId,
        tenNganh: firstClass.tenNganh,
        classCount: filteredByMajor.length,
        studentCount: filteredByMajor.reduce((sum, cls) => sum + (cls.studentCount || 0), 0),
      };
      setSelectedMajor(major);
      setMajorClasses(filteredByMajor);
    }
  };

  const loadClassById = async (classId: number) => {
    try {
      const data = await gradeManagementService.getStudentsWithGrades(classId);
      if (data.class) {
        setSelectedClass(data.class as any);
        setAvailableSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Error loading class:', error);
    }
  };

  const loadSubjectById = async (subjectId: number) => {
    if (!params.classId) return;

    try {
      const data = await gradeManagementService.getStudentsWithGrades(Number(params.classId), subjectId);
      const subject = data.subjects?.find(s => s.id === subjectId);
      if (subject) {
        setSelectedSubject(subject);

        // ✅ Loại bỏ duplicate students dựa trên maHV
        const uniqueStudents = Array.from(
          new Map(
            (data.students || []).map(student => [student.maHV, student])
          ).values()
        ) as Student[];

        setStudents(uniqueStudents);

        // ✅ Lưu trữ permissions từ phản hồi API
        if (data.gradePermissions) {
          setGradePermissions(data.gradePermissions);
        }
      }
    } catch (error) {
      console.error('Error loading subject:', error);
    }
  };

  // Filter majors by search
  const filteredMajors = useMemo(() => {
    if (!Array.isArray(allMajors)) return [];

    // If a specific major is selected from combobox, show only that major
    if (majorSearchTerm) {
      return allMajors.filter(major => major.maNganh === majorSearchTerm);
    }

    // Otherwise show all majors
    return allMajors;
  }, [allMajors, majorSearchTerm]);

  // Get available years for selected major's classes
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    if (Array.isArray(majorClasses)) {
      majorClasses.forEach(cls => {
        if (cls.khoaHoc) {
          const year = typeof cls.khoaHoc === 'number' ? cls.khoaHoc : parseInt(String(cls.khoaHoc));
          if (!isNaN(year)) {
            years.add(year);
          }
        }
      });
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [majorClasses]);

  // Filter classes by search and year
  const filteredClasses = useMemo(() => {
    if (!Array.isArray(majorClasses)) return [];

    return majorClasses.filter(cls => {
      const khoaHocStr = String(cls.khoaHoc || '');
      const matchesSearch = !classSearchTerm ||
        cls.tenLop.toLowerCase().includes(classSearchTerm.toLowerCase()) ||
        khoaHocStr.toLowerCase().includes(classSearchTerm.toLowerCase());

      const matchesYear = !selectedYear || cls.khoaHoc === selectedYear;

      return matchesSearch && matchesYear;
    });
  }, [majorClasses, classSearchTerm, selectedYear]);

  // Filter subjects by search
  const filteredSubjects = useMemo(() => {
    if (!Array.isArray(availableSubjects)) return [];

    // If a specific subject is selected from combobox, show only that subject
    if (subjectSearchTerm) {
      const selectedId = parseInt(subjectSearchTerm);
      return availableSubjects.filter(subject => subject.id === selectedId);
    }

    // Otherwise show all subjects
    return availableSubjects;
  }, [availableSubjects, subjectSearchTerm]);

  // Handle select major - navigate to major URL
  const handleSelectMajor = async (major: Major) => {
    navigate(`/academic/grades/${major.maNganh}`);
  };

  // Handle select class - navigate to class URL
  const handleSelectClass = async (classItem: Class) => {
    navigate(`/academic/grades/${params.majorId}/${classItem.id}`);
  };

  // Handle select subject - navigate to subject URL
  const handleSelectSubject = async (subject: Subject) => {
    navigate(`/academic/grades/${params.majorId}/${params.classId}/${subject.id}`);
  };

  const handleEditGrade = (student: Student, subjectId: number) => {
    const grade = student.grades.find(g => g.subject_id === subjectId);
    setEditingGrade({ studentId: student.maHV, subjectId });
    setGradeForm({
      x1: grade?.x1?.toString() || '',
      x2: grade?.x2?.toString() || '',
      x3: grade?.x3?.toString() || '',
      y: grade?.y?.toString() || '',
      z: grade?.z?.toString() || '', // Z is auto-calculated, display only
    });
  };

  const handleSaveGrade = async () => {
    if (!editingGrade || !selectedClass) return;

    // Build grade data based on permissions
    const gradeData: any = {
      student_id: editingGrade.studentId,
      subject_id: editingGrade.subjectId,
      class_id: selectedClass.id,
    };

    // Only teachers can edit X1, X2, X3
    if (gradePermissions.canEditX) {
      if (gradeForm.x1) {
        const x1 = parseFloat(gradeForm.x1);
        if (isNaN(x1) || x1 < 0 || x1 > 10) {
          alert('Điểm X1 phải từ 0 đến 10');
          return;
        }
        gradeData.x1 = x1;
      }

      if (gradeForm.x2) {
        const x2 = parseFloat(gradeForm.x2);
        if (isNaN(x2) || x2 < 0 || x2 > 10) {
          alert('Điểm X2 phải từ 0 đến 10');
          return;
        }
        gradeData.x2 = x2;
      }

      if (gradeForm.x3) {
        const x3 = parseFloat(gradeForm.x3);
        if (isNaN(x3) || x3 < 0 || x3 > 10) {
          alert('Điểm X3 phải từ 0 đến 10');
          return;
        }
        gradeData.x3 = x3;
      }
    }

    // Only admin can edit Y
    if (gradePermissions.canEditZ && gradeForm.y) { // Admin has canEditZ = true
      const y = parseFloat(gradeForm.y);
      if (isNaN(y) || y < 0 || y > 10) {
        alert('Điểm Y phải từ 0 đến 10');
        return;
      }
      gradeData.y = y;
    }

    // Check if at least one grade field is being updated
    if (!gradeData.x1 && !gradeData.x2 && !gradeData.x3 && !gradeData.y) {
      alert('Vui lòng nhập ít nhất một điểm');
      return;
    }

    setSaving(true);
    try {
      await gradeManagementService.updateGrade(gradeData);

      if (selectedClass && selectedSubject) {
        const data = await gradeManagementService.getStudentsWithGrades(selectedClass.id, selectedSubject.id);

        // ✅ Loại bỏ duplicate students sau khi cập nhật
        const uniqueStudents = Array.from(
          new Map(
            (data.students || []).map(student => [student.maHV, student])
          ).values()
        ) as Student[];

        setStudents(uniqueStudents);

        // Update permissions if changed
        if (data.gradePermissions) {
          setGradePermissions(data.gradePermissions);
        }
      }

      setEditingGrade(null);
      setGradeForm({ x1: '', x2: '', x3: '', y: '', z: '' });
      alert('Cập nhật điểm thành công!');
    } catch (error: any) {
      console.error('Error saving grade:', error);
      alert(error.message || 'Lỗi khi lưu điểm');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step === 'manage-grades') {
      navigate(`/academic/grades/${params.majorId}/${params.classId}`);
    } else if (step === 'select-subject') {
      navigate(`/academic/grades/${params.majorId}`);
    } else if (step === 'select-class') {
      navigate('/academic/grades');
    }
  };

  const handleClearMajorFilters = () => {
    setMajorSearchTerm('');
  };

  const handleClearClassFilters = () => {
    setClassSearchTerm('');
    setSelectedYear(null);
  };

  const handleClearSubjectFilters = () => {
    setSubjectSearchTerm('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <AcademicCapIcon className="w-8 h-8 text-blue-600" />
            Quản lý điểm học sinh
          </h1>
          <p className="text-gray-600 mt-1">
            Nhập và chỉnh sửa điểm cho học sinh theo ngành, lớp và môn học
          </p>
        </div>
        {step !== 'select-major' && (
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        )}
      </div>


      {/* Step 1: Select Major */}
      {step === 'select-major' && (
        <div className="space-y-6">
          {/* Major Filter */}
          <Card>
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BuildingLibraryIcon className="w-6 h-6 text-blue-600" />
                Lọc ngành học
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn ngành học
                  </label>
                  <Select
                    value={majorSearchTerm}
                    onChange={(e) => setMajorSearchTerm(e.target.value)}
                    className="w-full"
                  >
                    <option value="">-- Tất cả ngành học --</option>
                    {allMajors.map((major) => (
                      <option key={major.id} value={major.maNganh}>
                        {major.maNganh} - {major.tenNganh} ({major.classCount} lớp, {major.studentCount} SV)
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex items-end">
                  {majorSearchTerm && (
                    <Button
                      variant="outline"
                      onClick={handleClearMajorFilters}
                      className="w-full"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>
              </div>

              {majorSearchTerm && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-gray-600">Đang lọc:</span>
                  <Badge variant="info">
                    {allMajors.find(m => m.maNganh === majorSearchTerm)?.tenNganh || 'Ngành học'}
                    <button onClick={() => setMajorSearchTerm('')} className="ml-2">
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                </div>
              )}

              <div className="text-sm text-gray-600">
                Hiển thị <strong>{filteredMajors.length}</strong> / {allMajors.length} ngành
              </div>
            </div>
          </Card>

          {/* Majors List */}
          <Card>
            <h2 className="text-xl font-bold mb-4">Danh sách ngành học</h2>

            {loadingMajors ? (
              <div className="text-center py-12">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p>Đang tải...</p>
              </div>
            ) : filteredMajors.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Không tìm thấy ngành nào phù hợp</p>
                <Button variant="outline" onClick={handleClearMajorFilters} className="mt-4">
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMajors.map((major) => (
                  <div
                    key={major.id}
                    onClick={() => handleSelectMajor(major)}
                    className="p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <BuildingLibraryIcon className="h-8 w-8 text-blue-600 group-hover:text-blue-700" />
                      <Badge variant="info">{major.maNganh}</Badge>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {major.tenNganh}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Số lớp:</span>
                        <span className="font-semibold text-gray-900">{major.classCount || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Số học sinh:</span>
                        <span className="font-semibold text-gray-900">{major.studentCount || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Step 2: Select Class */}
      {step === 'select-class' && selectedMajor && (
        <div className="space-y-6">
          {/* Major Info */}
          <Card>
            <div className="flex items-center gap-4">
              <BuildingLibraryIcon className="w-12 h-12 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedMajor.tenNganh}</h2>
                <p className="text-gray-600 mt-1">
                  Mã ngành: {selectedMajor.maNganh} | {selectedMajor.classCount} lớp | {selectedMajor.studentCount} học sinh
                </p>
              </div>
            </div>
          </Card>

          {/* Search and Filters */}
          <Card>
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Tìm kiếm và lọc lớp học</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tìm kiếm lớp
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Tìm theo tên lớp..."
                      value={classSearchTerm}
                      onChange={(e) => setClassSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lọc theo năm học
                  </label>
                  <Select
                    value={selectedYear?.toString() || ''}
                    onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Tất cả các năm</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Select>
                </div>
              </div>

              {(classSearchTerm || selectedYear) && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-gray-600">Đang lọc:</span>
                  {classSearchTerm && (
                    <Badge variant="info">
                      Tìm kiếm: "{classSearchTerm}"
                      <button onClick={() => setClassSearchTerm('')} className="ml-2">
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedYear && (
                    <Badge variant="success">
                      Năm: {selectedYear}
                      <button onClick={() => setSelectedYear(null)} className="ml-2">
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={handleClearClassFilters}>
                    Xóa tất cả
                  </Button>
                </div>
              )}

              <div className="text-sm text-gray-600">
                Hiển thị <strong>{filteredClasses.length}</strong> / {majorClasses.length} lớp
              </div>
            </div>
          </Card>

          {/* Classes List */}
          <Card>
            <h2 className="text-xl font-bold mb-4">Danh sách lớp học</h2>

            {loadingClasses ? (
              <div className="text-center py-12">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p>Đang tải...</p>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Không tìm thấy lớp nào phù hợp</p>
                <Button variant="outline" onClick={handleClearClassFilters} className="mt-4">
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    onClick={() => handleSelectClass(classItem)}
                    className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                      <Badge variant="default">{classItem.khoaHoc}</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{classItem.tenLop}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{classItem.studentCount} học sinh</span>
                      <span className="hidden md:inline">|</span>
                      <span className="hidden md:inline">{classItem.trangThai}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Step 3: Select Subject */}
      {step === 'select-subject' && selectedClass && (
        <div className="space-y-6">
          {/* Class Info */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedClass.tenLop}</h2>
                <p className="text-gray-600 mt-1">
                  {selectedClass.tenNganh} - Khóa {selectedClass.khoaHoc}
                </p>
              </div>
              <Badge variant="success">{selectedClass.trangThai}</Badge>
            </div>
          </Card>

          {/* Subject Filter */}
          <Card>
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpenIcon className="w-6 h-6 text-blue-600" />
                Lọc môn học
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn môn học
                  </label>
                  <Select
                    value={subjectSearchTerm}
                    onChange={(e) => setSubjectSearchTerm(e.target.value)}
                    className="w-full"
                  >
                    <option value="">-- Tất cả môn học --</option>
                    {availableSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id.toString()}>
                        {subject.maMon} - {subject.tenMon} ({subject.soTinChi} TC)
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex items-end">
                  {subjectSearchTerm && (
                    <Button
                      variant="outline"
                      onClick={handleClearSubjectFilters}
                      className="w-full"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>
              </div>

              {subjectSearchTerm && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-gray-600">Đang lọc:</span>
                  <Badge variant="info">
                    {availableSubjects.find(s => s.id.toString() === subjectSearchTerm)?.tenMon || 'Môn học'}
                    <button onClick={() => setSubjectSearchTerm('')} className="ml-2">
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                </div>
              )}

              <div className="text-sm text-gray-600">
                Hiển thị <strong>{filteredSubjects.length}</strong> / {availableSubjects.length} môn học
              </div>
            </div>
          </Card>

          {/* Subjects List */}
          <Card>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpenIcon className="w-6 h-6 text-blue-600" />
              Chọn môn học để nhập điểm
            </h2>

            {loadingSubjects ? (
              <div className="text-center py-12">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p>Đang tải danh sách môn học...</p>
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpenIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                {availableSubjects.length === 0 ? (
                  <>
                    <p>Lớp này chưa có môn học nào</p>
                    <p className="text-sm mt-2">Vui lòng liên hệ quản trị viên để thêm môn học</p>
                  </>
                ) : (
                  <>
                    <p>Không tìm thấy môn học nào phù hợp</p>
                    <Button variant="outline" onClick={handleClearSubjectFilters} className="mt-4">
                      Xóa bộ lọc
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    onClick={() => handleSelectSubject(subject)}
                    className="p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <BookOpenIcon className="w-6 h-6 text-green-600 group-hover:text-blue-600 transition-colors" />
                      <Badge variant="info">{subject.soTinChi} TC</Badge>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {subject.tenMon}
                    </h3>
                    <p className="text-sm text-gray-500">Mã môn: {subject.maMon}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Step 4: Manage Grades */}
      {step === 'manage-grades' && selectedClass && selectedSubject && (
        <div className="space-y-6">
          {/* Class & Subject Info */}
          <Card>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedClass.tenLop}</h2>
                  <p className="text-gray-600 mt-1">
                    {selectedClass.tenNganh} - Khóa {selectedClass.khoaHoc}
                  </p>
                </div>
                <Badge variant="success">{selectedClass.trangThai}</Badge>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <BookOpenIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{selectedSubject.tenMon}</p>
                    <p className="text-sm text-gray-600">
                      Mã môn: {selectedSubject.maMon} | Số tín chỉ: {selectedSubject.soTinChi}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Students List */}
          {loadingStudents ? (
            <Card>
              <div className="text-center py-12">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p>Đang tải danh sách học sinh...</p>
              </div>
            </Card>
          ) : students.length === 0 ? (
            <Card>
              <div className="text-center py-12 text-gray-500">
                <UsersIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Không có học sinh nào trong lớp này</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Permission Notice */}
              <Card>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Quyền nhập điểm của bạn:</h3>
                      <div className="space-y-1 text-sm">
                        {gradePermissions.canEditX && gradePermissions.canEditY && gradePermissions.canEditZ ? (
                          <p className="text-green-700 font-medium">✅ Admin: Bạn có thể nhập tất cả các loại điểm (X1, X2, X3, Y)</p>
                        ) : (
                          <>
                            {gradePermissions.isSubjectTeacher && (
                              <p className="text-blue-700">
                                <span className="font-medium">👨‍🏫 Giáo viên môn học:</span> Bạn chỉ được nhập <strong>Điểm X1, X2, X3</strong> (Điểm quá trình)
                              </p>
                            )}
                            {!gradePermissions.canEditX && !gradePermissions.canEditZ && (
                              <p className="text-orange-700 font-medium">⚠️ Bạn không có quyền nhập điểm cho lớp này</p>
                            )}
                            <p className="text-gray-600 italic mt-2">
                              💡 <strong>Lưu ý:</strong> Điểm X = TB(X1, X2, X3), Điểm Z = (X + Y) / 2 (tự động tính)
                            </p>
                            <p className="text-gray-600 italic">
                              💡 Chỉ Admin mới có thể nhập Điểm Y
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Hiển thị số lượng học viên */}
              <Card>
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <UsersIcon className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Tổng số học viên</p>
                      <p className="text-2xl font-bold text-blue-600">{students.length} học viên</p>
                    </div>
                  </div>
                  <Badge variant="info" size="lg">
                    Môn: {selectedSubject.tenMon}
                  </Badge>
                </div>
              </Card>

              {students.map((student) => {
                const grade = student.grades.find(g => g.subject_id === selectedSubject.id);

                return (
                  <Card key={student.maHV}>
                    <div className="space-y-4">
                      {/* Student Info */}
                      <div className="flex items-center justify-between border-b pb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{student.hoTen}</h3>
                          <p className="text-sm text-gray-600">
                            Mã SV: {student.maHV} | {student.gioiTinh} | {student.email}
                          </p>
                        </div>
                        <Badge variant={student.trangThaiHoc === 'DangHoc' ? 'success' : 'default'}>
                          {student.trangThaiHoc}
                        </Badge>
                      </div>

                      {/* Grade Input/Display */}
                      {editingGrade?.studentId === student.maHV &&
                       editingGrade?.subjectId === selectedSubject.id ? (
                        // Edit Mode
                        <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg space-y-3">
                          {/* Teacher can edit X1, X2, X3 */}
                          {(gradePermissions.canEditX || gradePermissions.canEditZ) && (
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-700">Điểm quá trình (X1, X2, X3)</h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1 text-gray-700">
                                    Điểm X1 {gradePermissions.canEditX && <span className="text-red-500">*</span>}
                                  </label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    value={gradeForm.x1}
                                    onChange={(e) => setGradeForm({ ...gradeForm, x1: e.target.value })}
                                    placeholder="0-10"
                                    className="text-lg"
                                    disabled={!gradePermissions.canEditX}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1 text-gray-700">
                                    Điểm X2 {gradePermissions.canEditX && <span className="text-red-500">*</span>}
                                  </label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    value={gradeForm.x2}
                                    onChange={(e) => setGradeForm({ ...gradeForm, x2: e.target.value })}
                                    placeholder="0-10"
                                    className="text-lg"
                                    disabled={!gradePermissions.canEditX}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1 text-gray-700">
                                    Điểm X3 {gradePermissions.canEditX && <span className="text-red-500">*</span>}
                                  </label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    value={gradeForm.x3}
                                    onChange={(e) => setGradeForm({ ...gradeForm, x3: e.target.value })}
                                    placeholder="0-10"
                                    className="text-lg"
                                    disabled={!gradePermissions.canEditX}
                                  />
                                </div>
                              </div>
                              {!gradePermissions.canEditX && (
                                <p className="text-xs text-gray-500">Chỉ xem (không có quyền sửa)</p>
                              )}
                            </div>
                          )}

                          {/* Only Admin can edit Y */}
                          {gradePermissions.canEditZ && (
                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-700">
                                Điểm Y <span className="text-red-500">*</span>
                              </label>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                value={gradeForm.y}
                                onChange={(e) => setGradeForm({ ...gradeForm, y: e.target.value })}
                                placeholder="0-10"
                                className="text-lg"
                              />
                            </div>
                          )}

                          {/* Show auto-calculated X and Z preview */}
                          {gradeForm.x1 && gradeForm.x2 && gradeForm.x3 && (
                            <div className="bg-white p-3 rounded border border-blue-200 space-y-2">
                              <div>
                                <p className="text-sm text-gray-600">Điểm X (trung bình X1, X2, X3):</p>
                                <p className="text-xl font-bold text-green-600">
                                  {((parseFloat(gradeForm.x1) + parseFloat(gradeForm.x2) + parseFloat(gradeForm.x3)) / 3).toFixed(2)}
                                </p>
                              </div>
                              {gradeForm.y && (
                                <div>
                                  <p className="text-sm text-gray-600">Điểm Z (tự động tính):</p>
                                  <p className="text-2xl font-bold text-blue-600">
                                    {(
                                      ((parseFloat(gradeForm.x1) + parseFloat(gradeForm.x2) + parseFloat(gradeForm.x3)) / 3 + parseFloat(gradeForm.y)) / 2
                                    ).toFixed(2)}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">Công thức: Z = (X + Y) / 2</p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex gap-2 justify-end pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingGrade(null);
                                setGradeForm({ x1: '', x2: '', x3: '', y: '', z: '' });
                              }}
                              disabled={saving}
                            >
                              Hủy
                            </Button>
                            <Button size="sm" onClick={handleSaveGrade} disabled={saving}>
                              {saving ? 'Đang lưu...' : '💾 Lưu điểm'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                          {grade ? (
                            <div className="flex-1 space-y-3">
                              {/* X1, X2, X3 */}
                              <div className="grid grid-cols-4 gap-4">
                                <div>
                                  <span className="text-xs text-gray-500 block mb-1">Điểm X1</span>
                                  <p className="font-bold text-lg text-gray-900">{grade.x1?.toFixed(2) ?? '-'}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500 block mb-1">Điểm X2</span>
                                  <p className="font-bold text-lg text-gray-900">{grade.x2?.toFixed(2) ?? '-'}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500 block mb-1">Điểm X3</span>
                                  <p className="font-bold text-lg text-gray-900">{grade.x3?.toFixed(2) ?? '-'}</p>
                                </div>
                                <div className="bg-green-50 p-2 rounded border border-green-200">
                                  <span className="text-xs text-green-600 block mb-1 font-medium">TB Quá trình (X)</span>
                                  <p className="font-bold text-lg text-green-600">{grade.x?.toFixed(2) ?? '-'}</p>
                                </div>
                              </div>

                              {/* Y and Z */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                  <span className="text-xs text-yellow-700 block mb-1 font-medium">Điểm Y</span>
                                  <p className="font-bold text-2xl text-yellow-700">{grade.y?.toFixed(2) ?? '-'}</p>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                                  <span className="text-xs text-blue-600 block mb-1 font-medium">
                                    📊 Điểm Z (Tổng kết)
                                  </span>
                                  <div className="flex items-center justify-between">
                                    <p className="font-bold text-2xl text-blue-600">
                                      {grade.z?.toFixed(2) ?? '-'}
                                    </p>
                                    <Badge variant={
                                      (grade.z ?? 0) >= 5 ? 'success' : 'danger'
                                    }>
                                      {(grade.z ?? 0) >= 5 ? '✓ Đạt' : '✗ Không đạt'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">Chưa có điểm</p>
                          )}
                          {(gradePermissions.canEditX || gradePermissions.canEditY || gradePermissions.canEditZ) && (
                            <Button
                              size="sm"
                              onClick={() => handleEditGrade(student, selectedSubject.id)}
                              className="ml-4"
                            >
                              <PencilSquareIcon className="w-4 h-4 mr-1" />
                              {grade ? 'Sửa điểm' : 'Nhập điểm'}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
