import { useState, useCallback, useEffect, useRef } from 'react';
import type { TableQueryParams, PaginatedResponse, SortDirection } from '~/types/common';

interface UseTableOptions<T> {
  fetchData: (params: TableQueryParams) => Promise<PaginatedResponse<T>>;
  initialPage?: number;
  initialPerPage?: number;
  initialSortBy?: string;
  initialSortDirection?: SortDirection;
  initialFilters?: Record<string, any>;
}

export function useTable<T>({
  fetchData,
  initialPage = 1,
  initialPerPage = 10,
  initialSortBy,
  initialSortDirection = 'asc',
  initialFilters = {},
}: UseTableOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [meta, setMeta] = useState({
    current_page: 1,
    from: 0,
    last_page: 1,
    per_page: initialPerPage,
    to: 0,
    total: 0,
  });

  // ✅ Flag để tránh gọi API 2 lần do React Strict Mode
  const isInitialLoadRef = useRef(false);

  // Store fetchData in ref to avoid recreating loadData on every render
  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

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

      const response = await fetchDataRef.current(params);

      // Đảm bảo data luôn là mảng
      setData(response.data || []);

      // Laravel pagination properties are at root level, not nested in meta
      setMeta({
        current_page: response.current_page || 1,
        from: response.from || 0,
        last_page: response.last_page || 1,
        per_page: response.per_page || perPage,
        to: response.to || 0,
        total: response.total || 0,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load data');
      setError(error);
      setData([]); // Reset data về mảng rỗng khi có lỗi
      console.error('Table load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, perPage, sortBy, sortDirection, search, filters]);

  // ✅ Sửa useEffect để tránh gọi 2 lần do React Strict Mode
  useEffect(() => {
    // Trong development với Strict Mode, React mount 2 lần
    // Chỉ gọi API khi thực sự cần thiết
    let cancelled = false;

    const fetchData = async () => {
      if (!cancelled) {
        await loadData();
      }
    };

    fetchData();

    // Cleanup: prevent calling API if component unmounts
    return () => {
      cancelled = true;
    };
  }, [loadData]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1); // Reset to first page
  }, []);

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortBy(field);
      setSortDirection('asc');
    }
    setPage(1); // Reset to first page
  }, [sortBy]);

  const handleSearch = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
    setPage(1); // Reset to first page
  }, []);

  const handleFilter = useCallback((filterKey: string, filterValue: any) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: filterValue,
    }));
    setPage(1); // Reset to first page
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearch('');
    setPage(1);
  }, [initialFilters]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setPerPage(initialPerPage);
    setSortBy(initialSortBy);
    setSortDirection(initialSortDirection);
    setSearch('');
    setFilters(initialFilters);
  }, [initialPage, initialPerPage, initialSortBy, initialSortDirection, initialFilters]);

  return {
    data,
    isLoading,
    error,
    meta,
    page,
    perPage,
    sortBy,
    sortDirection,
    search,
    filters,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    handleSearch,
    handleFilter,
    handleClearFilters,
    refresh,
    reset,
  };
}
