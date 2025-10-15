/**
 * PermissionButton Component
 * Button chỉ hiển thị nếu user có quyền
 */

import type { ReactNode } from 'react';
import { Button } from '~/components/ui/Button';
import { usePermissions } from '~/hooks/usePermissions';

interface PermissionButtonProps {
  permission?: string;
  anyPermissions?: string[];
  allPermissions?: string[];
  onClick?: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function PermissionButton({
  permission,
  anyPermissions,
  allPermissions,
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  type = 'button',
}: PermissionButtonProps) {
  const permissions = usePermissions();

  let hasAccess = true;

  if (permission && !permissions.hasPermission(permission)) {
    hasAccess = false;
  }

  if (anyPermissions && !permissions.hasAnyPermission(anyPermissions)) {
    hasAccess = false;
  }

  if (allPermissions && !permissions.hasAllPermissions(allPermissions)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </Button>
  );
}
