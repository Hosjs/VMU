import { Button } from '~/components/ui/Button';

export function ClassDeleteConfirm() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-700">Màn hình xác nhận xoá lớp sẽ được cài đặt sau.</p>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" disabled>
          Huỷ
        </Button>
        <Button type="button" variant="danger" disabled>
          Xoá lớp
        </Button>
      </div>
    </div>
  );
}
