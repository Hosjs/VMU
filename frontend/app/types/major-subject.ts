/**
 * Interface cho quan hệ ngành-môn học
 */
export interface MajorSubject {
    id: number;
    major_id: number;
    subject_id: number;
    maNganh: string;
    tenNganh: string;
    maMon: string;
    tenMon: string;
    soTinChi: number;
    created_at?: string;
    updated_at?: string;
}

/**
 * Form data cho tạo quan hệ ngành-môn học
 */
export interface MajorSubjectFormData {
    major_id: number;
    subject_id: number;
}

/**
 * Form data cho bulk assign môn học vào ngành
 */
export interface BulkAssignFormData {
    major_id: number;
    subject_ids: number[];
}

/**
 * Query params để lọc danh sách major-subjects
 */
export interface MajorSubjectQueryParams {
    search?: string;
    major_id?: number;
    maNganh?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

