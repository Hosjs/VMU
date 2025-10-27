
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface TableQueryParams {
  page: number;
  per_page: number;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface BadgeCount {
  label: string;
  count: number;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
}

export type SortDirection = 'asc' | 'desc';