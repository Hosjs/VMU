import React from 'react';
import { TruongThangLogo } from './TruongThangLogo';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'white';
}

export function Logo({ className = '', size = 'md', variant = 'light' }: LogoProps) {
  return (
    <TruongThangLogo
      className={className}
      size={size}
      variant="full"
    />
  );
}

// Alias cho CompanyLogo để tương thích với code hiện tại
export function CompanyLogo({ className = '', size = 'md' }: LogoProps) {
  return (
    <TruongThangLogo
      className={className}
      size={size}
      variant="full"
    />
  );
}
