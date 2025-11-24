import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { gradeManagementService } from '~/services/grade-management.service';
import { majorService } from '~/services/major.service';
import {
  AcademicCapIcon,
  UsersIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  XMarkIcon,
  ArrowLeftIcon,
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
  years: number[];
}

interface Class {
  id: number;
  tenLop: string;
  khoaHoc: string;
  khoaHoc_id?: number; // Thêm để hỗ trợ cột mới
  trangThai: string;
  tenNganh: string;
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
  const [step, setStep] = useState<'select-major' | 'view-subjects' | 'select-class' | 'manage-grades'>('select-major');
  const navigate = useNavigate();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Step 1: Select major
  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [loadingMajors, setLoadingMajors] = useState(false);

  // Step 2: View subjects of major
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Step 3: Select class
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Step 4: Manage grades
  const [students, setStudents] = useState<Student[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [editingGrade, setEditingGrade] = useState<{ studentId: string; subjectId: number } | null>(null);
  const [gradeForm, setGradeForm] = useState({ x: '', y: '', z: '' });
  const [saving, setSaving] = useState(false);

  // Load majors on mount
  useEffect(() => {
    loadMajors();
  }, []);

  const loadMajors = async () => {
    setLoadingMajors(true);
    try {
      const data = await gradeManagementService.getMajorsWithYears();
      console.log('✅ Majors data received:', data);
      setMajors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error loading majors:', error);
      setMajors([]);
      alert('Lỗi khi tải danh sách ngành');
    } finally {
      setLoadingMajors(false);
    }
  };

  // Get all unique years from majors
  const allYears = useMemo(() => {
    const years = new Set<number>();
    majors.forEach(major => {
      major.years.forEach(year => years.add(year));
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, [majors]);

  // Filter majors by search term and year
  const filteredMajors = useMemo(() => {
    return majors.filter(major => {
      const matchesSearch = !searchTerm ||
        major.tenNganh.toLowerCase().includes(searchTerm.toLowerCase()) ||
        major.maNganh.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesYear = !selectedYear || major.years.includes(selectedYear);

      return matchesSearch && matchesYear;
    });
  }, [majors, searchTerm, selectedYear]);

  // Handle select major and load subjects
  const handleSelectMajor = async (major: Major) => {
    setSelectedMajor(major);
    setLoadingSubjects(true);
    try {
      console.log('🔍 Loading subjects for major:', major.maNganh);
      const response = await majorService.getMajorSubjects(Number(major.id));
      console.log('📚 Subjects response:', response);

      // ✅ Remove duplicates based on subject ID
      const uniqueSubjects = response.subjects
        ? response.subjects.filter((subject, index, self) =>
            index === self.findIndex(s => s.id === subject.id)
          )
        : [];

      console.log('📚 Unique subjects count:', uniqueSubjects.length);
      setSubjects(uniqueSubjects);
      setStep('view-subjects');

      if (uniqueSubjects.length === 0) {
        console.warn('⚠️ No subjects found for this major');
      }
    } catch (error) {
      console.error('❌ Error loading subjects:', error);
      alert('Lỗi khi tải danh sách môn học');
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Handle continue to select class
  const handleContinueToClasses = async () => {
    if (!selectedMajor || !selectedYear) {
      alert('Vui lòng chọn năm học để tiếp tục');
      return;
    }

    setLoadingClasses(true);
    try {
      const data = await gradeManagementService.getClassesByMajorAndYear(
        selectedMajor.maNganh,
        selectedYear.toString()
      );
      setClasses(data);
      setStep('select-class');
    } catch (error) {
      console.error('Error loading classes:', error);
      alert('Lỗi khi tải danh sách lớp');
    } finally {
      setLoadingClasses(false);
    }
  };

  // Handle select class
  const handleSelectClass = async (classItem: Class) => {
    setSelectedClass(classItem);
    setLoadingStudents(true);
    try {
      console.log('🔍 Loading students for class:', classItem.id);
      const data = await gradeManagementService.getStudentsWithGrades(classItem.id);

      console.log('📦 Full API response:', data);
      console.log('👥 Students:', data.students);
      console.log('📚 Available Subjects:', data.subjects);

      setStudents(data.students || []);
      setAvailableSubjects(data.subjects || []);
      setStep('manage-grades');

      if (!data.subjects || data.subjects.length === 0) {
        console.warn('⚠️ WARNING: No subjects found for this class!');
      }
    } catch (error) {
      console.error('❌ Error loading students:', error);
      alert('Lỗi khi tải danh sách học sinh và môn học');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleEditGrade = (student: Student, subjectId: number) => {
    const grade = student.grades.find(g => g.subject_id === subjectId);
    setEditingGrade({ studentId: student.maHV, subjectId });
    setGradeForm({
      x: grade?.x?.toString() || '',
      y: grade?.y?.toString() || '',
      z: grade?.z?.toString() || '',
    });
  };

  const handleSaveGrade = async () => {
    if (!editingGrade) return;

    const x = parseFloat(gradeForm.x);
    const y = parseFloat(gradeForm.y);
    const z = parseFloat(gradeForm.z);

    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      alert('Vui lòng nhập đầy đủ điểm X, Y, Z');
      return;
    }

    if (x < 0 || x > 10 || y < 0 || y > 10 || z < 0 || z > 10) {
      alert('Điểm phải từ 0 đến 10');
      return;
    }

    setSaving(true);
    try {
      await gradeManagementService.updateGrade({
        student_id: editingGrade.studentId,
        subject_id: editingGrade.subjectId,
        x,
        y,
        z,
      });

      if (selectedClass) {
        const data = await gradeManagementService.getStudentsWithGrades(selectedClass.id);
        setStudents(data.students || []);
      }

      setEditingGrade(null);
      setGradeForm({ x: '', y: '', z: '' });
      alert('Cập nhật điểm thành công!');
    } catch (error: any) {
      console.error('Error saving grade:', error);
      alert(error.message || 'Lỗi khi lưu điểm');
    } finally {
      setSaving(false);
    }
  };

  const calculateFinalGrade = (x: number | null, y: number | null, z: number | null): number => {
    if (x === null || y === null || z === null) return 0;
    return (x * 0.1) + (y * 0.2) + (z * 0.7);
  };

  const handleBack = () => {
    if (step === 'view-subjects') {
      setStep('select-major');
      setSelectedMajor(null);
      setSubjects([]);
    } else if (step === 'select-class') {
      setStep('view-subjects');
      setClasses([]);
    } else if (step === 'manage-grades') {
      setStep('select-class');
      setStudents([]);
      setAvailableSubjects([]);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
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
            Nhập và chỉnh sửa điểm cho học sinh theo lớp
          </p>
        </div>
        {step !== 'select-major' && (
          <Button variant="outline" onClick={handleBack}>
            ← Quay lại
          </Button>
        )}
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className={step === 'select-major' ? 'font-semibold text-blue-600' : ''}>
          1. Chọn ngành
        </span>
        <span>→</span>
        <span className={step === 'view-subjects' ? 'font-semibold text-blue-600' : ''}>
          2. Xem môn học
        </span>
        <span>→</span>
        <span className={step === 'select-class' ? 'font-semibold text-blue-600' : ''}>
          3. Chọn lớp
        </span>
        <span>→</span>
        <span className={step === 'manage-grades' ? 'font-semibold text-blue-600' : ''}>
          4. Quản lý điểm
        </span>
      </div>

      {/* Step 1: Select Major with Search and Filters */}
      {step === 'select-major' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Tìm kiếm và lọc ngành học</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Box */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tìm kiếm ngành
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Tìm theo tên ngành hoặc mã ngành..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lọc theo năm học
                  </label>
                  <Select
                    value={selectedYear?.toString() || ''}
                    onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Tất cả các năm</option>
                    {allYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm || selectedYear) && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-gray-600">Đang lọc:</span>
                  {searchTerm && (
                    <Badge variant="info">
                      Tìm kiếm: "{searchTerm}"
                      <button onClick={() => setSearchTerm('')} className="ml-2">
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
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    Xóa tất cả
                  </Button>
                </div>
              )}

              <div className="text-sm text-gray-600">
                Hiển thị <strong>{filteredMajors.length}</strong> / {majors.length} ngành
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
                <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMajors.map((major) => (
                  <div
                    key={major.maNganh}
                    onClick={() => handleSelectMajor(major)}
                    className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                      <Badge variant="default">{major.maNganh}</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{major.tenNganh}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{major.years.length} khóa học</span>
                      {major.years.length > 0 && (
                        <span>({major.years[0]} - {major.years[major.years.length - 1]})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Step 2: View Subjects of Selected Major */}
      {step === 'view-subjects' && selectedMajor && (
        <div className="space-y-6">
          {/* Major Info */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedMajor.tenNganh}</h2>
                <p className="text-gray-600 mt-1">
                  Mã ngành: <strong>{selectedMajor.maNganh}</strong>
                </p>
              </div>
              <Badge variant="info" size="lg">
                {subjects.length} môn học
              </Badge>
            </div>
          </Card>

          {/* Year Selector for continuing */}
          <Card>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn năm học để xem danh sách lớp
            </label>
            <div className="flex gap-4">
              <Select
                value={selectedYear?.toString() || ''}
                onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                className="flex-1"
              >
                <option value="">-- Chọn năm học --</option>
                {selectedMajor.years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Select>
              <Button
                onClick={handleContinueToClasses}
                disabled={!selectedYear || loadingClasses}
              >
                {loadingClasses ? 'Đang tải...' : 'Xem danh sách lớp →'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Step 3: Select Class */}
      {step === 'select-class' && selectedMajor && (
        <Card>
          <h2 className="text-xl font-bold mb-4">
            Chọn lớp học - {selectedMajor.tenNganh} ({selectedYear})
          </h2>

          {loadingClasses ? (
            <div className="text-center py-12">
              <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p>Đang tải danh sách lớp...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Không tìm thấy lớp nào cho năm học {selectedYear}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  onClick={() => handleSelectClass(classItem)}
                  className="p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900">{classItem.tenLop}</h3>
                    <Badge variant={classItem.trangThai === 'DangHoc' ? 'success' : 'default'}>
                      {classItem.trangThai}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Khóa học: {classItem.khoaHoc}</p>
                    <p className="flex items-center gap-1">
                      <UsersIcon className="w-4 h-4" />
                      {classItem.studentCount} học sinh
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Step 4: Manage Grades */}
      {step === 'manage-grades' && selectedClass && (
        <div className="space-y-6">
          {/* Class Info */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedClass.tenLop}</h2>
                <p className="text-gray-600 mt-1">
                  {selectedClass.tenNganh} - Khóa {selectedClass.khoaHoc} - {students.length} học sinh
                </p>
              </div>
              <Badge variant="success">{selectedClass.trangThai}</Badge>
            </div>
          </Card>

          {/* Subject Filter */}
          {availableSubjects.length > 0 && (
            <Card>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn môn học để nhập điểm
              </label>
              <Select
                value={selectedSubject?.toString() || ''}
                onChange={(e) => setSelectedSubject(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">-- Tất cả các môn --</option>
                {availableSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.tenMon} ({subject.maMon}) - {subject.soTinChi} TC
                  </option>
                ))}
              </Select>
            </Card>
          )}

          {/* Students List */}
          {loadingStudents ? (
            <Card>
              <div className="text-center py-12">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p>Đang tải danh sách học sinh...</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {students.map((student) => {
                const filteredGrades = selectedSubject
                  ? student.grades.filter(g => g.subject_id === selectedSubject)
                  : student.grades;

                const selectedSubjectData = availableSubjects.find(s => s.id === selectedSubject);

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

                      {/* Grades Section */}
                      {selectedSubject && selectedSubjectData ? (
                        // Single subject view
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3">
                            Môn học: {selectedSubjectData.tenMon} ({selectedSubjectData.soTinChi} TC)
                          </h4>

                          {editingGrade?.studentId === student.maHV &&
                           editingGrade?.subjectId === selectedSubject ? (
                            // Edit Mode
                            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-sm font-medium mb-1">Điểm X (10%)</label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    value={gradeForm.x}
                                    onChange={(e) => setGradeForm({ ...gradeForm, x: e.target.value })}
                                    placeholder="0-10"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Điểm Y (20%)</label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    value={gradeForm.y}
                                    onChange={(e) => setGradeForm({ ...gradeForm, y: e.target.value })}
                                    placeholder="0-10"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Điểm Z (70%)</label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    value={gradeForm.z}
                                    onChange={(e) => setGradeForm({ ...gradeForm, z: e.target.value })}
                                    placeholder="0-10"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingGrade(null);
                                    setGradeForm({ x: '', y: '', z: '' });
                                  }}
                                  disabled={saving}
                                >
                                  Hủy
                                </Button>
                                <Button size="sm" onClick={handleSaveGrade} disabled={saving}>
                                  {saving ? 'Đang lưu...' : 'Lưu điểm'}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                              {filteredGrades.length > 0 ? (
                                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                                  <div>
                                    <span className="text-xs text-gray-500">Điểm X</span>
                                    <p className="font-semibold">{filteredGrades[0].x ?? '-'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">Điểm Y</span>
                                    <p className="font-semibold">{filteredGrades[0].y ?? '-'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">Điểm Z</span>
                                    <p className="font-semibold">{filteredGrades[0].z ?? '-'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">Điểm TB</span>
                                    <p className="font-bold text-lg text-blue-600">
                                      {calculateFinalGrade(
                                        filteredGrades[0].x,
                                        filteredGrades[0].y,
                                        filteredGrades[0].z
                                      ).toFixed(2)}
                                    </p>
                                  </div>
                                  <div>
                                    <Badge variant={
                                      calculateFinalGrade(
                                        filteredGrades[0].x,
                                        filteredGrades[0].y,
                                        filteredGrades[0].z
                                      ) >= 5 ? 'success' : 'danger'
                                    }>
                                      {calculateFinalGrade(
                                        filteredGrades[0].x,
                                        filteredGrades[0].y,
                                        filteredGrades[0].z
                                      ) >= 5 ? 'Đạt' : 'Không đạt'}
                                    </Badge>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500 italic">Chưa có điểm</p>
                              )}
                              <Button
                                size="sm"
                                onClick={() => handleEditGrade(student, selectedSubject)}
                              >
                                <PencilSquareIcon className="w-4 w-4" />
                                {filteredGrades.length > 0 ? 'Sửa' : 'Nhập điểm'}
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        // All subjects view
                        <div>
                          {filteredGrades.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                              Học sinh chưa có điểm. Chọn môn học để nhập điểm.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {filteredGrades.map((grade) => (
                                <div
                                  key={grade.subject_id}
                                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{grade.tenMon}</p>
                                    <p className="text-xs text-gray-500">
                                      {grade.maMon} - {grade.soTinChi} TC
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-sm">
                                      <span className="text-gray-500">X:</span> <strong>{grade.x ?? '-'}</strong> |{' '}
                                      <span className="text-gray-500">Y:</span> <strong>{grade.y ?? '-'}</strong> |{' '}
                                      <span className="text-gray-500">Z:</span> <strong>{grade.z ?? '-'}</strong>
                                    </div>
                                    <div className="text-lg font-bold text-blue-600 w-16 text-right">
                                      {calculateFinalGrade(grade.x, grade.y, grade.z).toFixed(2)}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedSubject(grade.subject_id);
                                        handleEditGrade(student, grade.subject_id);
                                      }}
                                    >
                                      <PencilSquareIcon className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
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
