// filepath: /Applications/XAMPP/xamppfiles/VMU/frontend/app/types/major.ts

/**
 * Interface cho ngành học
 */
export interface Major {
    id: number;
    ma: string;
    tenNganhHoc: string;
    mo_ta?: string;
    thoiGianDaoTao?: number;
    daoTaoThacSy?: boolean;
    daoTaoTienSy?: boolean;
    thoiGianDaoTaoThacSy?: number;
    thoiGianDaoTaoTienSy?: number;
    parent_id?: number | null;
    parent?: Major | null;
    children?: Major[];
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

/**
 * Form data cho tạo/cập nhật ngành học
 */
export interface MajorFormData {
    ma_nganh: string;
    ten_nganh: string;
    mo_ta?: string;
    thoi_gian_dao_tao?: number;
    parent_id?: number | null;
}

/**
 * Query params để lọc danh sách ngành học
 */
export interface MajorQueryParams {
    search?: string;
    dao_tao_thac_sy?: boolean;
    dao_tao_tien_sy?: boolean;
    parent_id?: number | null | 'null';
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
}
