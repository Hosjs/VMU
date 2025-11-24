import { apiService } from './api.service';

interface MajorWithYears {
    id: string;
    maNganh: string;
    tenNganh: string;
    years: number[];
}

interface ClassInfo {
    id: number;
    tenLop: string;
    khoaHoc: string;
    trangThai: string;
    tenNganh: string;
    maNganh: string;
    studentCount: number;
}

interface StudentGrade {
    maHV: string;
    hoDem: string;
    ten: string;
    hoTen: string;
    ngaySinh: string;
    gioiTinh: string;
    email: string;
    dienThoai: string;
    trangThaiHoc: string;
    grades: Array<{
        grade_id: number;
        subject_id: number;
        maMon: string;
        tenMon: string;
        soTinChi: number;
        x: number;
        y: number;
        z: number;
        created_at: string;
        updated_at: string;
    }>;
}

interface StudentsWithGradesResponse {
    class: ClassInfo;
    students: StudentGrade[];
    subjects: Array<{
        id: number;
        maMon: string;
        tenMon: string;
        soTinChi: number;
    }>;
}

interface GradeUpdateData {
    student_id: string;
    subject_id: number;
    x: number;
    y: number;
    z: number;
}

interface GradeUpdateResponse {
    id: number;
    x: number;
    y: number;
    z: number;
    diem: number;
}

/**
 * Service để quản lý điểm học viên
 * Theo pattern chuẩn: sử dụng apiService
 */
export const gradeManagementService = {
    /**
     * Lấy danh sách ngành học với các năm có học viên
     */
    async getMajorsWithYears(): Promise<MajorWithYears[]> {
        // ✅ apiService.get() already unwraps and returns the data array directly
        return await apiService.get<MajorWithYears[]>('/grade-management/majors');
    },

    /**
     * Lấy danh sách lớp theo ngành và khóa học
     */
    async getClassesByMajorAndYear(maNganh: string, khoaHoc: string): Promise<ClassInfo[]> {
        return await apiService.get<ClassInfo[]>(
            `/grade-management/classes?maNganh=${encodeURIComponent(maNganh)}&khoaHoc=${encodeURIComponent(khoaHoc)}`
        );
    },

    /**
     * Lấy danh sách học viên và điểm trong một lớp
     */
    async getStudentsWithGrades(classId: number, subjectId?: number): Promise<StudentsWithGradesResponse> {
        let url = `/grade-management/classes/${classId}/students`;
        if (subjectId) {
            url += `?subject_id=${subjectId}`;
        }

        return await apiService.get<StudentsWithGradesResponse>(url);
    },

    /**
     * Cập nhật điểm cho một học viên
     * Yêu cầu authentication
     */
    async updateGrade(data: GradeUpdateData): Promise<GradeUpdateResponse> {
        return await apiService.post<GradeUpdateResponse>('/grade-management/grades', data);
    },

    /**
     * Cập nhật điểm hàng loạt
     * Yêu cầu authentication
     */
    async bulkUpdateGrades(grades: GradeUpdateData[]): Promise<{ updated: number }> {
        return await apiService.post<{ updated: number }>('/grade-management/grades/bulk', { grades });
    },

    /**
     * Xóa điểm
     * Yêu cầu authentication
     */
    async deleteGrade(gradeId: number): Promise<void> {
        await apiService.delete(`/grade-management/grades/${gradeId}`);
    },
};
