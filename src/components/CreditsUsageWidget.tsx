import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// Keep in sync with PLAN_LIMITS used across the app.
const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  starter: 5,
  solo: 30,
  growth: 120,
  enterprise: 9999,
};

/**
 * Compact account cluster shown on the pricing control bar: current plan's
 * credit usage this month plus a shortcut to the billing settings. Renders
 * nothing for signed-out visitors (there is no usage to show).
 */
export const CreditsUsageWidget = () => {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [plan, setPlan] = useState('free');
  const [used, setUsed] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setReady(true); return; }
      setLoggedIn(true);
      const uid = session.user.id;

      supabase.from('profiles').select('plan').eq('id', uid).single().then(({ data }) => {
        if (data?.plan) setPlan(String(data.plan).toLowerCase());
      });

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      supabase
        .from('analyses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid)
        .gte('created_at', startOfMonth.toISOString())
        .then(({ count }) => { setUsed(count ?? 0); setReady(true); });
    });
  }, []);

  if (!ready || !loggedIn) return null;

  const limit = PLAN_LIMITS[plan] ?? 3;
  const unlimited = limit >= 9999;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <div className="flex items-stretch gap-2">
      {/* Credit usage */}
      <div className="rounded-xl border border-[hsl(var(--glass-border))] bg-card/60 px-3.5 py-2 min-w-[190px]">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Zap className="w-3.5 h-3.5 text-primary" /> {planLabel}
          </span>
          <span className="text-[11px] font-data text-muted-foreground">
            {used}/{unlimited ? '∞' : limit}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn('h-full rounded-full', pct >= 90 ? 'bg-red-500' : 'bg-primary')}
            style={{ width: `${unlimited ? 100 : pct}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">Analiz w tym miesiącu</p>
      </div>

      {/* Billing shortcut */}
      <Link
        to="/settings?tab=billing"
        className="inline-flex items-center gap-1.5 rounded-xl border border-[hsl(var(--glass-border))] bg-card/60 px-3.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
      >
        <CreditCard className="w-4 h-4 text-muted-foreground" /> Rozliczenia
      </Link>
    </div>
  );
};

export default CreditsUsageWidget;
