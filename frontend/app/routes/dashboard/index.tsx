import { Loading } from '~/components/Loading';

export default function DashboardIndex() {
  // Component này không bao giờ hiển thị vì _layout.tsx sẽ redirect
  // Chỉ show loading trong khi đang check auth
  return <Loading text="Đang chuyển hướng..." />;
}
