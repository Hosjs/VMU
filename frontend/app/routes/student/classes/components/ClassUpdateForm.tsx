import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';

export function ClassUpdateForm() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Biểu mẫu chỉnh sửa lớp sẽ được hoàn thiện sau.</p>
      <Input label="Tên lớp" name="tenLop" placeholder="Nhập tên lớp" disabled />
      <Input label="Ngành" name="major" placeholder="Chọn ngành" disabled />
      <Button type="button" disabled>
        Đang xây dựng
      </Button>
    </div>
  );
}
