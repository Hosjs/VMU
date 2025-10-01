import React from 'react';

interface LogoProps {
  className?: string;
  showSlogan?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function CompanyLogo({ className = '', showSlogan = true, size = 'medium' }: LogoProps) {
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-12',
    large: 'h-16'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-xl'
  };

  const sloganSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img
        src="/images/logo.png"
        alt="AutoCare Pro Logo"
        className={`${sizeClasses[size]} w-auto object-contain`}
        onError={(e) => {
          // Fallback nếu logo không load được
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />

      {/* Fallback logo nếu ảnh không load được */}
      <div className={`hidden ${sizeClasses[size]} w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg items-center justify-center`}>
        <span className="text-white font-bold text-xl">AC</span>
      </div>

      <div className="flex flex-col">
        <h1 className={`font-bold text-gray-800 ${textSizes[size]} leading-tight`}>
          AutoCare Pro
        </h1>
        {showSlogan && (
          <p className={`text-blue-600 font-medium ${sloganSizes[size]} leading-tight`}>
            Dịch vụ khác biệt, trải nghiệm đỉnh cao
          </p>
        )}
      </div>
    </div>
  );
}

// Component logo đơn giản chỉ có ảnh
export function LogoImage({ className = '', size = 'medium' }: Omit<LogoProps, 'showSlogan'>) {
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-12',
    large: 'h-16'
  };

  return (
    <img
      src="/images/logo.png"
      alt="AutoCare Pro"
      className={`${sizeClasses[size]} w-auto object-contain ${className}`}
      onError={(e) => {
        // Fallback nếu logo không load được
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallback = target.nextElementSibling as HTMLElement;
        if (fallback) fallback.style.display = 'flex';
      }}
    />
  );
}
