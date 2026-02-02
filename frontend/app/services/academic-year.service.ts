import { apiService } from './api.service';

export interface AcademicYear {
    id: number;
    nam_hoc: number;
    ten_khoa_hoc: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateAcademicYearData {
    nam_hoc: number;
    ten_khoa_hoc?: string;
    major_ids?: string[]; // List of major IDs to create classes for
}

/**
 * Service để quản lý khoá học / năm học
 */
export const academicYearService = {
    /**
     * Lấy danh sách tất cả các năm học
     */
    async getAllAcademicYears(): Promise<AcademicYear[]> {
        return await apiService.get<AcademicYear[]>('/academic-years');
    },

    /**
     * Lấy danh sách các năm học đang được sử dụng (từ classes table)
     */
    async getActiveAcademicYears(): Promise<number[]> {
        const response = await apiService.get<{ years: number[] }>('/academic-years/active');
        return response.years;
    },

    /**
     * Tạo năm học mới
     */
    async createAcademicYear(data: CreateAcademicYearData): Promise<AcademicYear> {
        return await apiService.post<AcademicYear>('/academic-years', data);
    },

    /**
     * Xóa năm học
     */
    async deleteAcademicYear(id: number): Promise<void> {
        await apiService.delete(`/academic-years/${id}`);
    },
};
