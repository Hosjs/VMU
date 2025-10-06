interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  perPage?: number;
  onPerPageChange?: (perPage: number) => void;
  total?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  perPage,
  onPerPageChange,
  total,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const visiblePages = pages.filter((page) => {
    if (page === 1 || page === totalPages) return true;
    if (page >= currentPage - 2 && page <= currentPage + 2) return true;
    return false;
  });

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
      <div className="flex items-center gap-4">
        {total !== undefined && (
          <p className="text-sm text-gray-700">
            Tổng <span className="font-medium">{total}</span> kết quả
          </p>
        )}
        {perPage && onPerPageChange && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Hiển thị:</label>
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Trước
        </button>

        {visiblePages.map((page, index) => {
          const prevPage = visiblePages[index - 1];
          const showEllipsis = prevPage && page - prevPage > 1;

          return (
            <div key={page} className="flex items-center gap-2">
              {showEllipsis && <span className="text-gray-400">...</span>}
              <button
                onClick={() => onPageChange(page)}
                className={`
                  px-3 py-1 border rounded-lg text-sm font-medium transition
                  ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {page}
              </button>
            </div>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2 border rounded-lg transition
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500' : 'border-gray-300'}
              ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

