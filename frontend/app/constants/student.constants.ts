/**
 * Student Module Constants
 * Centralized configuration for student-related dropdowns and filters
 */

import type { SelectOption } from '~/types/common';

// ============================================
// STATUS CONFIGURATION
// ============================================

export const STATUS_CONFIG: Record<string, {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'default';
}> = {
  // Đang học - Màu xanh lá (success)
  'DangHoc': { label: 'Đang học', variant: 'success' },
  'Đang học': { label: 'Đang học', variant: 'success' },

  // Bảo lưu, Chờ duyệt - Màu vàng (warning)
  'BaoLuu': { label: 'Bảo lưu', variant: 'warning' },
  'Bảo lưu': { label: 'Bảo lưu', variant: 'warning' },
  'ChoDuyet': { label: 'Chờ duyệt', variant: 'warning' },
  'Chờ duyệt': { label: 'Chờ duyệt', variant: 'warning' },

  // Đã tốt nghiệp, Nộp hồ sơ đầu vào - Màu xanh nước biển (info)
  'DaTotNghiep': { label: 'Đã tốt nghiệp', variant: 'info' },
  'Đã tốt nghiệp': { label: 'Đã tốt nghiệp', variant: 'info' },
  'NopHoSoDauVao': { label: 'Nộp hồ sơ đầu vào', variant: 'info' },
  'Nộp hồ sơ đầu vào': { label: 'Nộp hồ sơ đầu vào', variant: 'info' },

  // Đã duyệt - Màu xanh lá (success)
  'DaDuyet': { label: 'Đã duyệt', variant: 'success' },
  'Đã duyệt': { label: 'Đã duyệt', variant: 'success' },

  // Thôi học - Màu đỏ (danger)
  'ThoiHoc': { label: 'Thôi học', variant: 'danger' },
  'Thôi học': { label: 'Thôi học', variant: 'danger' },

  // Tạm dừng - Màu tím (secondary)
  'TamDung': { label: 'Tạm dừng', variant: 'secondary' },
  'Tạm dừng': { label: 'Tạm dừng', variant: 'secondary' },
};

// ============================================
// FILTER OPTIONS
// ============================================

/**
 * Trình độ đào tạo options
 * Thêm/sửa trực tiếp trong array này khi có thay đổi
 */
export const TRINH_DO_OPTIONS: SelectOption[] = [
  { value: '', label: 'Tất cả' },
  { value: 'ThacSi', label: 'Thạc sỹ' },
  { value: 'TienSi', label: 'Tiến sỹ' },
  { value: 'DaiHoc', label: 'Đại học' },
  { value: 'CaoDang', label: 'Cao đẳng' },
];

/**
 * Giới tính options
 */
export const GIOI_TINH_OPTIONS: SelectOption[] = [
  { value: '', label: 'Tất cả' },
  { value: 'Nam', label: 'Nam' },
  { value: 'Nữ', label: 'Nữ' },
];

/**
 * Pagination per page options
 */
export const PER_PAGE_OPTIONS: readonly [10, 25, 50, 100] = [10, 25, 50, 100];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate year options dynamically
 * @param yearsBack - Số năm về trước (default: 10)
 * @param yearsForward - Số năm về sau (default: 5)
 * @returns Array of year options
 */
export const generateYearOptions = (yearsBack = 10, yearsForward = 5) => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - yearsBack;
  const endYear = currentYear + yearsForward;

  const options = [{ value: '', label: 'Tất cả' }];

  for (let year = endYear; year >= startYear; year--) {
    options.push({
      value: year.toString(),
      label: year.toString()
    });
  }

  return options;
};

/**
 * Get status configuration for a given status code
 * @param status - Status code or label
 * @returns Status config with label and variant
 */
export const getStatusConfig = (status: string) => {
  return STATUS_CONFIG[status] || {
    label: status,
    variant: 'default' as const
  };
};

// ============================================
// TYPE EXPORTS
// ============================================

export type TrinhDoOption = typeof TRINH_DO_OPTIONS[number];
export type GioiTinhOption = typeof GIOI_TINH_OPTIONS[number];
export type PerPageOption = typeof PER_PAGE_OPTIONS[number];
