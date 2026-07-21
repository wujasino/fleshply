import { useId } from 'react';
import { cn } from '@/lib/utils';

/** The Presora monogram — a single flowing stroke, no layered shapes. */
const Mark = ({ className }: { className?: string }) => {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#8B79F6" />
          <stop offset="100%" stopColor="#D6CCFF" />
        </linearGradient>
      </defs>
      <path
        d="M92 206 C86 166 85 122 87 88 C89 54 108 34 138 34 C166 34 184 52 184 78 C184 104 164 120 136 118 C122 117 110 112 100 104"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={24}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

interface WordmarkProps {
  className?: string;
  /** Render only the monogram, no "presora" text — used in collapsed nav states. */
  iconOnly?: boolean;
}

/**
 * Brand lockup used across the app in place of an image logo.
 * Size/alignment is controlled by the caller via `className`.
 */
export const Wordmark = ({ className, iconOnly }: WordmarkProps) => {
  if (iconOnly) {
    return <Mark className={cn('h-6 w-6 shrink-0', className)} />;
  }
  return (
    <span className={cn('inline-flex items-center gap-2 font-display font-semibold tracking-tight text-foreground lowercase', className)}>
      <Mark className="h-[1em] w-[1em] shrink-0" />
      presora
    </span>
  );
};

export default Wordmark;
