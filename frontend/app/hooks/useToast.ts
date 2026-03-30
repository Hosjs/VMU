import { useCallback, useEffect, useMemo, useState, createElement } from 'react';
import { Toast, toast as toastManager, type ToastType } from '~/components/ui/Toast';

// Minimal toast hook for client-side usage on static hosting.
// Provides helper methods and a renderable Toast component.
export function useToast() {
  const [toastState, setToastState] = useState<{
    message: string;
    type?: ToastType;
    duration?: number;
  } | null>(null);

  useEffect(() => {
    // Subscribe to global toast manager if used elsewhere
    return toastManager.subscribe((next) => {
      setToastState({
        message: next.message,
        type: next.type,
        duration: next.duration,
      });
    });
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = 'info', duration = 3000) => {
      setToastState({ message, type, duration });
    },
    []
  );

  const success = useCallback((message: string, duration?: number) => show(message, 'success', duration), [show]);
  const error = useCallback((message: string, duration?: number) => show(message, 'error', duration), [show]);
  const warning = useCallback((message: string, duration?: number) => show(message, 'warning', duration), [show]);
  const info = useCallback((message: string, duration?: number) => show(message, 'info', duration), [show]);

  const ToastContainer = useMemo(() => {
    if (!toastState) return null;
    return createElement(Toast, {
      message: toastState.message,
      type: toastState.type,
      duration: toastState.duration,
      onClose: () => setToastState(null),
    });
  }, [toastState]);

  return { show, success, error, warning, info, ToastContainer };
}
