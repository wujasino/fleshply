import { useId } from 'react';

interface FleshplyMarkProps {
  /** Rendered size in px (width = height). Defaults to 24. */
  size?: number;
  className?: string;
}

/**
 * Scalable "fleshply" logo mark — a rounded square with the F monogram knocked
 * out. Single-colour: the square uses `currentColor`, so it inherits the
 * surrounding text colour and adapts to light/dark automatically. The knockout
 * lets whatever is behind it show through the bars.
 *
 * Usage: <FleshplyMark className="text-foreground" size={28} />
 */
export const FleshplyMark = ({ size = 24, className }: FleshplyMarkProps) => {
  const maskId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="fleshply"
    >
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
        <rect width="120" height="120" rx="28" fill="white" />
        <rect x="32" y="30" width="56" height="12" rx="6" fill="black" />
        <rect x="32" y="54" width="38" height="12" rx="6" fill="black" />
        <rect x="32" y="78" width="12" height="12" rx="6" fill="black" />
      </mask>
      <rect width="120" height="120" rx="28" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
};

export default FleshplyMark;
