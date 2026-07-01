import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home, CreditCard, Sparkles, Code2, Zap, Users } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItemProps {
  to: string;
  icon: React.FC<{ className?: string }>;
  label: string;
  badge?: string;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}

const NavItem = ({ to, icon: Icon, label, badge, active, collapsed, onNavigate }: NavItemProps) => (
  <Link
    to={to}
    onClick={onNavigate}
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

interface SidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar = ({ collapsed = false, mobileOpen = false, onMobileClose }: SidebarProps) => {
  const { pathname } = useLocation();
  const [plan, setPlan] = useState('Free');
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const logoSrc = theme === 'dark' ? '/bitbrew-logo-cream.svg' : '/landing-page-logo.png';

  // On mobile the sidebar is a full drawer — never render icon-only mode
  const effectiveCollapsed = isMobile ? false : collapsed;
  const handleNavigate = isMobile ? onMobileClose : undefined;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase.from('profiles').select('plan').eq('id', session.user.id).single().then(({ data }) => {
        if (data?.plan) setPlan(data.plan.charAt(0).toUpperCase() + data.plan.slice(1));
      });
    });
  }, []);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside className={cn(
        'fixed left-0 top-0 bottom-0 flex flex-col bg-background border-r border-border z-50 transition-all duration-200',
        'w-64',
        collapsed ? 'md:w-14' : 'md:w-60',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0'
      )}>
        {/* Logo */}
        <div className={cn('flex items-center p-4 pb-4', effectiveCollapsed ? 'justify-center' : 'justify-start')}>
          {!effectiveCollapsed ? (
            <Link to="/dashboard" onClick={handleNavigate}>
              <img src={logoSrc} alt="BitBrew" className="h-6 w-auto" />
            </Link>
          ) : (
            <Link to="/dashboard" className="w-2 h-2 rounded-full bg-primary" aria-label="BitBrew" />
          )}
        </div>

        <div className="h-px bg-border mx-3" />

        {/* Plan badge */}
        {!effectiveCollapsed && (
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
          <NavItem to="/dashboard" icon={Home} label="Home" active={pathname === '/dashboard'} collapsed={effectiveCollapsed} onNavigate={handleNavigate} />

          <SectionLabel label="Tools" collapsed={effectiveCollapsed} />

          <NavItem to="/dashboard" icon={Sparkles} label="AI Analysis" active={pathname === '/dashboard'} collapsed={effectiveCollapsed} onNavigate={handleNavigate} />
          <NavItem to="/pricing" icon={CreditCard} label="Pricing" active={pathname === '/pricing'} collapsed={effectiveCollapsed} onNavigate={handleNavigate} />
        </nav>

        {/* Bottom */}
        <div className={cn('p-3 border-t border-border space-y-1', effectiveCollapsed && 'flex flex-col items-center')}>
          {/* Developers link */}
          <NavItem to="/developers" icon={Code2} label="Developers" badge="Dev" active={pathname === '/developers'} collapsed={effectiveCollapsed} onNavigate={handleNavigate} />

          {/* Invite card — hidden when collapsed */}
          {!effectiveCollapsed && (
            <div className="p-3 rounded-xl bg-muted border border-border mb-2">
              <div className="flex items-center gap-2 mb-0.5">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Invite friends</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">Share BitBrew with your team</p>
              <Link
                to="/pricing"
                onClick={handleNavigate}
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
              onClick={handleNavigate}
              title={effectiveCollapsed ? 'Upgrade plan' : undefined}
              className={cn(
                'flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors',
                effectiveCollapsed && 'w-8 h-8 p-0 rounded-lg'
              )}
            >
              <Zap className="w-4 h-4 shrink-0" />
              {!effectiveCollapsed && 'Upgrade plan'}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};
