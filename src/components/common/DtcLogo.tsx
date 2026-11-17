import React from 'react';

interface DtcLogoProps {
  className?: string;
  size?: number;
}

export function DtcLogo({ className = '', size = 36 }: DtcLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-sm ${className}`}
    >
      {/* Outer Circle with Delhi Green Gradient */}
      <circle cx="50" cy="50" r="48" fill="url(#dtcGreenGrad)" stroke="#15803d" strokeWidth="2.5" />

      {/* Inner Decorative Ring */}
      <circle cx="50" cy="50" r="43" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.85" />

      {/* Road / Perspective Track */}
      <path
        d="M26 80 L38 52 L62 52 L74 80 Z"
        fill="#064e3b"
        opacity="0.6"
      />
      <line x1="50" y1="55" x2="50" y2="78" stroke="#fef08a" strokeWidth="2" strokeDasharray="4 3" />

      {/* Bus Silhouette */}
      {/* Bus Body */}
      <rect x="30" y="22" width="40" height="34" rx="7" fill="#ffffff" stroke="#14532d" strokeWidth="1.5" />
      {/* Windshield */}
      <rect x="33.5" y="25.5" width="33" height="13" rx="3.5" fill="#0284c7" />
      <path d="M50 25.5 L50 38.5" stroke="#ffffff" strokeWidth="1.2" opacity="0.7" />

      {/* Destination Display Board */}
      <rect x="38" y="20" width="24" height="4" rx="1.5" fill="#facc15" />

      {/* Headlights */}
      <circle cx="36" cy="45" r="3" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
      <circle cx="64" cy="45" r="3" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />

      {/* Bus Grille / Bumper */}
      <rect x="42" y="44" width="16" height="4.5" rx="1.5" fill="#14532d" />
      <line x1="44" y1="46" x2="56" y2="46" stroke="#ffffff" strokeWidth="0.8" />

      {/* Wheels */}
      <rect x="31" y="54" width="7" height="4" rx="1" fill="#1e293b" />
      <rect x="62" y="54" width="7" height="4" rx="1" fill="#1e293b" />

      {/* Bottom DTC Banner Pill */}
      <rect x="28" y="80" width="44" height="13" rx="6.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      <text
        x="50"
        y="90"
        fill="#14532d"
        fontSize="9.5"
        fontWeight="900"
        fontFamily="sans-serif"
        textAnchor="middle"
        letterSpacing="0.8"
      >
        DTC
      </text>

      {/* Linear Gradients */}
      <defs>
        <linearGradient id="dtcGreenGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#15803d" />
          <stop offset="0.6" stopColor="#047857" />
          <stop offset="1" stopColor="#064e3b" />
        </linearGradient>
      </defs>
    </svg>
  );
}
