/**
 * PermissionSelector Component
 * Component để chọn permissions cho user/role
 * Hiển thị dạng checkbox grid theo modules
 */

import { useMemo } from 'react';
import { AVAILABLE_PERMISSIONS, getModuleLabel, getActionLabel } from '~/utils/permissions';

interface PermissionSelectorProps {
  /**
   * Permissions hiện tại (object với key là module, value là array actions)
   */
  value: Record<string, string[]>;

  /**
   * Callback khi permissions thay đổi
   */
  onChange: (permissions: Record<string, string[]>) => void;

  /**
   * Chế độ hiển thị: 'compact' hoặc 'detailed'
   */
  mode?: 'compact' | 'detailed';

  /**
   * Disabled tất cả checkboxes
   */
  disabled?: boolean;
}

export function PermissionSelector({
  value = {},
  onChange,
  mode = 'detailed',
  disabled = false,
}: PermissionSelectorProps) {

  // Tính toán các modules và actions được group
  const permissionGroups = useMemo(() => {
    return Object.entries(AVAILABLE_PERMISSIONS).map(([module, actions]) => {
      const modulePerms = value[module] || [];
      const actionsArray = Array.isArray(actions) ? actions : [];

      return {
        module,
        label: getModuleLabel(module),
        actions: actionsArray.map(action => ({
          key: action,
          label: getActionLabel(action),
          checked: modulePerms.includes(action),
        })),
        allChecked: actionsArray.length > 0 && actionsArray.every(action => modulePerms.includes(action)),
        someChecked: actionsArray.some(action => modulePerms.includes(action)),
      };
    });
  }, [value]);

  // Toggle tất cả actions của một module
  const handleToggleModule = (module: string, actions: string[]) => {
    const currentModulePerms = value[module] || [];
    const allChecked = actions.every(action => currentModulePerms.includes(action));

    const newValue = { ...value };

    if (allChecked) {
      // Uncheck all
      delete newValue[module];
    } else {
      // Check all
      newValue[module] = actions;
    }

    onChange(newValue);
  };

  // Toggle một action cụ thể
  const handleToggleAction = (module: string, action: string) => {
    const currentModulePerms = value[module] || [];
    const newValue = { ...value };

    if (currentModulePerms.includes(action)) {
      // Remove action
      newValue[module] = currentModulePerms.filter(a => a !== action);
      if (newValue[module].length === 0) {
        delete newValue[module];
      }
    } else {
      // Add action
      newValue[module] = [...currentModulePerms, action];
    }

    onChange(newValue);
  };

  if (mode === 'compact') {
    return (
      <div className="space-y-3">
        {permissionGroups.map(group => (
          <div key={group.module} className="border rounded-lg p-3">
            <label className="flex items-center gap-2 font-medium text-gray-900 mb-2">
              <input
                type="checkbox"
                checked={group.allChecked}
                ref={input => {
                  if (input) {
                    input.indeterminate = group.someChecked && !group.allChecked;
                  }
                }}
                onChange={() => handleToggleModule(group.module, group.actions.map(a => a.key))}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              {group.label}
            </label>
            <div className="ml-6 flex flex-wrap gap-2">
              {group.actions.map(action => (
                <label key={action.key} className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={action.checked}
                    onChange={() => handleToggleAction(group.module, action.key)}
                    disabled={disabled}
                    className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  {action.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Detailed mode - Grid layout
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {permissionGroups.map(group => (
          <div key={group.module} className="border rounded-lg overflow-hidden">
            {/* Module Header */}
            <div className="bg-gray-50 px-4 py-3 border-b">
              <label className="flex items-center gap-2 font-medium text-gray-900">
                <input
                  type="checkbox"
                  checked={group.allChecked}
                  ref={input => {
                    if (input) {
                      input.indeterminate = group.someChecked && !group.allChecked;
                    }
                  }}
                  onChange={() => handleToggleModule(group.module, group.actions.map(a => a.key))}
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                {group.label}
              </label>
            </div>

            {/* Actions List */}
            <div className="p-4 space-y-2">
              {group.actions.map(action => (
                <label
                  key={action.key}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 p-1.5 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={action.checked}
                    onChange={() => handleToggleAction(group.module, action.key)}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  {action.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
