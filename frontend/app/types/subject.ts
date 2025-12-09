// filepath: /Applications/XAMPP/xamppfiles/VMU/frontend/app/types/subject.ts

/**
 * Interface cho môn học
 */
export interface Subject {
    id: number;
    maMon: string;
    tenMon: string;
    soTinChi: number;
    moTa?: string;
    soTiet?: string;
    loaiMon?: string;
    hocKy?: string;
    enrolled_students_count?: number;
    created_at?: string;
    updated_at?: string;
}

/**
 * Interface cho thông tin đăng ký môn học của sinh viên
 */
export interface SubjectEnrollment {
    id: number;
    maHV: string;
    subject_id: number;
    major_id: number;
    namHoc: number;
    hocKy?: string;
    trangThai: 'DangHoc' | 'DaHoanThanh' | 'Huy';
    created_at: string;
    updated_at: string;
    student?: {
        maHV: string;
        hoDem: string;
        ten: string;
        email: string;
        dienThoai: string;
        gioiTinh: string;
        maNganh: string;
        nganh?: {
            tenNganh: string;
        };
    };
    subject?: Subject;
}

/**
 * Query params để lọc danh sách môn học
 */
export interface SubjectQueryParams {
    search?: string;
    major_id?: number;
    nam_hoc?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
}
