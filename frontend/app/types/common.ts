export type SortDirection = 'asc' | 'desc';

export interface TableQueryParams {
  page: number;
  per_page: number;
  search?: string;
  sort_by?: string;
  sort_direction?: SortDirection;
  filters?: Record<string, any>;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

