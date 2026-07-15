import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
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
 * Account status shown on the pricing control bar: a credit-usage meter and the
 * current plan with a billing shortcut. Renders nothing for signed-out visitors.
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
  const pct = unlimited ? 100 : Math.min(100, Math.round((used / limit) * 100));
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
      {/* Credit usage meter */}
      <div className="flex-1 sm:min-w-[260px] rounded-xl border border-[hsl(var(--glass-border))] bg-card/60 px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-sm text-muted-foreground">Wykorzystane kredyty</span>
          <span className="text-sm font-medium text-foreground font-data whitespace-nowrap">
            {used} / {unlimited ? '∞' : limit} kredytów
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-[width]', pct >= 90 ? 'bg-red-500' : 'bg-primary')}
            style={{ width: `${unlimited ? 100 : pct}%` }}
          />
        </div>
      </div>

      {/* Current plan + billing shortcut */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--glass-border))] bg-card/60 px-4 py-3 sm:min-w-[260px]">
        <span className="text-sm text-foreground">
          Twój obecny plan: <span className="font-semibold">{planLabel}</span>
        </span>
        <Link
          to="/settings?tab=billing"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--glass-border))] bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors shrink-0"
        >
          <Settings className="w-3.5 h-3.5 text-muted-foreground" /> Rozliczenia
        </Link>
      </div>
    </div>
  );
};

export default CreditsUsageWidget;
