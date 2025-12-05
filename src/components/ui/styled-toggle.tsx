'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface StyledToggleProps {
  /** Whether the toggle is checked */
  checked: boolean;
  /** Callback when toggle state changes */
  onCheckedChange: (checked: boolean) => void;
  /** Optional icon to show inside the thumb when checked */
  checkedIcon?: React.ReactNode;
  /** Optional icon to show inside the thumb when unchecked */
  uncheckedIcon?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Title/tooltip */
  title?: string;
  /** Accent color (default: #E64A19) */
  accentColor?: string;
}

const sizeClasses = {
  sm: {
    track: 'h-5 w-9',
    thumb: 'h-3.5 w-3.5',
    thumbTranslate: 'translate-x-[16px]',
    thumbIcon: 'h-2 w-2',
  },
  md: {
    track: 'h-7 w-12',
    thumb: 'h-5 w-5',
    thumbTranslate: 'translate-x-[22px]',
    thumbIcon: 'h-3 w-3',
  },
  lg: {
    track: 'h-8 w-14',
    thumb: 'h-6 w-6',
    thumbTranslate: 'translate-x-[26px]',
    thumbIcon: 'h-4 w-4',
  },
};

/**
 * StyledToggle - Custom toggle switch with orange-red accent
 *
 * Features:
 * - Consistent styling across the app
 * - Optional icons inside thumb
 * - Multiple size variants
 * - Accessible (role="switch", aria-checked)
 */
export function StyledToggle({
  checked,
  onCheckedChange,
  checkedIcon,
  uncheckedIcon,
  size = 'md',
  disabled = false,
  className,
  title,
  accentColor = '#E64A19',
}: StyledToggleProps) {
  const sizes = sizeClasses[size];

  return (
    <div
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onCheckedChange(!checked)}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onCheckedChange(!checked);
        }
      }}
      title={title}
      className={cn(
        'relative flex-shrink-0 rounded-full cursor-pointer transition-colors border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        sizes.track,
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        backgroundColor: checked ? accentColor : undefined,
        borderColor: checked ? accentColor : undefined,
      }}
      // Fallback classes when not checked
      data-state={checked ? 'checked' : 'unchecked'}
    >
      {/* Track background when unchecked */}
      {!checked && (
        <div className="absolute inset-0 rounded-full bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600" />
      )}

      {/* Thumb (the circle) */}
      <div
        className={cn(
          'absolute top-0.5 rounded-full bg-white shadow-md transition-transform duration-200 flex items-center justify-center',
          sizes.thumb,
          checked ? sizes.thumbTranslate : 'translate-x-0.5'
        )}
      >
        {/* Icon inside thumb */}
        {checked && checkedIcon && (
          <span className={cn(sizes.thumbIcon)} style={{ color: accentColor }}>
            {checkedIcon}
          </span>
        )}
        {!checked && uncheckedIcon && (
          <span className={cn(sizes.thumbIcon, 'text-zinc-400')}>
            {uncheckedIcon}
          </span>
        )}
      </div>
    </div>
  );
}

export default StyledToggle;
