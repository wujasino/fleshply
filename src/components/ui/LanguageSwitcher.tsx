import { Languages, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './dropdown-menu';
import { useLocale } from '../../lib/locale';
import { cn } from '@/lib/utils';

type LocaleOption = {
  value: 'en' | 'pl' | 'de' | 'fr' | 'es' | 'it';
  label: string;
  native: string;
  flag: string;
};

const OPTIONS: LocaleOption[] = [
  { value: 'en', label: 'English',  native: 'English',  flag: '🇬🇧' },
  { value: 'pl', label: 'Polish',   native: 'Polski',   flag: '🇵🇱' },
  { value: 'de', label: 'German',   native: 'Deutsch',  flag: '🇩🇪' },
  { value: 'fr', label: 'French',   native: 'Français', flag: '🇫🇷' },
  { value: 'es', label: 'Spanish',  native: 'Español',  flag: '🇪🇸' },
  { value: 'it', label: 'Italian',  native: 'Italiano', flag: '🇮🇹' },
];

export const LanguageSwitcher = () => {
  const { locale, setLocale } = useLocale();
  const active = OPTIONS.find(o => o.value === locale) ?? OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Change language"
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
        >
          <Languages className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline text-xs font-medium uppercase tracking-wider font-data">
            {active.value}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        sideOffset={8}
        align="end"
        className="min-w-[12rem] p-1.5 rounded-xl"
      >
        <p className="px-2 py-1.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium">
          Język
        </p>
        {OPTIONS.map(opt => {
          const isActive = locale === opt.value;
          return (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => setLocale(opt.value)}
              className={cn(
                'flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors',
                isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'
              )}
            >
              <span className="text-base leading-none">{opt.flag}</span>
              <span className="flex-1">
                <span className="font-medium">{opt.native}</span>
                <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground font-data">
                  {opt.value}
                </span>
              </span>
              {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
