import { cn } from '@/lib/utils';

/**
 * Text wordmark used across the app in place of the image logo.
 * Size/alignment is controlled by the caller via `className`.
 */
export const Wordmark = ({ className }: { className?: string }) => (
  <span className={cn('font-display font-semibold tracking-tight text-foreground', className)}>
    Presora
  </span>
);

export default Wordmark;
