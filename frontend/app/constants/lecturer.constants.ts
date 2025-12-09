import type { SelectOption } from '~/types/common';

// Học hàm (Academic Rank) - Sử dụng viết tắt
export const HOC_HAM_OPTIONS: SelectOption[] = [
  { value: '', label: 'Tất cả' },
  { value: 'GS', label: 'Giáo sư' },
  { value: 'PGS', label: 'Phó Giáo sư' },
];

// Trình độ chuyên môn (Professional Level) - Sử dụng viết tắt
export const TRINH_DO_CHUYEN_MON_OPTIONS: SelectOption[] = [
  { value: '', label: 'Tất cả' },
  { value: 'TS', label: 'Tiến sĩ' },
  { value: 'ThS', label: 'Thạc sĩ' },
  { value: 'ĐH', label: 'Đại học' },
  { value: 'Khác', label: 'Khác' },
];

// Badge variant cho học hàm
export const HOC_HAM_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  'GS': 'success',
  'PGS': 'warning',
};

// Badge variant cho trình độ
export const TRINH_DO_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  'TS': 'success',
  'ThS': 'info',
  'ĐH': 'warning',
  'Khác': 'default',
};
