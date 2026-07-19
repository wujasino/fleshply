import { useState } from 'react';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandScanInputProps {
  onSubmit: (brand: string) => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
}

/**
 * Landing-page brand scanner input. A focused, theme-aware brand field (works in
 * light and dark) that matches the site — no chat affordances (file upload,
 * voice) that don't belong on a "type your brand" hero.
 */
export const BrandScanInput = ({
  onSubmit,
  placeholder = 'yourbrand.com',
  suggestions = [],
  className,
}: BrandScanInputProps) => {
  const [value, setValue] = useState('');

  const submit = (brand: string) => {
    const v = brand.trim();
    if (v) onSubmit(v);
  };

  return (
    <div className={cn('w-full', className)}>
      <form
        onSubmit={(e) => { e.preventDefault(); submit(value); }}
        className="group flex items-center gap-2 rounded-2xl border border-[hsl(var(--glass-border))] bg-card/70 backdrop-blur-xl p-2 shadow-lg shadow-primary/5 focus-within:border-primary/50 transition-colors"
      >
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            aria-label="Brand name to scan"
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-base rounded-xl py-3 pl-10 pr-2 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!value.trim()}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-40"
        >
          <Sparkles className="w-4 h-4" />
          <span>Scan</span>
          <ArrowRight className="w-4 h-4 hidden sm:inline" />
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60">Try</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => submit(s)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--glass-border))] bg-card/60 text-sm text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-primary" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandScanInput;
