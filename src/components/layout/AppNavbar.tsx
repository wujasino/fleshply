import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Zap, LogOut, Sun, Moon, Settings, User, Code2, CreditCard, ExternalLink } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';
import { logout } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch-theme';
import AvatarNotifications from '@/components/ui/avatar-notifications';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const PLAN_LIMITS: Record<string, number> = {
  Free: 3,
  Solo: 30,
  Growth: 120,
  Enterprise: 9999,
};

const DropdownLink = ({ to, icon: Icon, label, onClick }: { to: string; icon: React.FC<{ className?: string }>; label: string; onClick?: () => void }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-accent transition-colors"
  >
    <Icon className="w-4 h-4 text-muted-foreground" />
    {label}
  </Link>
);

export const AppNavbar = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [plan, setPlan] = useState('Free');
  const [analysesUsed, setAnalysesUsed] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      const uid = session.user.id;
      setUserEmail(session.user.email ?? null);
      setUserName(session.user.user_metadata?.full_name ?? null);
      setUserAvatar(session.user.user_metadata?.avatar_url ?? null);

      supabase.from('profiles').select('plan').eq('id', uid).single().then(({ data }) => {
        if (data?.plan) setPlan(data.plan.charAt(0).toUpperCase() + data.plan.slice(1));
      });

      // Count analyses this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      supabase
        .from('analyses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid)
        .gte('created_at', startOfMonth.toISOString())
        .then(({ count }) => setAnalysesUsed(count ?? 0));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user.email ?? null);
      setUserName(session?.user.user_metadata?.full_name ?? null);
      setUserAvatar(session?.user.user_metadata?.avatar_url ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const initials = userName
    ? userName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : userEmail ? userEmail[0].toUpperCase() : '?';

  const limit = PLAN_LIMITS[plan] ?? 3;
  const usedPct = Math.min(100, Math.round((analysesUsed / limit) * 100));
  const remaining = Math.max(0, limit - analysesUsed);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-2 border-b border-border bg-background/90 backdrop-blur px-6">
      {plan === 'Free' && (
        <Link
          to="/pricing"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          Ulepsz plan
        </Link>
      )}

      <Switch
        value={isDark}
        onToggle={() => setTheme(isDark ? 'light' : 'dark')}
        iconOn={<Moon className="w-3.5 h-3.5 text-foreground" />}
        iconOff={<Sun className="w-3.5 h-3.5 text-amber-500" />}
      />

      <AvatarNotifications />

      {userEmail && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <TooltipProvider delayDuration={400}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-2 pl-2 border-l border-border hover:opacity-80 transition-opacity">
                    <Avatar className="h-7 w-7 cursor-pointer">
                      <AvatarImage src={userAvatar ?? undefined} />
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p className="font-medium">{plan} — kredyty tego miesiąca</p>
                  <p className="text-muted-foreground">{analysesUsed} / {limit} użytych ({usedPct}%)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-64 p-0 overflow-hidden">
            {/* Balance */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kredyty</span>
                <Link
                  to="/pricing"
                  onClick={() => setOpen(false)}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Upgrade
                </Link>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Łącznie</span>
                <span className="font-medium text-foreground">{limit} analiz</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Pozostało</span>
                <span className={cn('font-medium', remaining <= 2 ? 'text-destructive' : 'text-foreground')}>{remaining}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', usedPct >= 80 ? 'bg-destructive' : 'bg-primary')}
                  style={{ width: `${usedPct}%` }}
                />
              </div>
            </div>

            {/* User info */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold text-foreground truncate">{userName || userEmail}</p>
              <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
              <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">{plan}</span>
            </div>

            {/* Nav links */}
            <div className="p-2 border-b border-border space-y-0.5">
              <DropdownLink to="/profile"    icon={User}       label="Profil"       onClick={() => setOpen(false)} />
              <DropdownLink to="/settings"   icon={Settings}   label="Ustawienia"   onClick={() => setOpen(false)} />
              <DropdownLink to="/pricing"    icon={CreditCard} label="Subskrypcja"  onClick={() => setOpen(false)} />
              <DropdownLink to="/developers" icon={Code2}      label="Developers"   onClick={() => setOpen(false)} />
            </div>

            {/* Sign out */}
            <div className="p-2">
              <button
                onClick={async () => { setOpen(false); await logout(); navigate('/'); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Wyloguj się
              </button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </header>
  );
};
