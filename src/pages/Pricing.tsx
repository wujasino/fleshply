import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle } from 'lucide-react';
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

/* USD prices */
const USD = {
  solo_monthly: '$29',
  solo_yearly: '$279',
  growth_monthly: '$79',
  growth_yearly: '$749',
  credits_20: '$9',
  credits_50: '$19',
  credits_120: '$39',
};

const PLN = {
  solo_monthly: '99 zł',
  solo_yearly: '950 zł',
  growth_monthly: '249 zł',
  growth_yearly: '2 350 zł',
  credits_20: '39 zł',
  credits_50: '79 zł',
  credits_120: '169 zł',
};

const SOCIAL_PROOF_BRANDS = ['Shopify Plus', 'Brainly', 'Booksy', 'inPost', 'Tidio', 'Packhelp'];

const Pricing = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [loadingCredits, setLoadingCredits] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currency, setCurrency] = useState<'pln' | 'usd'>('usd');
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const prices = currency === 'pln' ? PLN : USD;
  const period_month = '/mo';
  const period_year  = '/yr';

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success'))  setMessage('Payment successful! Your plan has been activated.');
    if (params.get('canceled')) setMessage('Payment was cancelled.');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const confirmDowngrade = () => {
    setShowDowngradeDialog(false);
    window.location.href = '/dashboard';
  };

  const handlePlanSelect = async (planId: string) => {
    if (planId === 'free') {
      if (isLoggedIn) { setShowDowngradeDialog(true); return; }
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/register?plan=' + planId; return; }

      const priceId = planId === 'solo'
        ? import.meta.env.VITE_STRIPE_SOLO_PRICE_ID
        : import.meta.env.VITE_STRIPE_GROWTH_PRICE_ID;

      if (!priceId) { setMessage('Stripe is not configured. Please contact support.'); return; }

      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        let err = `HTTP ${response.status}`;
        try { const d = await response.json(); err = d.error || err; } catch {}
        console.error('Checkout error:', err);
        setMessage(`Error: ${err}`);
        return;
      }

      const data = await response.json();
      if (!data?.url) { setMessage(data?.error || 'Could not create payment session.'); return; }
      window.location.href = data.url;
    } catch {
      setMessage('Connection error. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const creditPacks = [
    { id: 'credits_20',  label: '20 extra analyses',  price: prices.credits_20,  analyses: 20,  popular: false },
    { id: 'credits_50',  label: '50 extra analyses',  price: prices.credits_50,  analyses: 50,  popular: true  },
    { id: 'credits_120', label: '120 extra analyses', price: prices.credits_120, analyses: 120, popular: false },
  ];

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
      if (!baseUrl) { setMessage('Stripe link not configured for this credit pack.'); return; }

      const url = new URL(baseUrl);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        url.searchParams.set('client_reference_id', user.id);
        if (user.email) url.searchParams.set('prefilled_email', user.email);
      }
      window.location.href = url.toString();
    } catch {
      setMessage('Connection error. Please try again.');
    } finally {
      setLoadingCredits(null);
    }
  };

  const plans: PricingTierCard[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Start with three free brand analyses, no credit card required.',
      priceMonthly: 'Free',
      priceYearly: 'Free',
      periodMonthly: '',
      periodYearly: '',
      isPopular: false,
      buttonLabel: 'Start for free',
      features: [
        { name: '3 free brand analyses', isIncluded: true },
        { name: 'Overall AI Visibility Score', isIncluded: true },
        { name: 'Perception radar (5 dimensions)', isIncluded: true },
        { name: 'AI Verdict — actionable summary', isIncluded: true },
        { name: 'Sentiment trend (30 days)', isIncluded: false },
        { name: 'Brand knowledge context (RAG)', isIncluded: false },
        { name: 'Competitor comparison', isIncluded: false },
      ],
    },
    {
      id: 'solo',
      name: 'Solo',
      description: 'For indie founders and solo marketers tracking their brand.',
      priceMonthly: prices.solo_monthly,
      priceYearly: prices.solo_yearly,
      periodMonthly: period_month,
      periodYearly: period_year,
      isPopular: false,
      buttonLabel: 'Get started',
      features: [
        { name: '10 brand analyses per month', isIncluded: true },
        { name: '3 LLM sources (GPT-4o, Claude, Gemini)', isIncluded: true },
        { name: 'Sentiment trend (30 days)', isIncluded: true },
        { name: 'Source breakdown chart', isIncluded: true },
        { name: 'Brand knowledge context (RAG)', isIncluded: true },
        { name: 'CSV export', isIncluded: true },
        { name: 'Competitor comparison', isIncluded: false },
      ],
    },
    {
      id: 'growth',
      name: 'Growth',
      description: 'For growing teams who need deeper competitive insights.',
      priceMonthly: prices.growth_monthly,
      priceYearly: prices.growth_yearly,
      periodMonthly: period_month,
      periodYearly: period_year,
      isPopular: true,
      buttonLabel: 'Get started',
      features: [
        { name: '50 brand analyses per month', isIncluded: true },
        { name: 'All 6 LLM sources + Perplexity', isIncluded: true },
        { name: 'Full source table with confidence', isIncluded: true },
        { name: 'Competitor comparison', isIncluded: true },
        { name: '1-year history & weekly digest', isIncluded: true },
        { name: 'API access', isIncluded: true },
        { name: 'Priority email support', isIncluded: true },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise Suite',
      description: 'For enterprises requiring full AI visibility control.',
      priceMonthly: 'Custom pricing',
      priceYearly: 'Custom pricing',
      periodMonthly: '',
      periodYearly: '',
      isPopular: false,
      buttonLabel: 'Contact Sales',
      features: [
        { name: 'Unlimited analyses', isIncluded: true },
        { name: 'Custom LLM sources + private models', isIncluded: true },
        { name: 'Real-time monitoring & alerts', isIncluded: true },
        { name: 'Unlimited history + webhooks', isIncluded: true },
        { name: 'Slack & Teams integration', isIncluded: true },
        { name: 'Dedicated account manager', isIncluded: true },
        { name: 'White-label dashboard', isIncluded: true },
        { name: 'SLA guarantee (99.9%)', isIncluded: true },
      ],
    },
  ];

  const faqItems = [
    { q: 'Can I cancel anytime?',             a: 'Yes — cancel at any time and keep access until the end of your billing period.' },
    { q: 'What happens if I exceed my limit?', a: 'If you hit your plan limit, you can upgrade instantly or purchase additional analysis credits.' },
    { q: 'Can I change plans later?',          a: 'Absolutely — switch plans anytime without losing your existing data.' },
    { q: 'Will I receive a VAT invoice?',      a: 'Yes — all payments go through Stripe, which automatically generates VAT-compliant invoices sent to your email. For EU companies, enter your VAT number in the Stripe checkout to receive a B2B invoice.' },
    { q: 'How do you handle my company data?', a: 'Any brand context you upload stays in your private workspace. We never train AI models on your data, never share it with third parties beyond the AI providers needed to run each analysis, and we are fully GDPR compliant.' },
    { q: 'Can I change plans mid-billing cycle?', a: 'Yes — upgrade takes effect immediately and is prorated. Downgrading applies at the end of the current billing period so you always get what you paid for.' },
    { q: 'Need help choosing a plan?',         a: 'Our team is available by email to recommend the best option for your brand.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Downgrade dialog */}
      <Dialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <DialogTitle>Switch to Free plan</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to switch to the Free plan?
              <ul className="mt-3 space-y-1.5 text-sm">
                {[
                  'You will lose access to advanced LLM sources (Claude, Gemini and more)',
                  'Your limit will drop to 3 analyses per month',
                  'Analysis history and CSV export will be disabled',
                ].map(bullet => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">*</span> {bullet}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground/70">Your subscription will be cancelled via Stripe — access continues until the end of the current billing period.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowDowngradeDialog(false)}>
              Stay on current plan
            </Button>
            <Button variant="destructive" className="flex-1" onClick={confirmDowngrade}>
              Yes, switch to Free
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="pb-20 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-10 pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-display text-foreground mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Start free, scale as your brand monitoring needs grow. No hidden fees.
          </p>
          {message && (
            <p className="mt-4 text-sm text-primary font-medium">{message}</p>
          )}

          {/* Currency toggle */}
          <div className="flex items-center justify-center mt-6 gap-1 p-1 rounded-lg border border-[hsl(var(--glass-border))] bg-muted/40 w-fit mx-auto">
            {(['pln', 'usd'] as const).map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currency === c
                    ? 'bg-background text-foreground shadow-sm border border-input'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {c === 'pln' ? '🇵🇱 PLN' : '🇺🇸 USD'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Pricing cards */}
        <PricingCards
          plans={plans}
          billingCycle={billingCycle}
          onCycleChange={setBillingCycle}
          onPlanSelect={(planId) => handlePlanSelect(planId)}
          loadingPlan={loading}
        />

        {/* Credit packs */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-display text-foreground">Need more analyses?</h2>
            </div>
            <p className="text-sm text-muted-foreground">Top up your account with one-time credit packs — no plan change required.</p>
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
                    Best value
                  </span>
                )}
                <div>
                  <p className="text-3xl font-display text-foreground">{pack.price}</p>
                  <p className="text-sm text-muted-foreground mt-1">{pack.label}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-2">One-time credit top-up</p>
                </div>
                <Button
                  onClick={() => handleCreditsBuy(pack.id)}
                  disabled={loadingCredits === pack.id}
                  variant={pack.popular ? 'default' : 'outline'}
                  className="w-full"
                >
                  {loadingCredits === pack.id ? 'Loading...' : 'Buy pack'}
                </Button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Social proof + FAQ */}
        <div className="mt-16 space-y-10">
          <div className="rounded-3xl border border-slate-900/10 bg-slate-950/60 p-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-primary mb-3">
              Trusted by
            </p>
            <h2 className="text-2xl font-display text-foreground max-w-2xl mx-auto">
              Join 200+ brands already monitoring AI visibility.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto">
              Trusted brand teams use BitBrew to stay ahead of AI-driven reputation and search shifts.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6">
              {SOCIAL_PROOF_BRANDS.map((name) => (
                <span key={name} className="text-sm font-medium text-muted-foreground/40 select-none">
                  {name}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {faqItems.map((item) => (
                <div
                  key={item.q}
                  className="rounded-3xl border border-[hsl(var(--glass-border))] bg-background/80 p-6"
                >
                  <h3 className="text-sm font-semibold text-foreground">{item.q}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
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
