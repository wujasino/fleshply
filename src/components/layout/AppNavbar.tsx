import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Zap, LogOut, Sun, Moon, Settings, User, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';
import { logout } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch-theme';
import AvatarNotifications from '@/components/ui/avatar-notifications';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export const AppNavbar = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [plan, setPlan] = useState('Free');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      setUserEmail(session.user.email ?? null);
      setUserName(session.user.user_metadata?.full_name ?? null);
      setUserAvatar(session.user.user_metadata?.avatar_url ?? null);
      supabase.from('profiles').select('plan').eq('id', session.user.id).single().then(({ data }) => {
        if (data?.plan) setPlan(data.plan.charAt(0).toUpperCase() + data.plan.slice(1));
      });
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

      <LanguageSwitcher />

      <Switch
        value={isDark}
        onToggle={() => setTheme(isDark ? 'light' : 'dark')}
        iconOn={<Moon className="w-3.5 h-3.5 text-foreground" />}
        iconOff={<Sun className="w-3.5 h-3.5 text-amber-500" />}
      />

      <AvatarNotifications />

      {userEmail && (
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 pl-2 border-l border-border hover:opacity-80 transition-opacity">
              <Avatar className="h-7 w-7">
                <AvatarImage src={userAvatar ?? undefined} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block min-w-0 text-left">
                <p className="text-xs font-medium text-foreground truncate max-w-[120px]">{userName || userEmail}</p>
                <p className="text-[10px] text-muted-foreground">{plan}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 p-1">
            <div className="px-2 py-1.5 mb-1 border-b border-border">
              <p className="text-xs font-semibold text-foreground truncate">{userName || userEmail}</p>
              <p className="text-[10px] text-muted-foreground">{plan}</p>
            </div>
            <Link
              to="/profile"
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-foreground hover:bg-accent transition-colors"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              Profil
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-foreground hover:bg-accent transition-colors"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              Ustawienia
            </Link>
            <div className="border-t border-border mt-1 pt-1">
              <button
                onClick={async () => { await logout(); navigate('/'); }}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Wyloguj
              </button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </header>
  );
};
