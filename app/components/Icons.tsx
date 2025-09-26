import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

// Engine Repair Icon - Cải tiến chuyên nghiệp cho marketing
export function EngineIcon({ className = '', size = 24, color = '#EF4444' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 8px rgba(239, 68, 68, 0.15))' }}
    >
      {/* Engine block với gradient chuyên nghiệp */}
      <rect x="4" y="8" width="16" height="10" rx="3" fill="url(#engine-gradient)" stroke={color} strokeWidth="1.5" />
      <rect x="6" y="10" width="12" height="6" rx="2" fill="url(#engine-inner)" />

      {/* Cylinders với hiệu ứng 3D */}
      <rect x="7" y="3" width="2.5" height="5" rx="1.25" fill="url(#cylinder-gradient)" stroke={color} strokeWidth="1"/>
      <rect x="10.75" y="3" width="2.5" height="5" rx="1.25" fill="url(#cylinder-gradient)" stroke={color} strokeWidth="1"/>
      <rect x="14.5" y="3" width="2.5" height="5" rx="1.25" fill="url(#cylinder-gradient)" stroke={color} strokeWidth="1"/>

      {/* Spark plugs với glow effect */}
      <circle cx="8.25" cy="2.5" r="1" fill="url(#spark-gradient)" stroke="#fff" strokeWidth="0.5" />
      <circle cx="12" cy="2.5" r="1" fill="url(#spark-gradient)" stroke="#fff" strokeWidth="0.5" />
      <circle cx="15.75" cy="2.5" r="1" fill="url(#spark-gradient)" stroke="#fff" strokeWidth="0.5" />

      {/* Engine details với animation-ready elements */}
      <path d="M2 12h2.5M19.5 12h2.5M4 15h2.5M17.5 15h2.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="13" r="2" fill="url(#center-gradient)" stroke={color} strokeWidth="1" />
      <path d="M11 12h2M12 11v2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />

      {/* Exhaust với particle effect */}
      <path d="M20 16h3.5" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
      <circle cx="22.5" cy="16" r="0.8" fill={color} opacity="0.6"/>
      <circle cx="23.2" cy="15.5" r="0.4" fill={color} opacity="0.4"/>
      <circle cx="23.5" cy="16.5" r="0.3" fill={color} opacity="0.3"/>

      <defs>
        <linearGradient id="engine-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="50%" stopColor={color} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.1"/>
        </linearGradient>
        <linearGradient id="engine-inner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.1"/>
        </linearGradient>
        <linearGradient id="cylinder-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.2"/>
        </linearGradient>
        <radialGradient id="spark-gradient">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.6"/>
        </radialGradient>
        <radialGradient id="center-gradient">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.2"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

// Maintenance Icon - Premium marketing design
export function MaintenanceIcon({ className = '', size = 24, color = '#10B981' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.15))' }}
    >
      {/* Main gear với premium gradient */}
      <circle cx="12" cy="12" r="7" fill="url(#maintenance-outer)" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.5" fill="url(#maintenance-middle)" stroke={color} strokeWidth="1" />
      <circle cx="12" cy="12" r="2" fill="url(#maintenance-center)" stroke="#fff" strokeWidth="0.5" />
      <circle cx="12" cy="12" r="1" fill="#fff" />

      {/* Gear teeth với 3D effect */}
      <g opacity="0.9">
        <rect x="11" y="1" width="2" height="4" rx="1" fill={color} />
        <rect x="11" y="19" width="2" height="4" rx="1" fill={color} />
        <rect x="19" y="11" width="4" height="2" rx="1" fill={color} />
        <rect x="1" y="11" width="4" height="2" rx="1" fill={color} />
      </g>

      {/* Diagonal teeth */}
      <g opacity="0.8">
        <rect x="17.8" y="3.8" width="2.8" height="1.4" rx="0.7" fill={color} transform="rotate(45 19.2 4.5)" />
        <rect x="17.8" y="18.8" width="2.8" height="1.4" rx="0.7" fill={color} transform="rotate(45 19.2 19.5)" />
        <rect x="3.8" y="3.8" width="2.8" height="1.4" rx="0.7" fill={color} transform="rotate(-45 4.8 4.5)" />
        <rect x="3.8" y="18.8" width="2.8" height="1.4" rx="0.7" fill={color} transform="rotate(-45 4.8 19.5)" />
      </g>

      {/* Highlight effects */}
      <path d="M8 8l3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <circle cx="15" cy="9" r="1" fill="#fff" opacity="0.4"/>
      <circle cx="9" cy="15" r="0.8" fill="#fff" opacity="0.3"/>

      <defs>
        <linearGradient id="maintenance-outer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="50%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.1"/>
        </linearGradient>
        <radialGradient id="maintenance-middle">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.15"/>
        </radialGradient>
        <radialGradient id="maintenance-center">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.4"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

// Insurance Shield Icon - Premium marketing design
export function InsuranceIcon({ className = '', size = 24, color = '#3B82F6' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 3px 12px rgba(59, 130, 246, 0.2))' }}
    >
      {/* Shield base với premium gradient */}
      <path
        d="M12 1.5L22 5.5v7c0 6.2-4.2 12-10 13.5C6.2 24.5 2 18.7 2 12.5v-7l10-4z"
        fill="url(#insurance-shield)"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Inner shield layer */}
      <path
        d="M12 3L20 6.5v6c0 5.2-3.5 10-8 11.3C7.5 22.5 4 17.7 4 12.5v-6l8-3z"
        fill="url(#insurance-inner)"
        stroke="none"
      />

      {/* Premium checkmark */}
      <g>
        <circle cx="12" cy="12" r="5" fill="url(#check-bg)" stroke="none" />
        <path
          d="M9 12l2 2 4-4"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))' }}
        />
      </g>

      {/* Decorative elements */}
      <circle cx="12" cy="12" r="8" fill="none" stroke="url(#insurance-ring)" strokeWidth="0.5" opacity="0.4" />
      <path d="M12 4v2M12 18v2M6 12h2M16 12h2" stroke={color} strokeWidth="0.8" opacity="0.3" strokeLinecap="round" />

      <defs>
        <linearGradient id="insurance-shield" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="50%" stopColor={color} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.1"/>
        </linearGradient>
        <linearGradient id="insurance-inner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
        </linearGradient>
        <radialGradient id="check-bg">
          <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.6"/>
        </radialGradient>
        <linearGradient id="insurance-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.6"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.2"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Registration Document Icon - Professional marketing design
export function RegistrationIcon({ className = '', size = 24, color = '#10B981' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 10px rgba(16, 185, 129, 0.15))' }}
    >
      {/* Document base */}
      <rect x="3" y="3" width="18" height="18" rx="3" fill="url(#reg-document)" stroke={color} strokeWidth="1.5" />

      {/* Header section */}
      <rect x="5" y="5" width="14" height="4" rx="1" fill="url(#reg-header)" />
      <path d="M3 10h18" stroke={color} strokeWidth="1" opacity="0.3" />

      {/* Document lines */}
      <path d="M6 13h12M6 15h10M6 17h8" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

      {/* Logo/Brand area */}
      <rect x="6" y="6" width="6" height="2" rx="1" fill="#fff" opacity="0.8" />

      {/* Approval stamp */}
      <circle cx="17" cy="7" r="1.5" fill="url(#stamp-gradient)" stroke="#fff" strokeWidth="0.5" />
      <path d="M16.2 7l0.8 0.8 1.5-1.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Premium accent */}
      <rect x="15" y="13" width="4" height="6" rx="1" fill="url(#accent-gradient)" opacity="0.6" />
      <path d="M16.5 15l1 1 2-2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      <defs>
        <linearGradient id="reg-document" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.08"/>
        </linearGradient>
        <linearGradient id="reg-header" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.08"/>
        </linearGradient>
        <radialGradient id="stamp-gradient">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.7"/>
        </radialGradient>
        <linearGradient id="accent-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.2"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Paint Service Icon - Premium marketing design
export function CarWashIcon({ className = '', size = 24, color = '#8B5CF6' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 10px rgba(139, 92, 246, 0.15))' }}
    >
      {/* Car silhouette với premium gradient */}
      <path
        d="M5 14h14l2-5c.6-1.8-.6-3.5-2.5-3.5H5.5c-1.9 0-3.1 1.7-2.5 3.5l2 5z"
        fill="url(#car-body)"
        stroke={color}
        strokeWidth="1.2"
      />
      <path d="M3 14h18v3c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-3z" fill="url(#car-base)" />

      {/* Premium wheels */}
      <circle cx="7.5" cy="17" r="2" fill="url(#wheel-gradient)" stroke={color} strokeWidth="1" />
      <circle cx="16.5" cy="17" r="2" fill="url(#wheel-gradient)" stroke={color} strokeWidth="1" />
      <circle cx="7.5" cy="17" r="1" fill="#fff" opacity="0.8" />
      <circle cx="16.5" cy="17" r="1" fill="#fff" opacity="0.8" />

      {/* Premium paint brush */}
      <g transform="translate(14, 2)">
        <path d="M1 1l4 4-1.5 1.5-4-4L1 1z" fill="url(#brush-gradient)" stroke={color} strokeWidth="1" />
        <path d="M5 5l3-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="0.5" cy="0.5" r="0.5" fill="#FFD700" />
      </g>

      {/* Paint drops với animation-ready positions */}
      <g opacity="0.8">
        <circle cx="10" cy="4" r="1" fill="url(#drop-gradient)" />
        <circle cx="12.5" cy="2.5" r="0.8" fill="url(#drop-gradient)" />
        <circle cx="8" cy="5.5" r="0.6" fill="url(#drop-gradient)" />
        <circle cx="13" cy="6" r="0.5" fill="url(#drop-gradient)" />
      </g>

      {/* Car details */}
      <rect x="8" y="10" width="8" height="2" rx="1" fill="#fff" opacity="0.3" />
      <circle cx="6" cy="11" r="0.8" fill={color} opacity="0.4" />
      <circle cx="18" cy="11" r="0.8" fill={color} opacity="0.4" />

      <defs>
        <linearGradient id="car-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="50%" stopColor={color} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.1"/>
        </linearGradient>
        <linearGradient id="car-base" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.15"/>
        </linearGradient>
        <radialGradient id="wheel-gradient">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.6"/>
        </radialGradient>
        <linearGradient id="brush-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.8"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.4"/>
        </linearGradient>
        <radialGradient id="drop-gradient">
          <stop offset="0%" stopColor={color} stopOpacity="0.6"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

// Tools Icon - Professional marketing design
export function ToolsIcon({ className = '', size = 24, color = '#F59E0B' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 10px rgba(245, 158, 11, 0.15))' }}
    >
      {/* Main wrench với premium gradient */}
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"
        stroke={color}
        strokeWidth="1.5"
        fill="url(#wrench-gradient)"
      />

      {/* Screwdriver với 3D effect */}
      <path d="M3 14l4-4 4 4-4 4c-1.1 1.1-2.9 1.1-4 0s-1.1-2.9 0-4z"
            fill="url(#screwdriver-gradient)"
            stroke={color}
            strokeWidth="1"/>
      <path d="M7 10l7-7" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M14 3l3-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* Handle detail */}
      <rect x="13" y="2" width="2" height="3" rx="1" fill="url(#handle-gradient)" stroke={color} strokeWidth="0.5"/>

      {/* Gear accent với glow */}
      <g opacity="0.8">
        <circle cx="16" cy="8" r="2" fill="url(#gear-gradient)" stroke={color} strokeWidth="1"/>
        <circle cx="16" cy="8" r="1" fill="#fff" opacity="0.6"/>
        <path d="M15 7l2 2M17 7l-2 2" stroke={color} strokeWidth="1" opacity="0.6"/>
      </g>

      {/* Sparkle effects */}
      <g opacity="0.6">
        <path d="M4 6l1-1 1 1-1 1-1-1zM20 18l1-1 1 1-1 1-1-1z" fill="#FFD700"/>
        <circle cx="18" cy="4" r="0.5" fill="#FFD700"/>
        <circle cx="6" cy="20" r="0.5" fill="#FFD700"/>
      </g>

      <defs>
        <linearGradient id="wrench-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="50%" stopColor={color} stopOpacity="0.1"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
        </linearGradient>
        <linearGradient id="screwdriver-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.2"/>
        </linearGradient>
        <linearGradient id="handle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B4513" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#D2691E" stopOpacity="0.6"/>
        </linearGradient>
        <radialGradient id="gear-gradient">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.4"/>
        </radialGradient>
      </defs>
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
      <rect x="2" y="6" width="20" height="12" rx="3" fill="url(#diagnostic-gradient)" stroke={color} strokeWidth="1.5" />
      <rect x="4" y="8" width="16" height="8" rx="1" fill={color} fillOpacity="0.1" />
      <path d="M8 11h8M8 13h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="18" cy="12" r="1.5" fill={color} fillOpacity="0.8" />
      <path d="M12 2v4M6 4l1.5 1.5M18 4l-1.5 1.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* Screen content */}
      <path d="M6 10h3M6 12h5M6 14h4" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
      <circle cx="15" cy="11" r="0.5" fill={color} opacity="0.4"/>
      <circle cx="16" cy="13" r="0.5" fill={color} opacity="0.4"/>

      <defs>
        <linearGradient id="diagnostic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.1"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Tire Icon - Professional marketing design
export function TireIcon({ className = '', size = 24, color = '#1F2937' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 8px rgba(31, 41, 55, 0.15))' }}
    >
      {/* Outer tire với premium gradient */}
      <circle cx="12" cy="12" r="9" fill="url(#tire-outer)" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="12" r="6.5" fill="url(#tire-middle)" stroke={color} strokeWidth="1" />
      <circle cx="12" cy="12" r="4" fill="url(#tire-inner)" stroke="#fff" strokeWidth="0.5" />
      <circle cx="12" cy="12" r="2" fill="url(#tire-center)" />

      {/* Tread pattern với 3D effect */}
      <g opacity="0.7">
        <path d="M5 12h14M12 5v14" stroke={color} strokeWidth="1" />
        <path d="M8 8l8 8M8 16l8-8" stroke={color} strokeWidth="0.8" opacity="0.6" />
        <circle cx="12" cy="7" r="0.5" fill={color} opacity="0.5"/>
        <circle cx="12" cy="17" r="0.5" fill={color} opacity="0.5"/>
        <circle cx="7" cy="12" r="0.5" fill={color} opacity="0.5"/>
        <circle cx="17" cy="12" r="0.5" fill={color} opacity="0.5"/>
      </g>

      {/* Rim details */}
      <g opacity="0.8">
        <circle cx="12" cy="12" r="3.5" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.6"/>
        <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" stroke="#fff" strokeWidth="0.8" opacity="0.4"/>
      </g>

      <defs>
        <radialGradient id="tire-outer">
          <stop offset="0%" stopColor={color} stopOpacity="0.1"/>
          <stop offset="70%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.5"/>
        </radialGradient>
        <radialGradient id="tire-middle">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
        </radialGradient>
        <radialGradient id="tire-inner">
          <stop offset="0%" stopColor="#C0C0C0" stopOpacity="0.6"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.2"/>
        </radialGradient>
        <radialGradient id="tire-center">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#C0C0C0" stopOpacity="0.6"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

// Brake Icon - Professional marketing design
export function BrakeIcon({ className = '', size = 24, color = '#DC2626' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 8px rgba(220, 38, 38, 0.15))' }}
    >
      {/* Brake disc với metallic effect */}
      <circle cx="12" cy="12" r="9" fill="url(#brake-disc)" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="12" r="6" fill="url(#brake-inner)" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" fill="url(#brake-center)" stroke="#fff" strokeWidth="0.5" />
      <circle cx="12" cy="12" r="1.5" fill="#fff" opacity="0.9" />

      {/* Brake pads với 3D effect */}
      <rect x="5.5" y="9.5" width="3.5" height="5" rx="1.5" fill="url(#pad-gradient)" stroke={color} strokeWidth="1" />
      <rect x="15" y="9.5" width="3.5" height="5" rx="1.5" fill="url(#pad-gradient)" stroke={color} strokeWidth="1" />
      <rect x="9.5" y="5.5" width="5" height="3.5" rx="1.5" fill="url(#pad-gradient)" stroke={color} strokeWidth="1" />
      <rect x="9.5" y="15" width="5" height="3.5" rx="1.5" fill="url(#pad-gradient)" stroke={color} strokeWidth="1" />

      {/* Ventilation holes */}
      <g opacity="0.6">
        <circle cx="9" cy="9" r="0.8" fill="none" stroke={color} strokeWidth="0.8"/>
        <circle cx="15" cy="9" r="0.8" fill="none" stroke={color} strokeWidth="0.8"/>
        <circle cx="9" cy="15" r="0.8" fill="none" stroke={color} strokeWidth="0.8"/>
        <circle cx="15" cy="15" r="0.8" fill="none" stroke={color} strokeWidth="0.8"/>
      </g>

      {/* Heat lines */}
      <g opacity="0.4">
        <path d="M6 6l1 1M18 6l-1 1M6 18l1-1M18 18l-1-1" stroke="#FF6B6B" strokeWidth="1" strokeLinecap="round"/>
      </g>

      <defs>
        <radialGradient id="brake-disc">
          <stop offset="0%" stopColor="#E5E7EB" stopOpacity="0.3"/>
          <stop offset="70%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.4"/>
        </radialGradient>
        <radialGradient id="brake-inner">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.2"/>
        </radialGradient>
        <radialGradient id="brake-center">
          <stop offset="0%" stopColor="#F3F4F6" stopOpacity="0.8"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
        </radialGradient>
        <linearGradient id="pad-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.6"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Location Icon - Premium marketing design
export function LocationIcon({ className = '', size = 24, color = '#3B82F6' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 3px 12px rgba(59, 130, 246, 0.2))' }}
    >
      {/* Location pin với premium gradient */}
      <path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
        fill="url(#location-gradient)"
        stroke={color}
        strokeWidth="2"
      />

      {/* Inner location circle */}
      <circle cx="12" cy="10" r="4" fill="url(#location-inner)" stroke="#fff" strokeWidth="1" />
      <circle cx="12" cy="10" r="2.5" fill="url(#location-center)" stroke="none" />
      <circle cx="12" cy="10" r="1.5" fill="#fff" opacity="0.9" />

      {/* Pulse rings for animation */}
      <circle cx="12" cy="10" r="6" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
      <circle cx="12" cy="10" r="7.5" fill="none" stroke={color} strokeWidth="0.3" opacity="0.2" />

      {/* Ground shadow */}
      <ellipse cx="12" cy="22" rx="3" ry="1" fill={color} opacity="0.2" />

      <defs>
        <linearGradient id="location-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
          <stop offset="50%" stopColor={color} stopOpacity="0.6"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.4"/>
        </linearGradient>
        <radialGradient id="location-inner">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
        </radialGradient>
        <radialGradient id="location-center">
          <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.5"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

// Phone Icon - Premium marketing design
export function PhoneIcon({ className = '', size = 24, color = '#059669' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 10px rgba(5, 150, 105, 0.15))' }}
    >
      {/* Phone body với premium gradient */}
      <rect x="5" y="2" width="14" height="20" rx="4" fill="url(#phone-body)" stroke={color} strokeWidth="1.5" />
      <rect x="6" y="4" width="12" height="14" rx="2" fill="url(#phone-screen)" stroke="none" />

      {/* Screen glow */}
      <rect x="7" y="5" width="10" height="12" rx="1.5" fill="url(#screen-glow)" stroke="none" />

      {/* Call icon on screen */}
      <g transform="translate(12, 11)">
        <circle r="3" fill="url(#call-bg)" stroke="none"/>
        <path
          d="M-1.5 -1.5c.3-.3.8-.3 1.1 0l.4.4c.3.3.3.8 0 1.1l-.5.5c-.1.1-.1.3 0 .5.3.6.8 1.1 1.4 1.4.2.1.4.1.5 0l.5-.5c.3-.3.8-.3 1.1 0l.4.4c.3.3.3.8 0 1.1l-.3.3c-.5.5-1.2.7-1.9.5-1.4-.4-2.6-1.6-3-3-.2-.7 0-1.4.5-1.9l.3-.3z"
          fill="#fff"
          stroke="none"
        />
      </g>

      {/* Home button */}
      <circle cx="12" cy="19.5" r="1.2" fill="url(#button-gradient)" stroke={color} strokeWidth="0.5" />
      <circle cx="12" cy="19.5" r="0.6" fill="#fff" opacity="0.8" />

      {/* Speaker */}
      <rect x="10" y="3.5" width="4" height="0.8" rx="0.4" fill={color} opacity="0.6" />

      {/* Side buttons */}
      <rect x="4.2" y="8" width="0.8" height="3" rx="0.4" fill={color} opacity="0.6" />
      <rect x="4.2" y="12" width="0.8" height="2" rx="0.4" fill={color} opacity="0.6" />

      <defs>
        <linearGradient id="phone-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" stopOpacity="1"/>
          <stop offset="50%" stopColor={color} stopOpacity="0.05"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.1"/>
        </linearGradient>
        <linearGradient id="phone-screen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#334155" stopOpacity="0.7"/>
        </linearGradient>
        <radialGradient id="screen-glow">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="call-bg">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.7"/>
        </radialGradient>
        <radialGradient id="button-gradient">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

// Additional utility icons với marketing design
export function MechanicIcon({ className = '', size = 24, color = '#0F172A' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 8px rgba(15, 23, 42, 0.15))' }}
    >
      {/* Head với professional styling */}
      <circle cx="12" cy="6" r="4.5" fill="url(#mechanic-head)" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="6" r="3" fill="url(#face-gradient)" stroke="none" />

      {/* Body với uniform gradient */}
      <path
        d="M6 14v8h12v-8l-2-2H8l-2 2z"
        fill="url(#mechanic-body)"
        stroke={color}
        strokeWidth="1.5"
      />
      <path d="M5 14h14l-2-2H7l-2 2z" fill="url(#mechanic-collar)" stroke={color} strokeWidth="1" />

      {/* Professional details */}
      <rect x="10" y="16" width="4" height="2" rx="0.5" fill="#fff" opacity="0.7" />
      <circle cx="8" cy="17" r="0.8" fill={color} opacity="0.4" />
      <circle cx="16" cy="17" r="0.8" fill={color} opacity="0.4" />

      {/* Tool belt */}
      <rect x="7" y="19" width="10" height="1.5" rx="0.75" fill="url(#belt-gradient)" stroke={color} strokeWidth="0.5" />
      <rect x="9" y="18.5" width="1" height="2" rx="0.5" fill="#D4AF37" opacity="0.8" />
      <rect x="14" y="18.5" width="1" height="2" rx="0.5" fill="#D4AF37" opacity="0.8" />

      {/* Hard hat suggestion */}
      <path d="M8 2.5h8c1 0 2 0.5 2 1.5" stroke={color} strokeWidth="1" opacity="0.4" strokeLinecap="round"/>

      <defs>
        <radialGradient id="mechanic-head">
          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.1"/>
        </radialGradient>
        <radialGradient id="face-gradient">
          <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#FB923C" stopOpacity="0.4"/>
        </radialGradient>
        <linearGradient id="mechanic-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.5"/>
        </linearGradient>
        <linearGradient id="mechanic-collar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.1"/>
        </linearGradient>
        <linearGradient id="belt-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B4513" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#D2691E" stopOpacity="0.6"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SpeedIcon({ className = '', size = 24, color = '#3B82F6' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.15))' }}
    >
      {/* Speedometer base */}
      <circle cx="12" cy="12" r="10" fill="url(#speed-outer)" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="12" r="7" fill="url(#speed-inner)" stroke={color} strokeWidth="1" />

      {/* Speed markings */}
      <g opacity="0.8">
        <path d="M12 4v3M20 12h-3M12 20v-3M4 12h3" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M18.4 5.6l-2.1 2.1M18.4 18.4l-2.1-2.1M5.6 5.6l2.1 2.1M5.6 18.4l2.1-2.1"
              stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Needle */}
      <path d="M12 12l4-6" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="url(#needle-center)" stroke="#fff" strokeWidth="1" />
      <circle cx="12" cy="12" r="1" fill="#fff" />

      {/* Speed indicators */}
      <g opacity="0.6">
        <text x="12" y="8" textAnchor="middle" fontSize="3" fill={color} fontWeight="bold">80</text>
        <text x="16.5" y="13" textAnchor="middle" fontSize="2" fill={color}>120</text>
        <text x="7.5" y="13" textAnchor="middle" fontSize="2" fill={color}>40</text>
      </g>

      <defs>
        <radialGradient id="speed-outer">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.1"/>
        </radialGradient>
        <radialGradient id="speed-inner">
          <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.8"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
        </radialGradient>
        <radialGradient id="needle-center">
          <stop offset="0%" stopColor="#DC2626" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#B91C1C" stopOpacity="0.6"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

export function QualityIcon({ className = '', size = 24, color = '#D97706' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 3px 12px rgba(217, 119, 6, 0.2))' }}
    >
      {/* Premium star với gradient */}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="url(#star-gradient)"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Inner star highlight */}
      <path
        d="M12 4l2.5 5L19 9.5l-4 3.5L16 18l-4-2.5L8 18l1-5-4-3.5L9.5 9L12 4z"
        fill="url(#star-inner)"
        stroke="none"
      />

      {/* Center sparkle */}
      <circle cx="12" cy="12" r="2" fill="url(#sparkle-gradient)" stroke="#fff" strokeWidth="0.5" />
      <path d="M11 12h2M12 11v2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />

      {/* Sparkle effects */}
      <g opacity="0.8">
        <path d="M6 6l1-1 1 1-1 1-1-1z" fill="#FFD700"/>
        <path d="M18 6l1-1 1 1-1 1-1-1z" fill="#FFD700"/>
        <circle cx="4" cy="16" r="0.5" fill="#FFD700"/>
        <circle cx="20" cy="16" r="0.5" fill="#FFD700"/>
      </g>

      <defs>
        <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9"/>
          <stop offset="50%" stopColor={color} stopOpacity="0.7"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.5"/>
        </linearGradient>
        <linearGradient id="star-inner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
        </linearGradient>
        <radialGradient id="sparkle-gradient">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.6"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

// Document Icon - Professional design
export function DocumentIcon({ className = '', size = 24, color = '#374151' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 8px rgba(55, 65, 81, 0.1))' }}
    >
      {/* Document base */}
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        fill="url(#doc-gradient)"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Folded corner */}
      <path d="M14 2v6h6" fill="url(#corner-gradient)" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />

      {/* Content lines */}
      <path d="M8 13h8M8 16h6M8 19h4" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

      {/* Header accent */}
      <rect x="8" y="10" width="6" height="1.5" rx="0.75" fill={color} opacity="0.6" />

      <defs>
        <linearGradient id="doc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
        </linearGradient>
        <linearGradient id="corner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.08"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Info Detail Icon - Thay thế biểu tượng con mắt
export function InfoDetailIcon({ className = '', size = 24, color = '#3B82F6' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.15))' }}
    >
      {/* Document base với premium gradient */}
      <rect x="4" y="3" width="16" height="18" rx="3" fill="url(#info-gradient)" stroke={color} strokeWidth="1.5" />

      {/* Header bar */}
      <rect x="6" y="5" width="12" height="3" rx="1.5" fill="url(#header-gradient)" />

      {/* Content lines */}
      <path d="M7 11h10M7 13h8M7 15h6" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

      {/* Info icon in circle */}
      <circle cx="17" cy="7" r="2.5" fill="url(#icon-bg)" stroke="#fff" strokeWidth="1" />
      <circle cx="17" cy="6" r="0.8" fill="#fff" />
      <rect x="16.5" y="7.2" width="1" height="2.5" rx="0.5" fill="#fff" />

      {/* Premium accent lines */}
      <path d="M7 17h4M13 17h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

      {/* Decorative elements */}
      <circle cx="8" cy="18" r="0.5" fill={color} opacity="0.4" />
      <circle cx="16" cy="18" r="0.5" fill={color} opacity="0.4" />

      <defs>
        <linearGradient id="info-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.08"/>
        </linearGradient>
        <linearGradient id="header-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.08"/>
        </linearGradient>
        <radialGradient id="icon-bg">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.7"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

// Arrow Down Icon - Cho link scroll
export function ArrowDownIcon({ className = '', size = 24, color = '#3B82F6' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 6px rgba(59, 130, 246, 0.15))' }}
    >
      {/* Circle background */}
      <circle cx="12" cy="12" r="10" fill="url(#arrow-bg)" stroke={color} strokeWidth="1.5" />

      {/* Arrow path */}
      <path
        d="M8 10l4 4 4-4"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
      />

      {/* Decorative ring */}
      <circle cx="12" cy="12" r="8" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />

      <defs>
        <radialGradient id="arrow-bg">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.7"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

// Alias cho PaintServiceIcon để tương thích
export const PaintServiceIcon = CarWashIcon;
