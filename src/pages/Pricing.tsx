import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { useTranslation } from '@/lib/locale';
import { supabase } from '@/lib/supabase';
import { PricingCards, type PricingTierCard } from '@/components/ui/pricing-cards';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const Pricing = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<string | null>(null);
  const [loadingCredits, setLoadingCredits] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) setMessage('Płatność zakończona sukcesem! Twój plan został aktywowany.');
    if (params.get('canceled')) setMessage('Płatność została anulowana.');
  }, []);

  const confirmDowngrade = () => {
    setShowDowngradeDialog(false);
    window.location.href = '/dashboard';
  };

  const handlePlanSelect = async (planId: string) => {
    if (planId === 'free') {
      // If already logged in → show confirmation dialog before downgrading
      if (isLoggedIn) {
        setShowDowngradeDialog(true);
        return;
      }
      window.location.href = '/register';
      return;
    }

    if (planId === 'enterprise') {
      window.location.href = 'mailto:kontakt@bitbrew.pl?subject=Enterprise Plan';
      return;
    }

    setLoading(planId);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }

      const priceId = planId === 'solo'
        ? import.meta.env.VITE_STRIPE_SOLO_PRICE_ID
        : import.meta.env.VITE_STRIPE_GROWTH_PRICE_ID;

      if (!priceId) {
        setMessage('Brak konfiguracji Stripe Price ID. Skontaktuj się z administratorem.');
        return;
      }

      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.id, userEmail: user.email }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try { const d = await response.json(); errorMessage = d.error || errorMessage; } catch {}
        setMessage('Nie udało się rozpocząć płatności. Spróbuj ponownie później.');
        return;
      }

      const data = await response.json();
      if (!data?.url) { setMessage(data?.error || 'Nie udało się utworzyć sesji płatności.'); return; }
      window.location.href = data.url;
    } catch {
      setMessage('Wystąpił błąd połączenia. Spróbuj ponownie.');
    } finally {
      setLoading(null);
    }
  };

  const creditPacks = [
    { id: 'credits_20',  label: t('credits_pack_20'),  price: '39 zł',  analyses: 20,  popular: false },
    { id: 'credits_50',  label: t('credits_pack_50'),  price: '79 zł',  analyses: 50,  popular: true  },
    { id: 'credits_120', label: t('credits_pack_120'), price: '169 zł', analyses: 120, popular: false },
  ];

  const handleCreditsBuy = async (packId: string) => {
    setLoadingCredits(packId);
    setMessage('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }

      const linkMap: Record<string, string> = {
        credits_20:  import.meta.env.VITE_STRIPE_CREDITS_20  ?? '',
        credits_50:  import.meta.env.VITE_STRIPE_CREDITS_50  ?? '',
        credits_120: import.meta.env.VITE_STRIPE_CREDITS_120 ?? '',
      };
      const baseUrl = linkMap[packId];

      if (!baseUrl) {
        setMessage('Brak konfiguracji linku Stripe dla kredytów. Skontaktuj się z administratorem.');
        return;
      }

      // Append client_reference_id (user.id) so the Stripe webhook can credit the right account,
      // prefill the email, and route Stripe's success page back to /pricing?success=1.
      const url = new URL(baseUrl);
      url.searchParams.set('client_reference_id', user.id);
      if (user.email) url.searchParams.set('prefilled_email', user.email);

      window.location.href = url.toString();
    } catch {
      setMessage('Wystąpił błąd połączenia. Spróbuj ponownie.');
    } finally {
      setLoadingCredits(null);
    }
  };

  const plans: PricingTierCard[] = [
    {
      id: 'free',
      name: 'Free',
      description: t('tier_free_desc'),
      priceMonthly: 'Free',
      priceYearly: 'Free',
      periodMonthly: '',
      periodYearly: '',
      isPopular: false,
      buttonLabel: t('start_for_free'),
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
      id: 'solo',
      name: 'Solo Brew',
      description: t('tier_solo_desc'),
      priceMonthly: '99 zł',
      priceYearly: '950 zł',
      periodMonthly: t('tier_period_month'),
      periodYearly: t('tier_period_year'),
      isPopular: false,
      buttonLabel: t('get_started'),
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
      id: 'growth',
      name: 'Growth',
      description: t('tier_growth_desc'),
      priceMonthly: '249 zł',
      priceYearly: '2 350 zł',
      periodMonthly: t('tier_period_month'),
      periodYearly: t('tier_period_year'),
      isPopular: true,
      buttonLabel: t('get_started'),
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
      id: 'enterprise',
      name: 'Enterprise Suite',
      description: t('tier_ent_desc'),
      priceMonthly: t('tier_ent_price'),
      priceYearly: t('tier_ent_price'),
      periodMonthly: '',
      periodYearly: '',
      isPopular: false,
      buttonLabel: t('contact_sales'),
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
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Downgrade confirmation dialog */}
      <Dialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <DialogTitle>Zmiana planu na Free</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Czy na pewno chcesz przejść na plan <strong className="text-foreground">Free</strong>?
              <ul className="mt-3 space-y-1.5 text-sm">
                <li className="flex items-start gap-2"><span className="text-yellow-500 mt-0.5">•</span> Stracisz dostęp do zaawansowanych źródeł LLM (Claude, Gemini i inne)</li>
                <li className="flex items-start gap-2"><span className="text-yellow-500 mt-0.5">•</span> Limit zmniejszy się do 3 analiz miesięcznie</li>
                <li className="flex items-start gap-2"><span className="text-yellow-500 mt-0.5">•</span> Historia analiz i eksport CSV zostaną wyłączone</li>
              </ul>
              <p className="mt-3 text-xs text-muted-foreground/70">Subskrypcja zostanie anulowana przez Stripe — dostęp na wyższym planie trwa do końca opłaconego okresu.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowDowngradeDialog(false)}>
              Zostań na obecnym planie
            </Button>
            <Button variant="destructive" className="flex-1" onClick={confirmDowngrade}>
              Tak, przejdź na Free
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-display text-foreground mb-3">
            {t('pricing_title')}
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            {t('pricing_subtitle')}
          </p>
          {message && (
            <p className="mt-4 text-sm text-primary font-medium">{message}</p>
          )}
        </motion.div>

        {/* New pricing cards with toggle + comparison table */}
        <PricingCards
          plans={plans}
          billingCycle={billingCycle}
          onCycleChange={setBillingCycle}
          onPlanSelect={(planId) => handlePlanSelect(planId)}
          loadingPlan={loading}
        />

        {/* Credit packs add-on */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-display text-foreground">{t('credits_addon_title')}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{t('credits_addon_subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {creditPacks.map((pack) => (
              <div
                key={pack.id}
                className={`relative rounded-xl border p-6 flex flex-col gap-4 transition-all ${
                  pack.popular
                    ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                    : 'border-[hsl(var(--glass-border))] bg-background/80'
                }`}
              >
                {pack.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 bg-primary text-primary-foreground rounded-full whitespace-nowrap">
                    {t('credits_best_value')}
                  </span>
                )}
                <div>
                  <p className="text-3xl font-display text-foreground">{pack.price}</p>
                  <p className="text-sm text-muted-foreground mt-1">{pack.label}</p>
                </div>
                <Button
                  onClick={() => handleCreditsBuy(pack.id)}
                  disabled={loadingCredits === pack.id}
                  variant={pack.popular ? 'default' : 'outline'}
                  className="w-full"
                >
                  {loadingCredits === pack.id ? 'Ładowanie...' : t('credits_buy')}
                </Button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Social proof + FAQ */}
        <div className="mt-16 space-y-10">
          <div className="rounded-3xl border border-slate-900/10 bg-slate-950/60 p-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-primary mb-3">
              {t('pricing_social_proof_heading')}
            </p>
            <h2 className="text-2xl font-display text-foreground max-w-2xl mx-auto">
              {t('pricing_social_proof')}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto">
              {t('pricing_social_proof_subtitle')}
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">
              {t('pricing_faq_heading')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { question: t('pricing_faq_q_cancel'), answer: t('pricing_faq_a_cancel') },
                { question: t('pricing_faq_q_overage'), answer: t('pricing_faq_a_overage') },
                { question: t('pricing_faq_q_switch'), answer: t('pricing_faq_a_switch') },
                { question: t('pricing_faq_q_support'), answer: t('pricing_faq_a_support') },
              ].map((item) => (
                <div
                  key={item.question}
                  className="rounded-3xl border border-[hsl(var(--glass-border))] bg-background/80 p-6"
                >
                  <h3 className="text-sm font-semibold text-foreground">{item.question}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
