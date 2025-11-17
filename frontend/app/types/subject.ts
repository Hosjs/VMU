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
    created_at?: string;
    updated_at?: string;
}

/**
 * Query params để lọc danh sách môn học
 */
export interface SubjectQueryParams {
    search?: string;
    major_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
}

