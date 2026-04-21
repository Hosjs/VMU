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
 * Năm học options
 */
export const KHOA_HOC_OPTIONS: SelectOption[] = [
  { value: '', label: 'Tất cả năm học' },
  { value: '2024', label: 'Năm học 2024' },
  { value: '2023', label: 'Năm học 2023' },
  { value: '2022', label: 'Năm học 2022' },
  { value: '2021', label: 'Năm học 2021' },
  { value: '2020', label: 'Năm học 2020' },
];

/**
 * Generate năm học options dynamically
 * @param yearsBack - Số năm về trước (default: 10)
 * @returns Array of năm học options
 */
export const generateKhoaHocOptions = (yearsBack = 10): SelectOption[] => {
  const currentYear = new Date().getFullYear();
  const options: SelectOption[] = [{ value: '', label: 'Tất cả năm học' }];

  for (let year = currentYear; year >= currentYear - yearsBack; year--) {
    options.push({
      value: year.toString(),
      label: `Năm học ${year}`
    });
  }

  return options;
};

/**
 * Pagination per page options
 */
export const ROOM_PER_PAGE_OPTIONS: readonly [10, 20, 50, 100] = [10, 20, 50, 100];

