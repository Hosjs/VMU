import type { SelectOption } from '~/types/common';

// Học hàm (Academic Rank)
export const HOC_HAM_OPTIONS: SelectOption[] = [
  { value: '', label: 'Tất cả' },
  { value: 'Giáo sư', label: 'Giáo sư' },
  { value: 'Phó Giáo sư', label: 'Phó Giáo sư' },
];

// Trình độ chuyên môn (Professional Level)
export const TRINH_DO_CHUYEN_MON_OPTIONS: SelectOption[] = [
  { value: '', label: 'Tất cả' },
  { value: 'Tiến sĩ', label: 'Tiến sĩ' },
  { value: 'Thạc sĩ', label: 'Thạc sĩ' },
  { value: 'Đại học', label: 'Đại học' },
  { value: 'Khác', label: 'Khác' },
];

// Badge variant cho học hàm
export const HOC_HAM_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  'Giáo sư': 'success',
  'Phó Giáo sư': 'warning',
};

// Badge variant cho trình độ
export const TRINH_DO_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  'Tiến sĩ': 'success',
  'Thạc sĩ': 'info',
  'Đại học': 'warning',
  'Khác': 'default',
};

