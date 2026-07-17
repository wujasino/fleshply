import { cn } from '@/lib/utils';

interface MarqueeProps {
  items: string[];
  reverse?: boolean;
  /** seconds for one full loop */
  duration?: number;
  className?: string;
}

/**
 * Infinite horizontal marquee. Two identical tracks scroll seamlessly;
 * pauses on hover and stops entirely under prefers-reduced-motion.
 * Fades at both edges via a mask.
 */
export const Marquee = ({ items, reverse = false, duration = 40, className }: MarqueeProps) => {
  const Track = ({ ariaHidden }: { ariaHidden?: boolean }) => (
    <div
      className="flex shrink-0 items-center gap-3 pr-3 animate-marquee group-hover:[animation-play-state:paused]"
      data-reverse={reverse}
      style={{ ['--marquee-duration' as string]: `${duration}s` }}
      aria-hidden={ariaHidden}
    >
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className="whitespace-nowrap rounded-full border border-[hsl(var(--glass-border))] bg-card/50 px-4 py-2 text-sm text-muted-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        'group relative flex overflow-hidden',
        '[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
        className
      )}
    >
      <Track />
      <Track ariaHidden />
    </div>
  );
};

export default Marquee;
