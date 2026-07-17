import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LogOut, Settings, User, Code2, CreditCard, MessageSquare, Send, X, Bot, PanelLeftClose, PanelLeftOpen, Menu, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logout } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AvatarNotifications from '@/components/ui/avatar-notifications';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const PLAN_LIMITS: Record<string, number> = {
  Free: 3,
  Starter: 5,
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

const SECTION_TITLES: Record<string, string> = {
  '/dashboard':  'Home',
  '/brand-visibility': 'Brand Scan',
  '/automations': 'Automations',
  '/pricing':    'Pricing',
  '/reports':    'Raporty',
  '/profile':    'Profile',
  '/settings':   'Settings',
  '/developers': 'Developers',
};

interface AppNavbarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onMobileToggle?: () => void;
  chatOpen?: boolean;
  onChatToggle?: () => void;
}

export const AppNavbar = ({ collapsed = false, onToggle, onMobileToggle, chatOpen = false, onChatToggle }: AppNavbarProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const sectionTitle = SECTION_TITLES[pathname] ?? 'Perceply';
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

  // Feedback state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleFeedbackSend = () => {
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => { setFeedbackSent(false); setFeedbackText(''); setFeedbackOpen(false); }, 1500);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-1 sm:gap-2 border-b border-border bg-background/90 backdrop-blur px-2 sm:px-6">
      {/* Mobile hamburger — opens sidebar drawer */}
      <button
        onClick={onMobileToggle}
        className="flex md:hidden items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Collapse/expand toggle — desktop only */}
      <button
        onClick={onToggle}
        className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
      </button>
      <span className="text-sm font-semibold text-foreground truncate min-w-0">{sectionTitle}</span>

      <div className="flex-1" />

      {plan === 'Free' && (
        <Link
          to="/pricing"
          title="Upgrade plan"
          className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border border-primary/30 text-primary text-xs font-medium hover:bg-primary/10 transition-colors shrink-0"
        >
          <Crown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upgrade</span>
        </Link>
      )}

      {/* Feedback */}
      <Popover open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <PopoverTrigger asChild>
          <button
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
            aria-label="Feedback"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[calc(100vw-1.5rem)] max-w-72 p-4">
          <p className="text-sm font-semibold text-foreground mb-1">Send feedback</p>
          <p className="text-xs text-muted-foreground mb-3">Tell us what you think or report an issue.</p>
          {feedbackSent ? (
            <p className="text-sm text-primary font-medium text-center py-2">Thanks for your feedback!</p>
          ) : (
            <>
              <textarea
                className="w-full rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-primary mb-2"
                rows={4}
                placeholder="Your feedback..."
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
              />
              <button
                onClick={handleFeedbackSend}
                disabled={!feedbackText.trim()}
                className="flex items-center gap-1.5 w-full justify-center py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </>
          )}
        </PopoverContent>
      </Popover>

      {/* AI Chat toggle */}
      <button
        onClick={onChatToggle}
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg transition-colors shrink-0',
          chatOpen ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        )}
        aria-label="AI Chat"
      >
        <Bot className="w-4 h-4" />
      </button>

      <div className="shrink-0">
        <AvatarNotifications />
      </div>

      {userEmail && (
        <TooltipProvider delayDuration={400}>
          <Tooltip>
            <Popover open={open} onOpenChange={setOpen}>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 pl-2 border-l border-border hover:opacity-80 transition-opacity">
                    <Avatar className="h-7 w-7 cursor-pointer">
                      <AvatarImage src={userAvatar ?? undefined} />
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p className="font-medium">{plan} — credits this month</p>
                <p className="text-muted-foreground">{analysesUsed} / {limit} used ({usedPct}%)</p>
              </TooltipContent>

          <PopoverContent align="end" className="w-[calc(100vw-1.5rem)] max-w-64 p-0 overflow-hidden">
            {/* Balance */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Credits</span>
                <Link
                  to="/pricing"
                  onClick={() => setOpen(false)}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Upgrade
                </Link>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Total</span>
                <span className="font-medium text-foreground">{limit} analyses</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Remaining</span>
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
              <DropdownLink to="/profile"    icon={User}       label="Profile"       onClick={() => setOpen(false)} />
              <DropdownLink to="/settings"   icon={Settings}   label="Settings"   onClick={() => setOpen(false)} />
              <DropdownLink to="/pricing"    icon={CreditCard} label="Subscription"  onClick={() => setOpen(false)} />
              <DropdownLink to="/developers" icon={Code2}      label="Developers"   onClick={() => setOpen(false)} />
            </div>

            {/* Sign out */}
            <div className="p-2">
              <button
                onClick={async () => { setOpen(false); await logout(); navigate('/'); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </PopoverContent>
            </Popover>
          </Tooltip>
        </TooltipProvider>
      )}
    </header>
  );
};
