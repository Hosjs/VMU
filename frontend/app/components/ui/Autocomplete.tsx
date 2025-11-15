import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAutocomplete } from '~/hooks/useAutocomplete';
import type { AutocompleteOption } from '~/hooks/useAutocomplete';

export type { AutocompleteOption };

interface AutocompleteProps {
  label?: string;
  placeholder?: string;
  options: AutocompleteOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}

export function Autocomplete({
  label,
  placeholder = 'Tìm kiếm...',
  options,
  value,
  onChange,
  error,
  required,
  disabled,
  isLoading,
}: AutocompleteProps) {
  const {
    isOpen,
    searchTerm,
    filteredOptions,
    selectedOption,
    containerRef,
    inputRef,
    handleOpen,
    handleClose,
    handleSelect,
    handleClear,
    handleSearchChange,
  } = useAutocomplete({ options, value, onChange });

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Display selected value or search input */}
        {!isOpen && selectedOption ? (
          <div
            className={`w-full px-3 py-2 border rounded-lg bg-white cursor-pointer flex items-center justify-between ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}`}
            onClick={() => !disabled && handleOpen()}
          >
            <div className="flex-1">
              <div className="font-medium text-gray-900">{selectedOption.label}</div>
              {selectedOption.subtitle && (
                <div className="text-xs text-gray-500">{selectedOption.subtitle}</div>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="ml-2 p-1 hover:bg-gray-100 rounded"
            >
              <XMarkIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={handleOpen}
              disabled={disabled}
            />
          </div>
        )}

        {/* Dropdown menu */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {isLoading ? (
              <div className="px-3 py-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <div className="mt-2 text-sm">Đang tải...</div>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-3 py-8 text-center text-gray-500">
                <div className="text-sm">Không tìm thấy kết quả</div>
              </div>
            ) : (
              <ul className="py-1">
                {filteredOptions.map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      className={`w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors ${
                        option.value === value ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleSelect(option)}
                    >
                      <div className="font-medium text-gray-900">{option.label}</div>
                      {option.subtitle && (
                        <div className="text-xs text-gray-500 mt-0.5">{option.subtitle}</div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
