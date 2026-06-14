import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle, CreditCard, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PricingCards, type PricingTierCard } from '@/components/ui/pricing-cards';
import { useTranslation } from '@/lib/locale';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const USD = {
  solo_monthly: '$29',  solo_yearly: '$279',
  growth_monthly: '$79', growth_yearly: '$749',
  credits_20: '$9', credits_50: '$19', credits_120: '$39',
};
const PLN = {
  solo_monthly: '99 zł',  solo_yearly: '950 zł',
  growth_monthly: '249 zł', growth_yearly: '2 350 zł',
  credits_20: '39 zł', credits_50: '79 zł', credits_120: '169 zł',
};

interface Props {
  open: boolean;
  onClose: () => void;
  currentPlan?: string;
}

export function PricingModal({ open, onClose, currentPlan = 'free' }: Props) {
  const { t, locale } = useTranslation();
  const [tab, setTab] = useState<'plans' | 'credits'>('plans');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currency, setCurrency] = useState<'pln' | 'usd'>(locale === 'pl' ? 'pln' : 'usd');
  const [loading, setLoading] = useState<string | null>(null);
  const [loadingCredits, setLoadingCredits] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showDowngrade, setShowDowngrade] = useState(false);

  useEffect(() => { setCurrency(locale === 'pl' ? 'pln' : 'usd'); }, [locale]);
  useEffect(() => { if (!open) setMessage(''); }, [open]);

  const prices = currency === 'pln' ? PLN : USD;
  const period_month = currency === 'pln' ? t('tier_period_month') : '/mo';
  const period_year  = currency === 'pln' ? t('tier_period_year')  : '/yr';

  const handlePlanSelect = async (planId: string) => {
    if (planId === currentPlan) return;
    if (planId === 'free') { setShowDowngrade(true); return; }
    if (planId === 'enterprise') {
      window.location.href = 'mailto:kontakt@bitbrew.pl?subject=Enterprise Plan';
      return;
    }
    setLoading(planId);
    setMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/register?plan=' + planId; return; }
      const priceId = planId === 'solo'
        ? import.meta.env.VITE_STRIPE_SOLO_PRICE_ID
        : import.meta.env.VITE_STRIPE_GROWTH_PRICE_ID;
      if (!priceId) { setMessage(t('pricing_error_stripe_config')); return; }
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ priceId }),
      });
      if (!res.ok) { setMessage(t('pricing_error_payment')); return; }
      const data = await res.json();
      if (!data?.url) { setMessage(data?.error || t('pricing_error_session')); return; }
      window.location.href = data.url;
    } catch { setMessage(t('pricing_error_connection')); }
    finally { setLoading(null); }
  };

  const handleCreditsBuy = async (packId: string) => {
    setLoadingCredits(packId);
    setMessage('');
    try {
      const linkMap: Record<string, string> = {
        credits_20:  import.meta.env.VITE_STRIPE_CREDITS_20  ?? '',
        credits_50:  import.meta.env.VITE_STRIPE_CREDITS_50  ?? '',
        credits_120: import.meta.env.VITE_STRIPE_CREDITS_120 ?? '',
      };
      const baseUrl = linkMap[packId];
      if (!baseUrl) { setMessage(t('pricing_error_credits_config')); return; }
      const url = new URL(baseUrl);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        url.searchParams.set('client_reference_id', user.id);
        if (user.email) url.searchParams.set('prefilled_email', user.email);
      }
      window.location.href = url.toString();
    } catch { setMessage(t('pricing_error_connection')); }
    finally { setLoadingCredits(null); }
  };

  const creditPacks = [
    { id: 'credits_20',  label: t('credits_pack_20'),  price: prices.credits_20,  analyses: 20,  popular: false },
    { id: 'credits_50',  label: t('credits_pack_50'),  price: prices.credits_50,  analyses: 50,  popular: true  },
    { id: 'credits_120', label: t('credits_pack_120'), price: prices.credits_120, analyses: 120, popular: false },
  ];

  const plans: PricingTierCard[] = [
    {
      id: 'free', name: 'Free', description: t('tier_free_desc'),
      priceMonthly: 'Free', priceYearly: 'Free', periodMonthly: '', periodYearly: '',
      isPopular: false, buttonLabel: currentPlan === 'free' ? t('plan_label') + ' ✓' : t('start_for_free'),
      features: [
        { name: t('tier_free_feat_1'), isIncluded: true },
        { name: t('tier_free_feat_2'), isIncluded: true },
        { name: t('tier_free_feat_3'), isIncluded: true },
        { name: t('tier_free_feat_4'), isIncluded: true },
        { name: t('tier_solo_feat_3'), isIncluded: false },
        { name: t('tier_solo_feat_5'), isIncluded: false },
        { name: t('tier_growth_feat_4'), isIncluded: false },
      ],
    },
    {
      id: 'solo', name: 'Solo', description: t('tier_solo_desc'),
      priceMonthly: prices.solo_monthly, priceYearly: prices.solo_yearly,
      periodMonthly: period_month, periodYearly: period_year,
      isPopular: false, buttonLabel: currentPlan === 'solo' ? 'Aktualny plan ✓' : t('get_started'),
      features: [
        { name: t('tier_solo_feat_1'), isIncluded: true },
        { name: t('tier_solo_feat_2'), isIncluded: true },
        { name: t('tier_solo_feat_3'), isIncluded: true },
        { name: t('tier_solo_feat_4'), isIncluded: true },
        { name: t('tier_solo_feat_5'), isIncluded: true },
        { name: t('tier_solo_feat_6'), isIncluded: true },
        { name: t('tier_growth_feat_4'), isIncluded: false },
      ],
    },
    {
      id: 'growth', name: 'Growth', description: t('tier_growth_desc'),
      priceMonthly: prices.growth_monthly, priceYearly: prices.growth_yearly,
      periodMonthly: period_month, periodYearly: period_year,
      isPopular: true, buttonLabel: currentPlan === 'growth' ? 'Aktualny plan ✓' : t('get_started'),
      features: [
        { name: t('tier_growth_feat_1'), isIncluded: true },
        { name: t('tier_growth_feat_2'), isIncluded: true },
        { name: t('tier_growth_feat_3'), isIncluded: true },
        { name: t('tier_growth_feat_4'), isIncluded: true },
        { name: t('tier_growth_feat_5'), isIncluded: true },
        { name: t('tier_growth_feat_6'), isIncluded: true },
        { name: t('tier_growth_feat_7'), isIncluded: true },
      ],
    },
    {
      id: 'enterprise', name: 'Enterprise Suite', description: t('tier_ent_desc'),
      priceMonthly: t('tier_ent_price'), priceYearly: t('tier_ent_price'),
      periodMonthly: '', periodYearly: '',
      isPopular: false, buttonLabel: t('contact_sales'),
      features: [
        { name: t('tier_ent_feat_1'), isIncluded: true },
        { name: t('tier_ent_feat_2'), isIncluded: true },
        { name: t('tier_ent_feat_3'), isIncluded: true },
        { name: t('tier_ent_feat_4'), isIncluded: true },
        { name: t('tier_ent_feat_5'), isIncluded: true },
        { name: t('tier_ent_feat_6'), isIncluded: true },
        { name: t('tier_ent_feat_7'), isIncluded: true },
        { name: t('tier_ent_feat_8'), isIncluded: true },
      ],
    },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-[hsl(var(--glass-border))] px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-semibold">{t('nav_pricing')}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('plan_label')}: <span className="text-primary font-medium capitalize">{currentPlan}</span>
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
              <button
                onClick={() => setTab('plans')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  tab === 'plans' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Plany
              </button>
              <button
                onClick={() => setTab('credits')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  tab === 'credits' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <CreditCard className="w-3.5 h-3.5" /> Kredyty
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            {message && (
              <div className="mb-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
                {message}
              </div>
            )}

            {tab === 'plans' && (
              <motion.div key="plans" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                {/* Billing toggle + currency */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-1">
                    {(['monthly', 'yearly'] as const).map(c => (
                      <button key={c} onClick={() => setBillingCycle(c)}
                        className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                          billingCycle === c ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        )}>
                        {c === 'monthly' ? t('billing_monthly') : t('billing_yearly')}
                        {c === 'yearly' && <span className="ml-1.5 text-[10px] font-semibold text-emerald-400 uppercase">-20%</span>}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
                    {(['pln', 'usd'] as const).map(c => (
                      <button key={c} onClick={() => setCurrency(c)}
                        className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-colors',
                          currency === c ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        )}>
                        {c === 'pln' ? '🇵🇱 PLN' : '🇺🇸 USD'}
                      </button>
                    ))}
                  </div>
                </div>

                <PricingCards
                  tiers={plans}
                  billingCycle={billingCycle}
                  onSelectPlan={handlePlanSelect}
                  loadingPlanId={loading}
                />
              </motion.div>
            )}

            {tab === 'credits' && (
              <motion.div key="credits" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center justify-end mb-6">
                  <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
                    {(['pln', 'usd'] as const).map(c => (
                      <button key={c} onClick={() => setCurrency(c)}
                        className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-colors',
                          currency === c ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        )}>
                        {c === 'pln' ? '🇵🇱 PLN' : '🇺🇸 USD'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {creditPacks.map(pack => (
                    <div key={pack.id}
                      className={cn(
                        'glass-card p-6 flex flex-col gap-4 relative',
                        pack.popular && 'ring-2 ring-primary/50'
                      )}>
                      {pack.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                          {t('most_popular')}
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">{pack.label}</span>
                      </div>
                      <div>
                        <span className="text-3xl font-display font-bold text-foreground">{pack.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {pack.analyses} {t('credits_analyses_label') || 'analiz'}
                      </p>
                      <Button
                        className="w-full mt-auto"
                        variant={pack.popular ? 'default' : 'outline'}
                        onClick={() => handleCreditsBuy(pack.id)}
                        disabled={!!loadingCredits}
                      >
                        {loadingCredits === pack.id ? t('loading') || '...' : t('credits_buy')}
                      </Button>
                    </div>
                  ))}
                </div>

                <p className="text-center text-xs text-muted-foreground/60 mt-6">
                  {t('credits_note') || 'Kredyty nie wygasają. Jednorazowa płatność, bez subskrypcji.'}
                </p>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Downgrade confirmation */}
      <Dialog open={showDowngrade} onOpenChange={setShowDowngrade}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <DialogTitle>{t('pricing_downgrade_title')}</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {t('pricing_downgrade_desc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowDowngrade(false)}>
              {t('pricing_downgrade_stay')}
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => { setShowDowngrade(false); onClose(); window.location.href = '/dashboard'; }}>
              {t('pricing_downgrade_confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
