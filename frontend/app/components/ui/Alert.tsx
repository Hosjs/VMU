/**
 * Alert Component
 * Hiển thị thông báo với các loại khác nhau
 */

import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const alertStyles: Record<AlertType, {
  container: string;
  icon: typeof CheckCircleIcon;
  iconColor: string;
}> = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: CheckCircleIcon,
    iconColor: 'text-green-400',
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: XCircleIcon,
    iconColor: 'text-red-400',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: ExclamationTriangleIcon,
    iconColor: 'text-yellow-400',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: InformationCircleIcon,
    iconColor: 'text-blue-400',
  },
};

export function Alert({ type, title, message, onClose, className = '' }: AlertProps) {
  const style = alertStyles[type];
  const Icon = style.icon;

  return (
    <div className={`border rounded-lg p-4 ${style.container} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${style.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <p className="text-sm">
            {message}
          </p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 hover:bg-opacity-20 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

