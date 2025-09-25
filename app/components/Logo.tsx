import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'white';
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

export function Logo({ className = '', size = 'md', variant = 'light' }: LogoProps) {
  const sizeClass = sizeMap[size];

  const getColors = () => {
    switch (variant) {
      case 'white':
        return {
          primary: '#FFFFFF',
          secondary: '#F1F5F9',
          accent: '#E2E8F0'
        };
      case 'dark':
        return {
          primary: '#1E293B',
          secondary: '#334155',
          accent: '#3B82F6'
        };
      default: // light
        return {
          primary: '#3B82F6',
          secondary: '#1D4ED8',
          accent: '#60A5FA'
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`${sizeClass} ${className} flex-shrink-0`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer Circle */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill={colors.primary}
          stroke={colors.secondary}
          strokeWidth="2"
        />

        {/* Inner Circle Background */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill={colors.secondary}
        />

        {/* Car Silhouette */}
        <g transform="translate(25, 35)">
          {/* Main Body */}
          <path
            d="M8 20 L42 20 L40 15 L35 12 L30 10 L20 10 L15 12 L10 15 Z"
            fill={variant === 'white' ? '#1E293B' : '#FFFFFF'}
          />

          {/* Windshield */}
          <path
            d="M15 15 L20 12 L30 12 L35 15 L32 17 L18 17 Z"
            fill={colors.accent}
            opacity="0.8"
          />

          {/* Wheels */}
          <circle cx="17" cy="22" r="4" fill={variant === 'white' ? '#374151' : '#FFFFFF'} />
          <circle cx="33" cy="22" r="4" fill={variant === 'white' ? '#374151' : '#FFFFFF'} />
          <circle cx="17" cy="22" r="2" fill={colors.primary} />
          <circle cx="33" cy="22" r="2" fill={colors.primary} />

          {/* Details */}
          <rect x="12" y="16" width="2" height="1" fill={colors.accent} />
          <rect x="36" y="16" width="2" height="1" fill={colors.accent} />
        </g>

        {/* Wrench Icon Overlay */}
        <g transform="translate(65, 25) rotate(45)">
          <rect x="0" y="0" width="2" height="12" fill={colors.accent} rx="1" />
          <rect x="-1" y="10" width="4" height="2" fill={colors.accent} rx="1" />
        </g>
      </svg>
    </div>
  );
}

export function CompanyLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Logo size="lg" />
      <div>
        <h1 className="text-2xl font-bold text-gray-800">AutoCare Pro</h1>
        <p className="text-sm text-blue-600 font-medium">Professional Garage Services</p>
      </div>
    </div>
  );
}
