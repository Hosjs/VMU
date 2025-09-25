import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

// Engine Repair Icon
export function EngineIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L13.09 5.26L16 4L17.74 6.74L21 5.84L22.16 9.16L19.84 11.5L22.16 13.84L21 17.16L17.74 16.26L16 19L13.09 17.74L12 21L10.91 17.74L8 19L6.26 16.26L3 17.16L1.84 13.84L4.16 11.5L1.84 9.16L3 5.84L6.26 6.74L8 4L10.91 5.26L12 2Z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="2"
      />
      <circle cx="12" cy="11.5" r="3" fill={color} fillOpacity="0.2" />
      <path d="M9 11.5h6M12 8.5v6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Maintenance Icon
export function MaintenanceIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="2"
      />
      <circle cx="11" cy="11" r="2" fill={color} fillOpacity="0.3" />
    </svg>
  );
}

// Tire Icon
export function TireIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="9" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="12" r="6" fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" fill={color} fillOpacity="0.3" />
      <circle cx="12" cy="12" r="1" fill={color} />
      {/* Tread pattern */}
      <path d="M6 12h12M12 6v12M8.5 8.5l7 7M8.5 15.5l7-7" stroke={color} strokeWidth="0.5" opacity="0.5" />
    </svg>
  );
}

// Brake Icon
export function BrakeIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="9" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="12" r="5" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="12" r="2" fill={color} />
      {/* Brake pads */}
      <rect x="6" y="10" width="3" height="4" rx="1" fill={color} fillOpacity="0.3" />
      <rect x="15" y="10" width="3" height="4" rx="1" fill={color} fillOpacity="0.3" />
      <rect x="10" y="6" width="4" height="3" rx="1" fill={color} fillOpacity="0.3" />
      <rect x="10" y="15" width="4" height="3" rx="1" fill={color} fillOpacity="0.3" />
    </svg>
  );
}

// Car Wash Icon
export function CarWashIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3 16h18v2c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-2z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="2"
      />
      <path
        d="M7 16V9c0-2.76 2.24-5 5-5s5 2.24 5 5v7"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
      {/* Water drops */}
      <circle cx="8" cy="6" r="1" fill={color} fillOpacity="0.5" />
      <circle cx="12" cy="4" r="1" fill={color} fillOpacity="0.5" />
      <circle cx="16" cy="6" r="1" fill={color} fillOpacity="0.5" />
      <circle cx="10" cy="2" r="0.5" fill={color} fillOpacity="0.3" />
      <circle cx="14" cy="2" r="0.5" fill={color} fillOpacity="0.3" />
    </svg>
  );
}

// Diagnostic Icon
export function DiagnosticIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="6" width="20" height="12" rx="2" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
      <rect x="4" y="8" width="16" height="8" rx="1" fill={color} fillOpacity="0.1" />
      <path d="M8 11h8M8 13h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="18" cy="12" r="1" fill={color} />
      <path d="M12 2v4M6 4l1.5 1.5M18 4l-1.5 1.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Insurance Icon - Mới thêm cho dịch vụ bảo hiểm
export function InsuranceIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L21 6v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V6l9-4z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="2"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="1" fill={color} />
    </svg>
  );
}

// Registration Icon - Mới thêm cho dịch vụ đăng ký đăng kiểm
export function RegistrationIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="3" y="4" width="18" height="16" rx="2" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
      <path d="M3 10h18" stroke={color} strokeWidth="2" />
      <path d="M7 14h10M7 17h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="5" y="6" width="4" height="2" rx="1" fill={color} fillOpacity="0.3" />
      <circle cx="17" cy="7" r="1" fill={color} />
    </svg>
  );
}

// Document Icon - Mới thêm cho các dịch vụ giấy tờ
export function DocumentIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="2"
      />
      <polyline points="14,2 14,8 20,8" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2" />
      <line x1="16" y1="13" x2="8" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="17" x2="8" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <polyline points="10,9 9,10 10,11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Location Icon
export function LocationIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="2"
      />
      <circle cx="12" cy="10" r="3" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

// Phone Icon
export function PhoneIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
}

// Additional utility icons
export function MechanicIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="6" r="4" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
      <path
        d="M8 14v8h8v-8"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="2"
      />
      <path d="M6 14h12l-2-2H8l-2 2z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function ToolsIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"
        stroke={color}
        strokeWidth="2"
        fill={color}
        fillOpacity="0.1"
      />
      <path d="M22 4L2 24M15 9l6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SpeedIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="2"
      />
      <path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function QualityIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
}
