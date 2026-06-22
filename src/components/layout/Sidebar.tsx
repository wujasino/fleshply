import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home, CreditCard, Sparkles, Code2, Zap, Users } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface NavItemProps {
  to: string;
  icon: React.FC<{ className?: string }>;
  label: string;
  badge?: string;
  active: boolean;
  collapsed: boolean;
}

const NavItem = ({ to, icon: Icon, label, badge, active, collapsed }: NavItemProps) => (
  <Link
    to={to}
    title={collapsed ? label : undefined}
    className={cn(
      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
      collapsed ? 'justify-center px-2' : '',
      active
        ? 'bg-accent text-foreground font-medium'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
    )}
  >
    <Icon className="w-4 h-4 shrink-0" />
    {!collapsed && <span className="flex-1">{label}</span>}
    {!collapsed && badge && (
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
        {badge}
      </span>
    )}
  </Link>
);

const SectionLabel = ({ label, collapsed }: { label: string; collapsed: boolean }) =>
  collapsed ? <div className="h-px bg-border mx-2 my-1" /> : (
    <p className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">{label}</p>
  );

export const Sidebar = ({ collapsed = false }: { collapsed?: boolean }) => {
  const { pathname } = useLocation();
  const [plan, setPlan] = useState('Free');
  const { theme } = useTheme();
  const logoSrc = theme === 'dark' ? '/bitbrew-logo-cream.svg' : '/landing-page-logo.png';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase.from('profiles').select('plan').eq('id', session.user.id).single().then(({ data }) => {
        if (data?.plan) setPlan(data.plan.charAt(0).toUpperCase() + data.plan.slice(1));
      });
    });
  }, []);

  return (
    <aside className={cn(
      'fixed left-0 top-0 bottom-0 flex flex-col bg-background border-r border-border z-40 transition-all duration-200',
      collapsed ? 'w-14' : 'w-60'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center p-4 pb-4', collapsed ? 'justify-center' : 'justify-start')}>
        {!collapsed ? (
          <Link to="/dashboard">
            <img src={logoSrc} alt="BitBrew" className="h-6 w-auto" />
          </Link>
        ) : (
          <Link to="/dashboard" className="w-2 h-2 rounded-full bg-primary" aria-label="BitBrew" />
        )}
      </div>

      <div className="h-px bg-border mx-3" />

      {/* Plan badge */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border">
            <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
            <span className="text-xs font-medium text-foreground flex-1">BitBrew</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">{plan}</span>
          </div>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-2 pt-2 space-y-0.5">
        <NavItem to="/dashboard" icon={Home} label="Home" active={pathname === '/dashboard'} collapsed={collapsed} />

        <SectionLabel label="Tools" collapsed={collapsed} />

        <NavItem to="/dashboard" icon={Sparkles} label="AI Analysis" active={pathname === '/dashboard'} collapsed={collapsed} />
        <NavItem to="/pricing" icon={CreditCard} label="Pricing" active={pathname === '/pricing'} collapsed={collapsed} />
      </nav>

      {/* Bottom */}
      <div className={cn('p-3 border-t border-border space-y-1', collapsed && 'flex flex-col items-center')}>
        {/* Developers link */}
        <NavItem to="/developers" icon={Code2} label="Developers" badge="Dev" active={pathname === '/developers'} collapsed={collapsed} />

        {/* Invite card — hidden when collapsed */}
        {!collapsed && (
          <div className="p-3 rounded-xl bg-muted border border-border mb-2">
            <div className="flex items-center gap-2 mb-0.5">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">Invite friends</span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">Share BitBrew with your team</p>
            <Link
              to="/pricing"
              className="block w-full text-center text-xs py-1.5 px-3 rounded-lg bg-background border border-border text-muted-foreground hover:bg-accent transition-colors"
            >
              Send invite
            </Link>
          </div>
        )}

        {/* Upgrade CTA */}
        {plan === 'Free' && (
          <Link
            to="/pricing"
            title={collapsed ? 'Upgrade plan' : undefined}
            className={cn(
              'flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors',
              collapsed && 'w-8 h-8 p-0 rounded-lg'
            )}
          >
            <Zap className="w-4 h-4 shrink-0" />
            {!collapsed && 'Upgrade plan'}
          </Link>
        )}
      </div>
    </aside>
  );
};
