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

// Laravel paginate() structure
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface SelectOption {
  value: string | number;
  label: string;
}
