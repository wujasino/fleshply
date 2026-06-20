import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home, BarChart2, CreditCard, Sparkles, BookOpen, Code2, Settings, LogOut, Users, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logout } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const NavItem = ({
  to, icon: Icon, label, badge, active,
}: { to: string; icon: React.FC<{ className?: string }>; label: string; badge?: string; active: boolean }) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
      active ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    )}
  >
    <Icon className="w-4 h-4 shrink-0" />
    <span className="flex-1">{label}</span>
    {badge && (
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
        {badge}
      </span>
    )}
  </Link>
);

const SectionLabel = ({ label }: { label: string }) => (
  <p className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-widest text-gray-400 font-semibold">{label}</p>
);

export const Sidebar = () => {
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

      supabase
        .from('profiles')
        .select('plan')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 flex flex-col bg-white border-r border-gray-100 z-40">
      {/* Logo */}
      <div className="p-4 pb-3">
        <Link to="/" className="flex items-center gap-2">
          <img src="/bitbrew-logo-ink.svg" alt="BitBrew" className="h-6 w-auto" />
        </Link>
      </div>

      {/* Plan badge */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs font-medium text-gray-700 flex-1">BitBrew</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">{plan}</span>
        </div>
      </div>

      <div className="h-px bg-gray-100 mx-4" />

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-2 pt-2 space-y-0.5">
        <NavItem to="/" icon={Home} label="Strona główna" active={pathname === '/'} />

        <div className="h-px bg-gray-100 my-1" />
        <SectionLabel label="Narzędzia" />

        <NavItem to="/dashboard"  icon={Sparkles}   label="Analiza AI"       active={pathname === '/dashboard'} />
        <NavItem to="/pricing"    icon={CreditCard}  label="Cennik"           active={pathname === '/pricing'} />
        <NavItem to="/developers" icon={Code2}       label="API / Developers" badge="Dev" active={pathname === '/developers'} />

        <div className="h-px bg-gray-100 my-1" />
        <SectionLabel label="Konto" />

        <NavItem to="/settings" icon={Settings} label="Ustawienia" active={pathname === '/settings'} />
        <NavItem to="/profile"  icon={Users}    label="Profil"     active={pathname === '/profile'} />
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        {/* Invite card */}
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 mb-2">
          <div className="flex items-center gap-2 mb-0.5">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-medium text-gray-700">Zaproś znajomych</span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">Podziel się BitBrew ze swoim zespołem</p>
          <Link
            to="/pricing"
            className="block w-full text-center text-xs py-1.5 px-3 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Wyślij zaproszenie
          </Link>
        </div>

        {/* Avatar row */}
        {userEmail && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={userAvatar ?? undefined} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{userName || userEmail}</p>
              <p className="text-[10px] text-gray-400 truncate">{plan}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Wyloguj">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Upgrade CTA */}
        {plan === 'Free' && (
          <Link
            to="/pricing"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Zap className="w-4 h-4" />
            Ulepsz plan
          </Link>
        )}
      </div>
    </aside>
  );
};
