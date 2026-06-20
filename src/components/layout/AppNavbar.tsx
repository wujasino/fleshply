import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Sparkles, CreditCard, Code2, Settings, Users, Zap, LogOut, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logout } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/dashboard',  icon: Sparkles,   label: 'Analiza AI' },
  { to: '/pricing',    icon: CreditCard,  label: 'Cennik' },
  { to: '/developers', icon: Code2,       label: 'API', badge: 'Dev' },
  { to: '/settings',   icon: Settings,    label: 'Ustawienia' },
  { to: '/profile',    icon: Users,       label: 'Profil' },
];

export const AppNavbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-gray-100 bg-white/90 backdrop-blur px-6">
      {/* Nav links */}
      <nav className="flex items-center gap-1 flex-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, badge }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
              pathname === to
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {badge && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                {badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {plan === 'Free' && (
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            Ulepsz plan
          </Link>
        )}

        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {userEmail && (
          <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
            <Avatar className="h-7 w-7">
              <AvatarImage src={userAvatar ?? undefined} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate max-w-[120px]">{userName || userEmail}</p>
              <p className="text-[10px] text-gray-400">{plan}</p>
            </div>
            <button
              onClick={async () => { await logout(); navigate('/'); }}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
              aria-label="Wyloguj"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
