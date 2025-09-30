import React from 'react';

interface TruongThangLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
}

export function TruongThangLogo({
  className = '',
  size = 'md',
  variant = 'full'
}: TruongThangLogoProps) {

  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const iconSizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80
  };

  if (variant === 'icon') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg
          width={iconSizes[size]}
          height={iconSizes[size]}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Shield Background */}
          <path
            d="M50 5L85 20v30c0 25-15 40-35 45C30 90 15 75 15 50V20L50 5z"
            fill="url(#shieldGradient)"
            stroke="#1E40AF"
            strokeWidth="2"
          />

          {/* Car Silhouette */}
          <g transform="translate(25, 35)">
            <path
              d="M5 15h40l5-8c1-2 0-4-2-4H2c-2 0-3 2-2 4l5 8z"
              fill="url(#carGradient)"
              stroke="#fff"
              strokeWidth="1"
            />
            <rect x="0" y="15" width="50" height="8" rx="2" fill="url(#carBase)" />

            {/* Wheels */}
            <circle cx="12" cy="19" r="4" fill="url(#wheelGradient)" stroke="#fff" strokeWidth="1" />
            <circle cx="38" cy="19" r="4" fill="url(#wheelGradient)" stroke="#fff" strokeWidth="1" />
            <circle cx="12" cy="19" r="2" fill="#fff" opacity="0.8" />
            <circle cx="38" cy="19" r="2" fill="#fff" opacity="0.8" />
          </g>

          {/* Success Symbol */}
          <g transform="translate(40, 25)">
            <circle cx="10" cy="10" r="8" fill="url(#successBg)" stroke="#fff" strokeWidth="1" />
            <path
              d="M6 10l3 3 6-6"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>

          {/* Decorative Elements */}
          <circle cx="25" cy="25" r="2" fill="#FFD700" opacity="0.6" />
          <circle cx="75" cy="75" r="1.5" fill="#FFD700" opacity="0.4" />

          <defs>
            <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9"/>
              <stop offset="50%" stopColor="#1E40AF" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.7"/>
            </linearGradient>

            <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.8"/>
            </linearGradient>

            <linearGradient id="carBase" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.8"/>
            </linearGradient>

            <radialGradient id="wheelGradient">
              <stop offset="0%" stopColor="#374151" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#111827" stopOpacity="0.8"/>
            </radialGradient>

            <radialGradient id="successBg">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#059669" stopOpacity="0.8"/>
            </radialGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className={`font-bold text-blue-600 ${textSizes[size]} leading-tight`}>
          TRƯỜNG THẮNG
        </div>
        <div className="text-gray-600 text-sm font-medium tracking-wider uppercase">
          Auto
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Icon */}
      <TruongThangLogo variant="icon" size={size} />

      {/* Text */}
      <div className="flex flex-col">
        <div className={`font-bold text-blue-600 ${textSizes[size]} leading-tight`}>
          TRƯỜNG THẮNG
        </div>
        <div className="text-gray-600 text-xs font-medium tracking-wider uppercase">
          Auto Services
        </div>
      </div>
    </div>
  );
}
