import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const DISMISSED_KEY = 'presora_trial_banner_dismissed';

/* Keep in sync with PLAN_LIMITS in Profile.tsx */
const FREE_MONTHLY_LIMIT = 10;
const GUEST_FREE_ANALYSES = 3;

type State =
  | { kind: 'loading' }
  | { kind: 'guest' }
  | { kind: 'free'; remaining: number }
  | { kind: 'paid' };

export const TrialBanner = () => {
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setState({ kind: 'guest' });
        setVisible(true);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', session.user.id)
        .single();

      const userPlan = profile?.plan ?? 'free';
      if (userPlan !== 'free') {
        setState({ kind: 'paid' });
        return;
      }

      /* Count analyses used this calendar month for the remaining counter */
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('analyses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .gte('created_at', startOfMonth.toISOString());

      const used = count ?? 0;
      setState({ kind: 'free', remaining: Math.max(FREE_MONTHLY_LIMIT - used, 0) });
      setVisible(true);
    });
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  const renderMessage = () => {
    switch (state.kind) {
      case 'guest':
        return (
          <>
            Testujesz Presora — masz <strong>{GUEST_FREE_ANALYSES} darmowe analizy</strong> bez rejestracji.{' '}
            <Link
              to="/register"
              className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              Załóż konto i odbierz {FREE_MONTHLY_LIMIT}/miesiąc <ArrowRight className="w-3 h-3" />
            </Link>
          </>
        );
      case 'free':
        return (
          <>
            Plan <strong>Free</strong> — zostało Ci{' '}
            <strong>{state.remaining} z {FREE_MONTHLY_LIMIT}</strong> analiz w tym miesiącu.{' '}
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              Zwiększ limit <ArrowRight className="w-3 h-3" />
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  if (state.kind === 'loading' || state.kind === 'paid') return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-primary/90 via-primary to-violet-600 text-primary-foreground text-sm">
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-center">
              <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span className="leading-snug">{renderMessage()}</span>
              <button
                onClick={dismiss}
                aria-label="Zamknij"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
