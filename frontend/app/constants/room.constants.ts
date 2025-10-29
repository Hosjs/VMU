/**
 * Room/Class Module Constants
 * Centralized configuration for room-related dropdowns and filters
 */

import type { SelectOption } from '~/types/common';

// ============================================
// STATUS CONFIGURATION
// ============================================

export const ROOM_STATUS_CONFIG: Record<string, {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'default';
}> = {
  'Active': { label: 'Đang hoạt động', variant: 'success' },
  'Inactive': { label: 'Ngừng hoạt động', variant: 'secondary' },
  'Full': { label: 'Đã đủ', variant: 'warning' },
  'Available': { label: 'Còn chỗ', variant: 'info' },
};

// ============================================
// FILTER OPTIONS
// ============================================

/**
 * Khóa học options
 */
export const KHOA_HOC_OPTIONS: SelectOption[] = [
  { value: '', label: 'Tất cả khóa' },
  { value: '2024', label: 'Khóa 2024' },
  { value: '2023', label: 'Khóa 2023' },
  { value: '2022', label: 'Khóa 2022' },
  { value: '2021', label: 'Khóa 2021' },
  { value: '2020', label: 'Khóa 2020' },
];

/**
 * Generate khóa học options dynamically
 * @param yearsBack - Số năm về trước (default: 10)
 * @returns Array of khóa học options
 */
export const generateKhoaHocOptions = (yearsBack = 10): SelectOption[] => {
  const currentYear = new Date().getFullYear();
  const options: SelectOption[] = [{ value: '', label: 'Tất cả khóa' }];

  for (let year = currentYear; year >= currentYear - yearsBack; year--) {
    options.push({
      value: year.toString(),
      label: `Khóa ${year}`
    });
  }

  return options;
};

/**
 * Pagination per page options
 */
export const ROOM_PER_PAGE_OPTIONS: readonly [10, 20, 50, 100] = [10, 20, 50, 100];

