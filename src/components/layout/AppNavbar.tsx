import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Zap, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';
import { logout } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch-theme';
import AvatarNotifications from '@/components/ui/avatar-notifications';
import { Link } from 'react-router-dom';

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

      <Switch
        value={isDark}
        onToggle={() => setTheme(isDark ? 'light' : 'dark')}
        iconOn={<Moon className="w-3.5 h-3.5 text-foreground" />}
        iconOff={<Sun className="w-3.5 h-3.5 text-amber-500" />}
      />

      <AvatarNotifications />

      {userEmail && (
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <Avatar className="h-7 w-7">
            <AvatarImage src={userAvatar ?? undefined} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block min-w-0">
            <p className="text-xs font-medium text-foreground truncate max-w-[120px]">{userName || userEmail}</p>
            <p className="text-[10px] text-muted-foreground">{plan}</p>
          </div>
          <button
            onClick={async () => { await logout(); navigate('/'); }}
            className="text-muted-foreground hover:text-foreground transition-colors ml-1"
            aria-label="Wyloguj"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
};
