import { useEffect, useRef, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { apiService } from '~/services/api.service';

interface UpcomingResponse {
  now: string;
  horizon: string;
  weekly_hint: Array<{
    id: number;
    subject_name: string;
    time_slot: string | null;
    room: string | null;
    week_number: string | null;
  }>;
  exams: Array<{
    id: number;
    subject_name: string;
    exam_start: string;
    exam_end: string;
    room: string | null;
  }>;
  total: number;
}

const POLL_INTERVAL_MS = 5 * 60 * 1000;
const DISMISS_KEY = 'notification_dismissed_ids';

function getDismissedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveDismissedIds(ids: Set<string>): void {
  try {
    localStorage.setItem(DISMISS_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<UpcomingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const dismissedRef = useRef<Set<string>>(getDismissedIds());

  const fetchUpcoming = async () => {
    setLoading(true);
    try {
      const res = await apiService.get<UpcomingResponse>('/me/upcoming-schedules', { hours: 24 });
      setData(res);
    } catch (err) {
      // Silent: notification bell is not critical.
      console.warn('Notification fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming();
    const timer = setInterval(fetchUpcoming, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const items = [
    ...(data?.exams ?? []).map((e) => ({
      key: `exam-${e.id}`,
      title: `Thi: ${e.subject_name}`,
      subtitle: `${new Date(e.exam_start).toLocaleString('vi-VN')} · Phòng ${e.room ?? '—'}`,
    })),
    ...(data?.weekly_hint ?? []).map((w) => ({
      key: `weekly-${w.id}`,
      title: w.subject_name || 'Lịch học',
      subtitle: `${w.time_slot ?? ''} · Phòng ${w.room ?? '—'} · Tuần ${w.week_number ?? ''}`,
    })),
  ].filter((item) => !dismissedRef.current.has(item.key));

  const unreadCount = items.length;

  const dismissItem = (key: string) => {
    dismissedRef.current.add(key);
    saveDismissedIds(dismissedRef.current);
    setData((prev) => (prev ? { ...prev } : prev));
  };

  const dismissAll = () => {
    items.forEach((i) => dismissedRef.current.add(i.key));
    saveDismissedIds(dismissedRef.current);
    setData((prev) => (prev ? { ...prev } : prev));
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Thông báo lịch sắp tới"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative touch-friendly"
      >
        <BellIcon className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="font-semibold text-sm">Lịch sắp tới (24h)</span>
              {unreadCount > 0 && (
                <button onClick={dismissAll} className="text-xs text-blue-600 hover:underline">
                  Đánh dấu đã xem
                </button>
              )}
            </div>
            {loading && <div className="p-4 text-sm text-gray-500">Đang tải...</div>}
            {!loading && items.length === 0 && (
              <div className="p-4 text-sm text-gray-500">Không có lịch nào sắp tới.</div>
            )}
            {items.map((item) => (
              <div key={item.key} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
                </div>
                <button
                  onClick={() => dismissItem(item.key)}
                  className="text-gray-400 hover:text-gray-700 text-lg leading-none"
                  aria-label="Bỏ qua"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
