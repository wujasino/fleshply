import { cn } from '@/lib/utils';

interface WordmarkProps {
  className?: string;
  /** Render only the "p", no rest of "resora" — used in collapsed nav states. */
  iconOnly?: boolean;
}

/**
 * Text-only brand lockup — no mark/icon for now.
 * Size/alignment is controlled by the caller via `className`.
 */
export const Wordmark = ({ className, iconOnly }: WordmarkProps) => (
  <span className={cn('font-wordmark font-bold tracking-tight text-foreground lowercase', className)}>
    {iconOnly ? 'p' : 'presora'}
  </span>
);

export default Wordmark;
