import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '~/components/ui/Button';

interface ClassActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ClassActionButtons({ onView, onEdit, onDelete }: ClassActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="secondary" onClick={onView} type="button">
        <EyeIcon className="w-4 h-4 mr-1" />
        Xem
      </Button>
      <Button size="sm" variant="primary" onClick={onEdit} type="button">
        <PencilIcon className="w-4 h-4 mr-1" />
        Sửa
      </Button>
      <Button size="sm" variant="danger" onClick={onDelete} type="button">
        <TrashIcon className="w-4 h-4 mr-1" />
        Xoá
      </Button>
    </div>
  );
}
