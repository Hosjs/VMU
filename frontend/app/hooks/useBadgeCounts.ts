import { useState, useEffect, useCallback, useRef } from 'react';
import { badgeService, type BadgeCounts } from '~/services/badge.service';

interface UseBadgeCountsOptions {
  /**
   * Tự động refresh sau mỗi X giây
   * Default: 30 giây
   */
  refreshInterval?: number;

  /**
   * Tự động fetch khi mount
   * Default: true
   */
  autoFetch?: boolean;
}

interface UseBadgeCountsReturn {
  counts: BadgeCounts;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook để quản lý badge counts cho sidebar
 * Tự động refresh và cập nhật số đếm theo thời gian thực
 */
export function useBadgeCounts(options: UseBadgeCountsOptions = {}): UseBadgeCountsReturn {
  const {
    refreshInterval = 30000, // 30 giây
    autoFetch = true,
  } = options;

  const [counts, setCounts] = useState<BadgeCounts>({
    orders: 0,
    invoices: 0,
    service_requests: 0,
    work_orders: 0,
    notifications: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Thêm ref để tránh dependencies thay đổi
  const hasFetchedRef = useRef(false);

  /**
   * Fetch badge counts từ API
   */
  const fetchCounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Fetching badge counts...');
      const data = await badgeService.getCounts();
      setCounts(data);
      console.log('✅ Badge counts fetched:', data);
    } catch (err: any) {
      console.error('❌ Failed to fetch badge counts:', err);
      setError(err.message || 'Không thể tải số đếm');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh badge counts
   */
  const refresh = useCallback(async () => {
    await fetchCounts();
  }, [fetchCounts]);

  /**
   * Auto fetch khi mount và setup interval
   * ✅ Sửa lỗi: Chỉ fetch 1 lần duy nhất khi mount
   */
  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    // ✅ Chỉ fetch lần đầu nếu autoFetch = true VÀ chưa fetch
    if (autoFetch && !hasFetchedRef.current && isMounted) {
      console.log('🚀 Initial fetch badge counts');
      hasFetchedRef.current = true;
      fetchCounts();
    }

    // Setup interval nếu refreshInterval > 0
    if (refreshInterval > 0) {
      intervalId = setInterval(() => {
        if (isMounted) {
          console.log('⏰ Interval refresh badge counts');
          fetchCounts();
        }
      }, refreshInterval);
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    // ✅ QUAN TRỌNG: Chỉ chạy 1 lần khi mount, không depend vào fetchCounts
  }, [autoFetch, refreshInterval]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    counts,
    isLoading,
    error,
    refresh,
  };
}
