import { useState, useCallback, useEffect } from 'react';

interface UseAsyncOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const { immediate = false, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunction, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
  };
}
import { useState, useCallback } from 'react';
import type { TableQueryParams, PaginatedResponse, SortDirection } from '~/types/common';

interface UseTableOptions {
  defaultPerPage?: number;
  defaultSortBy?: string;
  defaultSortDirection?: SortDirection;
}

export function useTable<T>(
  fetchData: (params: TableQueryParams) => Promise<PaginatedResponse<T>>,
  options: UseTableOptions = {}
) {
  const {
    defaultPerPage = 10,
    defaultSortBy,
    defaultSortDirection = 'desc',
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: TableQueryParams = {
        page,
        per_page: perPage,
        search: search || undefined,
        sort_by: sortBy,
        sort_direction: sortDirection,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      };

      const response = await fetchData(params);
      setData(response.data);
      setTotal(response.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, page, perPage, search, sortBy, sortDirection, filters]);

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  }, [sortBy, sortDirection]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleFilter = useCallback((filterKey: string, filterValue: any) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: filterValue,
    }));
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setSearch('');
    setPage(1);
  }, []);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    page,
    perPage,
    total,
    sortBy,
    sortDirection,
    search,
    filters,
    setPage,
    setPerPage,
    handleSort,
    handleSearch,
    handleFilter,
    handleClearFilters,
    refresh,
    loadData,
  };
}

