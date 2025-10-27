// filepath: /Applications/XAMPP/xamppfiles/VMU/frontend/app/types/major.ts

/**
 * Interface cho ngành học
 */
export interface Major {
    ma: string;
    tenNganhHoc: string;
    daoTaoThacSy?: boolean;
    daoTaoTienSy?: boolean;
    thoiGianDaoTaoThacSy?: number;
    thoiGianDaoTaoTienSy?: number;
    thoiGianVuotKhungThacSy?: number;
    thoiGianVuotKhungTienSy?: number;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Query params để lọc danh sách ngành học
 */
export interface MajorQueryParams {
    search?: string;
    daoTaoThacSy?: boolean;
    daoTaoTienSy?: boolean;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
}

