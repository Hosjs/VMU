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
  const [gradeForm, setGradeForm] = useState({ x: '', y: '' });
  const [saving, setSaving] = useState(false);

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
      const allClasses = await gradeManagementService.getAllClassesWithInfo();

      const majorMap = new Map<string, { classes: Class[], students: number }>();

      if (Array.isArray(allClasses)) {
        allClasses.forEach((cls: Class) => {
          if (cls.maNganh && cls.tenNganh) {
            const key = cls.maNganh;
            if (!majorMap.has(key)) {
              majorMap.set(key, { classes: [], students: 0 });
            }
            const majorData = majorMap.get(key)!;
            majorData.classes.push(cls);
            majorData.students += cls.studentCount || 0;
          }
        });
      }

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

      console.log('✅ Majors loaded:', majors);
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
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error loading subject:', error);
    }
  };

  // Filter majors by search
  const filteredMajors = useMemo(() => {
    if (!Array.isArray(allMajors)) return [];

    return allMajors.filter(major => {
      const matchesSearch = !majorSearchTerm ||
        major.tenNganh.toLowerCase().includes(majorSearchTerm.toLowerCase()) ||
        major.maNganh.toLowerCase().includes(majorSearchTerm.toLowerCase());

      return matchesSearch;
    });
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
      x: grade?.x?.toString() || '',
      y: grade?.y?.toString() || '',
    });
  };

  const handleSaveGrade = async () => {
    if (!editingGrade) return;

    const x = parseFloat(gradeForm.x);
    const y = parseFloat(gradeForm.y);

    if (isNaN(x) || isNaN(y)) {
      alert('Vui lòng nhập đầy đủ điểm X và Y');
      return;
    }

    if (x < 0 || x > 10 || y < 0 || y > 10) {
      alert('Điểm phải từ 0 đến 10');
      return;
    }

    const z = (x + y) / 2;

    setSaving(true);
    try {
      await gradeManagementService.updateGrade({
        student_id: editingGrade.studentId,
        subject_id: editingGrade.subjectId,
        x,
        y,
        z,
      });

      if (selectedClass && selectedSubject) {
        const data = await gradeManagementService.getStudentsWithGrades(selectedClass.id, selectedSubject.id);
        setStudents(data.students || []);
      }

      setEditingGrade(null);
      setGradeForm({ x: '', y: '' });
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
          {/* Search */}
          <Card>
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Tìm kiếm ngành học</h2>

              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm theo tên ngành hoặc mã ngành..."
                  value={majorSearchTerm}
                  onChange={(e) => setMajorSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {majorSearchTerm && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-gray-600">Đang tìm kiếm:</span>
                  <Badge variant="info">
                    "{majorSearchTerm}"
                    <button onClick={() => setMajorSearchTerm('')} className="ml-2">
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleClearMajorFilters}>
                    Xóa tìm kiếm
                  </Button>
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
            ) : availableSubjects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpenIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Lớp này chưa có môn học nào</p>
                <p className="text-sm mt-2">Vui lòng liên hệ quản trị viên để thêm môn học</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSubjects.map((subject) => (
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

          {/* Grade Calculation Info */}
          <Card>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5" />
                Công thức tính điểm
              </h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>Điểm X:</strong> Điểm thành phần 1</p>
                <p>• <strong>Điểm Y:</strong> Điểm thành phần 2</p>
                <p>• <strong>Điểm Z (Điểm trung bình):</strong> = (X + Y) / 2</p>
                <p className="mt-2 font-semibold text-blue-900">→ Điểm Z là điểm cuối cùng của học viên</p>
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
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-700">
                                Điểm X <span className="text-red-500">*</span>
                              </label>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                value={gradeForm.x}
                                onChange={(e) => setGradeForm({ ...gradeForm, x: e.target.value })}
                                placeholder="0-10"
                                className="text-lg"
                              />
                            </div>
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
                          </div>
                          {gradeForm.x && gradeForm.y && (
                            <div className="bg-white p-3 rounded border border-blue-200">
                              <p className="text-sm text-gray-600">Điểm Z (tự động tính):</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {((parseFloat(gradeForm.x) + parseFloat(gradeForm.y)) / 2).toFixed(2)}
                              </p>
                            </div>
                          )}
                          <div className="flex gap-2 justify-end pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingGrade(null);
                                setGradeForm({ x: '', y: '' });
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
                            <div className="flex-1 grid grid-cols-4 gap-6 items-center">
                              <div>
                                <span className="text-xs text-gray-500 block mb-1">Điểm X</span>
                                <p className="font-bold text-xl text-gray-900">{grade.x ?? '-'}</p>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 block mb-1">Điểm Y</span>
                                <p className="font-bold text-xl text-gray-900">{grade.y ?? '-'}</p>
                              </div>
                              <div className="col-span-2 bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                                <span className="text-xs text-blue-600 block mb-1 font-medium">
                                  📊 Điểm trung bình (Z)
                                </span>
                                <div className="flex items-center justify-between">
                                  <p className="font-bold text-3xl text-blue-600">
                                    {grade.z?.toFixed(2) ?? '-'}
                                  </p>
                                  <Badge variant={
                                    (grade.z ?? 0) >= 5 ? 'success' : 'danger'
                                  } size="lg">
                                    {(grade.z ?? 0) >= 5 ? '✓ Đạt' : '✗ Không đạt'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">Chưa có điểm</p>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleEditGrade(student, selectedSubject.id)}
                            className="ml-4"
                          >
                            <PencilSquareIcon className="w-4 h-4 mr-1" />
                            {grade ? 'Sửa điểm' : 'Nhập điểm'}
                          </Button>
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
