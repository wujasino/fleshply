import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle, Clock, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PricingCards, type PricingTierCard } from '@/components/ui/pricing-cards';
import { CreditsUsageWidget } from '@/components/CreditsUsageWidget';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
  starter_monthly: '$12',
  starter_yearly: '$119',
  solo_monthly: '$29',
  solo_yearly: '$279',
  growth_monthly: '$79',
  growth_yearly: '$749',
  credits_20: '$9',
  credits_50: '$19',
  credits_120: '$39',
};

const EUR = {
  starter_monthly: '€11',
  starter_yearly: '€109',
  solo_monthly: '€27',
  solo_yearly: '€259',
  growth_monthly: '€75',
  growth_yearly: '€695',
  credits_20: '€8',
  credits_50: '€18',
  credits_120: '€36',
};

const PLN = {
  starter_monthly: '49 zł',
  starter_yearly: '470 zł',
  solo_monthly: '99 zł',
  solo_yearly: '950 zł',
  growth_monthly: '249 zł',
  growth_yearly: '2 350 zł',
  credits_20: '39 zł',
  credits_50: '79 zł',
  credits_120: '169 zł',
};

const Pricing = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [loadingCredits, setLoadingCredits] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currency, setCurrency] = useState<'pln' | 'usd' | 'eur'>('usd');
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const prices = currency === 'pln' ? PLN : currency === 'eur' ? EUR : USD;
  const period_month = '/mo';
  const period_year  = '/yr';

  // Auto-detect currency from browser locale (manual toggle still overrides)
  useEffect(() => {
    const lang = (navigator.language || '').toLowerCase();
    const eurozone = ['de', 'fr', 'es', 'it', 'nl', 'pt', 'fi', 'ie', 'at', 'be', 'gr', 'sk', 'si', 'lv', 'lt', 'ee', 'lu', 'mt', 'cy', 'hr'];
    if (lang.startsWith('pl')) setCurrency('pln');
    else if (eurozone.some(code => lang.startsWith(code))) setCurrency('eur');
    else setCurrency('usd');
  }, []);

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
      window.location.href = 'mailto:kontakt@bitbrew.pl?subject=Custom Plan';
      return;
    }

    setLoading(planId);
    setMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/register?plan=' + planId; return; }

      const priceMap: Record<string, string | undefined> = {
        starter: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
        solo: import.meta.env.VITE_STRIPE_SOLO_PRICE_ID,
        growth: import.meta.env.VITE_STRIPE_GROWTH_PRICE_ID,
      };
      const priceId = priceMap[planId];

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
      id: 'starter',
      name: 'Starter',
      description: 'For creators taking their first steps into AI visibility.',
      priceMonthly: prices.starter_monthly,
      priceYearly: prices.starter_yearly,
      periodMonthly: period_month,
      periodYearly: period_year,
      isPopular: false,
      buttonLabel: 'Get started',
      features: [
        { name: '5 brand analyses per month', isIncluded: true },
        { name: '3 LLM sources (GPT-4o, Claude, Gemini)', isIncluded: true },
        { name: 'Sentiment trend (30 days)', isIncluded: true },
        { name: 'AI Verdict — actionable summary', isIncluded: true },
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
      name: 'Business',
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
      name: 'Custom',
      description: 'A tailored plan for teams that need full AI visibility control.',
      priceMonthly: "Let's talk",
      priceYearly: "Let's talk",
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
    { q: 'Will I receive a VAT invoice?',      a: 'Yes — every payment automatically generates a VAT-compliant invoice sent to your email. For EU companies, enter your VAT number at checkout to receive a B2B invoice.' },
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
              <p className="mt-3 text-xs text-muted-foreground/70">Your subscription will be cancelled — access continues until the end of the current billing period.</p>
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

      <div className="pb-20 px-4 max-w-7xl mx-auto">
        {message && (
          <p className="mt-6 mb-2 text-center text-sm text-primary font-medium">{message}</p>
        )}

        {/* Control bar — left: currency + billing-cycle toggles, right: usage + billing */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-8 pb-8">
          {/* Left: toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Currency */}
            <div className="flex items-center gap-1 p-1 rounded-lg border border-[hsl(var(--glass-border))] bg-muted/40">
              {(['pln', 'usd', 'eur'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    currency === c
                      ? 'bg-background text-foreground shadow-sm border border-input'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {c === 'pln' ? '🇵🇱 PLN' : c === 'usd' ? '🇺🇸 USD' : '🇪🇺 EUR'}
                </button>
              ))}
            </div>

            {/* Billing cycle */}
            <div className="flex items-center gap-1 p-1 rounded-lg border border-[hsl(var(--glass-border))] bg-muted/40">
              {(['monthly', 'yearly'] as const).map(cycle => (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className={`relative px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === cycle
                      ? 'bg-background text-foreground shadow-sm border border-input'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cycle === 'monthly' ? 'Monthly' : 'Yearly'}
                  {cycle === 'yearly' && (
                    <span className="ml-1.5 text-[10px] font-semibold text-primary">−20%</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right: credit usage + billing */}
          <CreditsUsageWidget />
        </div>

        {/* Pricing cards */}
        <PricingCards
          plans={plans}
          billingCycle={billingCycle}
          onCycleChange={setBillingCycle}
          onPlanSelect={(planId) => handlePlanSelect(planId)}
          loadingPlan={loading}
          showBillingToggle={false}
        />

        {/* How long this takes everyone else vs Perceply */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-display text-foreground">What this takes everyone else</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Understanding how AI models describe your brand the old way costs days or weeks. Perceply does it while you wait.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { method: 'Manual prompting by hand', time: '2–3 days', note: 'Querying each model, one prompt at a time, then tallying the answers yourself.' },
              { method: 'A marketing agency audit', time: '2–4 weeks', note: 'Briefing, research and a slide deck — plus a four-figure invoice.' },
              { method: 'Traditional monitoring tools', time: 'Hours of setup', note: 'They watch social and search — not what AI assistants actually say.' },
            ].map(item => (
              <div key={item.method} className="rounded-2xl border border-[hsl(var(--glass-border))] bg-background/70 p-5">
                <p className="text-2xl font-display text-foreground">{item.time}</p>
                <p className="text-sm font-medium text-foreground mt-2">{item.method}</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{item.note}</p>
              </div>
            ))}
            {/* Perceply — the payoff */}
            <div className="rounded-2xl border border-primary/30 bg-primary/[0.06] p-5 flex flex-col">
              <p className="text-2xl font-display text-primary">~15 seconds</p>
              <p className="text-sm font-semibold text-foreground mt-2">Perceply</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">All models queried in parallel, scored and turned into a ranked action plan — automatically.</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary">
                <Check className="w-3.5 h-3.5" /> Repeatable every month
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ — collapsible */}
        <motion.div
          className="mt-20 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-display text-foreground text-center mb-8">
            Frequently asked questions
          </h2>
          <Accordion
            type="single"
            collapsible
            className="rounded-2xl border border-[hsl(var(--glass-border))] bg-card/40 divide-y divide-[hsl(var(--glass-border))] overflow-hidden"
          >
            {faqItems.map((item, idx) => (
              <AccordionItem key={item.q} value={`faq-${idx}`} className="border-none px-5">
                <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

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

        {/* Social proof */}
        <div className="mt-16">
          <div className="rounded-3xl border border-[hsl(var(--glass-border))] bg-card/60 p-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-primary mb-3">
              Built for the AI era
            </p>
            <h2 className="text-2xl font-display text-foreground max-w-2xl mx-auto">
              Stay ahead of AI-driven reputation and search shifts.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-left">
              {[
                { title: 'GEO-first approach', desc: 'Built around Generative Engine Optimization — the emerging standard for AI-era brand visibility.' },
                { title: '3 leading AI models', desc: 'Coverage across ChatGPT, Claude and Gemini — the assistants your customers ask for recommendations.' },
                { title: 'Track over time', desc: 'Repeatable monthly audits show whether your optimization work actually moves the needle.' },
              ].map(item => (
                <div key={item.title} className="rounded-2xl border border-[hsl(var(--glass-border))] bg-background/60 p-5">
                  <p className="text-sm font-semibold text-foreground mb-1.5">{item.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
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
