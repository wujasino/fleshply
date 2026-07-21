import { cn } from '@/lib/utils';

/** The Presora app icon — lavender "p" on an ink tile, the real uploaded mark. */
const Mark = ({ className }: { className?: string }) => (
  <img
    src="/presora-icon-512.png"
    alt=""
    aria-hidden="true"
    className={cn('rounded-[22%] shrink-0 object-contain', className)}
  />
);

interface WordmarkProps {
  className?: string;
  /** Render only the mark, no "presora" text — used in collapsed nav states. */
  iconOnly?: boolean;
}

/**
 * Brand lockup used across the app in place of a text-only logo.
 * Size/alignment is controlled by the caller via `className`.
 */
export const Wordmark = ({ className, iconOnly }: WordmarkProps) => {
  if (iconOnly) {
    return <Mark className={cn('h-6 w-6', className)} />;
  }
  return (
    <span className={cn('inline-flex items-center gap-2 font-wordmark font-bold tracking-tight text-foreground lowercase', className)}>
      <Mark className="h-[1.2em] w-[1.2em]" />
      presora
    </span>
  );
};

export default Wordmark;
