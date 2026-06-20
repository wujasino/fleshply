import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, LayoutDashboard, CreditCard, Sparkles, BookOpen, Code2,
  Settings, Users, Zap, LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { logout } from '@/lib/auth';
import { cn } from '@/lib/utils';

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  solo: 'Solo',
  growth: 'Growth',
  enterprise: 'Enterprise Suite',
};

interface NavItemProps {
  to: string;
  icon: React.FC<{ className?: string }>;
  label: string;
  badge?: string;
  active: boolean;
}

const NavItem = ({ to, icon: Icon, label, badge, active }: NavItemProps) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
      active
        ? 'bg-gray-100 text-gray-900 font-medium'
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    )}
  >
    <Icon className="w-4 h-4 shrink-0" />
    <span className="flex-1">{label}</span>
    {badge && (
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
        {badge}
      </span>
    )}
  </Link>
);

export const Sidebar = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [plan, setPlan] = useState('Free');

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const user = session.user;
      setUserEmail(user.email ?? null);
      setUserName(user.user_metadata?.full_name ?? null);
      setUserAvatar(user.user_metadata?.avatar_url ?? null);

      try {
        const { data } = await supabase
          .from('profiles')
          .select('plan, full_name, avatar_url')
          .eq('id', user.id)
          .single();
        if (data?.plan) setPlan(PLAN_LABELS[data.plan] ?? 'Free');
        if (data?.full_name) setUserName(data.full_name);
        if (data?.avatar_url) setUserAvatar(data.avatar_url);
      } catch {
        // profiles table might not have these columns — fall back to defaults
      }
    };

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) return;
      const user = session.user;
      setUserEmail(user.email ?? null);
      setUserName(user.user_metadata?.full_name ?? null);
      setUserAvatar(user.user_metadata?.avatar_url ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const initials = userName
    ? userName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : userEmail
    ? userEmail[0].toUpperCase()
    : '?';

  const tabParam = new URLSearchParams(search).get('tab');
  const isKnowledgeTab = pathname === '/dashboard' && tabParam === 'knowledge';

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col bg-white border-r border-gray-100 z-40">
      {/* Logo */}
      <div className="px-4 py-5">
        <Link to="/" className="flex items-center">
          <img src="/bitbrew-logo-cream.svg" alt="BitBrew" className="h-7 w-auto" />
        </Link>
      </div>

      {/* Plan badge */}
      <div className="px-4 pb-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
          {plan}
        </span>
      </div>

      {/* Main nav */}
      <nav className="px-3 space-y-0.5">
        <NavItem to="/" icon={Home} label="Home" active={pathname === '/'} />
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={pathname === '/dashboard' && !isKnowledgeTab} />
        <NavItem to="/pricing" icon={CreditCard} label="Cennik" active={pathname === '/pricing'} />
      </nav>

      {/* Tools section */}
      <div className="px-3 mt-4 space-y-0.5">
        <p className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">
          Narzędzia
        </p>
        <NavItem
          to="/dashboard"
          icon={Sparkles}
          label="Analiza AI"
          active={pathname === '/dashboard' && !isKnowledgeTab}
        />
        <NavItem
          to="/dashboard?tab=knowledge"
          icon={BookOpen}
          label="Baza wiedzy"
          active={isKnowledgeTab}
        />
        <NavItem to="/developers" icon={Code2} label="API / Developers" active={pathname === '/developers'} />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom area */}
      <div className="p-3 border-t border-gray-100">
        {/* Invite card */}
        <div className="mb-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-medium text-gray-700">Zaproś znajomych</span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">Podziel się BitBrew ze swoim zespołem</p>
          <button className="w-full text-xs py-1.5 px-3 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            Wyślij zaproszenie
          </button>
        </div>

        {/* Settings link */}
        <NavItem to="/settings" icon={Settings} label="Ustawienia" active={pathname === '/settings'} />

        {/* Avatar row */}
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
          <Avatar className="h-7 w-7">
            <AvatarImage src={userAvatar ?? undefined} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{userName || userEmail}</p>
            <p className="text-[10px] text-gray-400 truncate">{plan}</p>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Upgrade CTA — only if free plan */}
        {plan === 'Free' && (
          <Link
            to="/pricing"
            className="mt-2 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Zap className="w-4 h-4" />
            Ulepsz plan
          </Link>
        )}
      </div>
    </aside>
  );
};
