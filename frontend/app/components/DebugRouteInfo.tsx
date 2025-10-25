import { useLocation } from 'react-router';
import { useEffect } from 'react';

export function DebugRouteInfo() {
  const location = useLocation();

  useEffect(() => {
    // Debug đã tắt - chỉ bật khi development cần debug
    // console.log('🔍 [DEBUG] Current Route:', {
    //   pathname: location.pathname,
    //   search: location.search,
    //   hash: location.hash,
    //   state: location.state,
    // });
  }, [location]);

  return null;
}
