import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function LoadingSpinner({ size = 'md', color = '#3B82F6' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-2 ${sizeClasses[size]}`}
         style={{ borderTopColor: color }}>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 text-lg">Đang tải...</p>
      </div>
    </div>
  );
}

export function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <LoadingSpinner size="md" />
        <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
      </div>
    </div>
  );
}

// Advanced Page Transition Loader
export function PageTransitionLoader({ isVisible = true }: { isVisible?: boolean }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div className="relative">
        {/* Main spinner with gradient */}
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

        {/* Pulsing background circle */}
        <div className="absolute inset-0 w-16 h-16 border-4 border-blue-100 rounded-full animate-pulse"></div>

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
      </div>

      {/* Loading text with fade animation */}
      <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2">
        <p className="text-gray-600 text-lg font-medium animate-pulse">Đang chuyển trang...</p>
      </div>
    </div>
  );
}

// Progress Bar Loader
export function ProgressLoader({ progress = 0, isVisible = true }: { progress?: number; isVisible?: boolean }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center">
      <div className="w-80 text-center">
        {/* Logo or brand */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold">
            AC
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">AutoCare Pro</h2>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Progress text */}
        <p className="text-gray-600">{Math.round(progress)}% hoàn thành</p>
      </div>
    </div>
  );
}

// Car Animation Loader
export function CarAnimationLoader({ isVisible = true }: { isVisible?: boolean }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        {/* Car animation */}
        <div className="relative mb-8">
          <div className="w-32 h-16 bg-blue-600 rounded-lg relative animate-bounce">
            <div className="absolute -bottom-2 left-4 w-6 h-6 bg-gray-800 rounded-full"></div>
            <div className="absolute -bottom-2 right-4 w-6 h-6 bg-gray-800 rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 w-8 h-4 bg-blue-300 rounded"></div>
          </div>
        </div>

        {/* Loading text with typing effect */}
        <div className="text-xl font-semibold text-gray-800 mb-2">
          Đang chuẩn bị dịch vụ...
        </div>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton Loader for content
export function SkeletonLoader() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
