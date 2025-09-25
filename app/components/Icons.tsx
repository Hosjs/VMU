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
      {/* Car outline */}
      <path
        d="M5 14v-3l2-4h10l2 4v3M7 18h10M9 18v2M15 18v2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
        fillOpacity="0.1"
      />
      {/* Water drops */}
      <path
        d="M8 3c0 2-2 3-2 5s2 3 2 3 2-1 2-3-2-3-2-5zM16 2c0 1.5-1.5 2.5-1.5 4s1.5 2.5 1.5 2.5 1.5-1 1.5-2.5S16 3.5 16 2zM12 4c0 1-1 2-1 3s1 2 1 2 1-1 1-2-1-2-1-3z"
        fill={color}
        fillOpacity="0.6"
      />
      {/* Wheels */}
      <circle cx="8" cy="16" r="2" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="16" r="2" stroke={color} strokeWidth="1.5" fill="none" />
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
      {/* Magnifying glass */}
      <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1" />
      <circle cx="11" cy="11" r="4" stroke={color} strokeWidth="1" fill="none" />
      <path d="m21 21-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Diagnostic symbols inside */}
      <path d="M9 11h4M11 9v4" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <circle cx="11" cy="11" r="0.5" fill={color} />
    </svg>
  );
}

// Location Pin Icon
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
      <circle cx="12" cy="10" r="3" fill={color} fillOpacity="0.6" />
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

// Professional Mechanic Icon
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
      {/* Person */}
      <path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
        fillOpacity="0.1"
      />
      <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2" />
      {/* Tools */}
      <path
        d="M16 8l2-2 1 1-2 2M8 16l-2 2-1-1 2-2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Tools Icon
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
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="2"
      />
      <path
        d="M9.2 9.2L4.3 14.1a2.4 2.4 0 0 0 3.4 3.4L12.6 12.6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Speed/Fast Service Icon
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
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1" />
      <path
        d="M12 6v6l4 2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Speed lines */}
      <path
        d="M18 6l-2 2M20 12h-2M18 18l-2-2"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

// Quality/Diamond Icon
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
        d="M6 3h12l4 6-10 12L2 9l4-6z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M6 3l6 6 6-6M2 9l10 12 10-12"
        stroke={color}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
