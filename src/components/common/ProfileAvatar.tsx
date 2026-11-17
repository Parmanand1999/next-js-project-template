import React from 'react';
import { User, ShieldCheck } from 'lucide-react';

interface ProfileAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showOnlineBadge?: boolean;
}

export function ProfileAvatar({
  className = '',
  size = 'md',
  showOnlineBadge = true,
}: ProfileAvatarProps) {
  const sizeClasses = {
    sm: 'size-7',
    md: 'size-8',
    lg: 'size-9',
  }[size];

  const iconSizes = {
    sm: 'size-3.5',
    md: 'size-4',
    lg: 'size-4.5',
  }[size];

  return (
    <div className={`relative shrink-0 ${className}`}>
      {/* Officer Avatar Circle */}
      <div
        className={`${sizeClasses} rounded-full bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white flex items-center justify-center shadow-xs border border-white/40 ring-1 ring-emerald-500/20`}
      >
        {/* SVG Officer Silhouette */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${iconSizes} text-white`}
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>

      {/* Online Status Beacon */}
      {showOnlineBadge && (
        <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 border-2 border-background ring-1 ring-emerald-400" />
      )}
    </div>
  );
}
