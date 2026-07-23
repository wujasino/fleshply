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

/* Ceny w USD */
const USD = {
  starter_monthly: '$39',
  starter_yearly: '$374',
  solo_monthly: '$59',
  solo_yearly: '$566',
  growth_monthly: '$89.99',
  growth_yearly: '$863.99',
  credits_20: '$29',
  credits_50: '$55',
  credits_120: '$99',
};

const Pricing = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [loadingCredits, setLoadingCredits] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [downgrading, setDowngrading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const prices = USD;
  const period_month = '/mies.';
  const period_year  = '/rok';

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success'))  setMessage('Płatność zakończona sukcesem! Twój plan został aktywowany.');
    if (params.get('canceled')) setMessage('Płatność została anulowana.');
  }, []);

  const confirmDowngrade = async () => {
    setDowngrading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/.netlify/functions/manage-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'cancel' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.error || 'Nie udało się anulować subskrypcji. Spróbuj ponownie.');
        return;
      }
      setShowDowngradeDialog(false);
      window.location.href = '/dashboard';
    } finally {
      setDowngrading(false);
    }
  };

  const handlePlanSelect = async (planId: string) => {
    if (planId === 'free') {
      if (isLoggedIn) { setShowDowngradeDialog(true); return; }
      window.location.href = '/register';
      return;
    }
    if (planId === 'enterprise') {
      window.location.href = 'mailto:kontakt@presora.app?subject=Custom Plan';
      return;
    }

    setLoading(planId);
    setMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/register?plan=' + planId; return; }

      const priceMap: Record<string, { monthly?: string; yearly?: string }> = {
        starter: {
          monthly: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
          yearly: import.meta.env.VITE_STRIPE_STARTER_YEARLY_PRICE_ID,
        },
        solo: {
          monthly: import.meta.env.VITE_STRIPE_SOLO_PRICE_ID,
          yearly: import.meta.env.VITE_STRIPE_SOLO_YEARLY_PRICE_ID,
        },
        growth: {
          monthly: import.meta.env.VITE_STRIPE_GROWTH_PRICE_ID,
          yearly: import.meta.env.VITE_STRIPE_GROWTH_YEARLY_PRICE_ID,
        },
      };
      const priceId = priceMap[planId]?.[billingCycle];

      if (!priceId) { setMessage('Stripe nie jest skonfigurowany. Skontaktuj się z pomocą.'); return; }

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
        try { const d = await response.json(); err = d.error || err; } catch { /* ignore */ }
        console.error('Checkout error:', err);
        setMessage(`Błąd: ${err}`);
        return;
      }

      const data = await response.json();
      if (!data?.url) { setMessage(data?.error || 'Nie udało się utworzyć sesji płatności.'); return; }
      window.location.href = data.url;
    } catch {
      setMessage('Błąd połączenia. Spróbuj ponownie.');
    } finally {
      setLoading(null);
    }
  };

  const creditPacks = [
    { id: 'credits_20',  label: '20 dodatkowych analiz',  price: prices.credits_20,  analyses: 20,  popular: false },
    { id: 'credits_50',  label: '50 dodatkowych analiz',  price: prices.credits_50,  analyses: 50,  popular: true  },
    { id: 'credits_120', label: '120 dodatkowych analiz', price: prices.credits_120, analyses: 120, popular: false },
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
      if (!baseUrl) { setMessage('Brak skonfigurowanego linku Stripe dla tego pakietu.'); return; }

      const url = new URL(baseUrl);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        url.searchParams.set('client_reference_id', user.id);
        if (user.email) url.searchParams.set('prefilled_email', user.email);
      }
      window.location.href = url.toString();
    } catch {
      setMessage('Błąd połączenia. Spróbuj ponownie.');
    } finally {
      setLoadingCredits(null);
    }
  };

  const plans: PricingTierCard[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Zacznij od trzech darmowych analiz marki — bez karty.',
      priceMonthly: 'Za darmo',
      priceYearly: 'Za darmo',
      periodMonthly: '',
      periodYearly: '',
      isPopular: false,
      buttonLabel: 'Zacznij za darmo',
      features: [
        { name: '3 darmowe analizy marki', isIncluded: true },
        { name: 'Ogólny wynik widoczności w AI', isIncluded: true },
        { name: 'Radar percepcji (5 wymiarów)', isIncluded: true },
        { name: 'Werdykt AI — praktyczne podsumowanie', isIncluded: true },
        { name: 'Trend sentymentu (30 dni)', isIncluded: false },
        { name: 'Kontekst wiedzy o marce (RAG)', isIncluded: false },
        { name: 'Porównanie z konkurencją', isIncluded: false },
      ],
    },
    {
      id: 'starter',
      name: 'Starter',
      description: 'Dla twórców stawiających pierwsze kroki w widoczności w AI.',
      priceMonthly: prices.starter_monthly,
      priceYearly: prices.starter_yearly,
      periodMonthly: period_month,
      periodYearly: period_year,
      isPopular: false,
      buttonLabel: 'Wybierz plan',
      features: [
        { name: '5 analiz marki miesięcznie', isIncluded: true },
        { name: '3 modele LLM (GPT-4o, Claude, Gemini)', isIncluded: true },
        { name: 'Trend sentymentu (30 dni)', isIncluded: true },
        { name: 'Werdykt AI — praktyczne podsumowanie', isIncluded: true },
        { name: 'Kontekst wiedzy o marce (RAG)', isIncluded: false },
        { name: 'Porównanie z konkurencją', isIncluded: false },
      ],
    },
    {
      id: 'solo',
      name: 'Solo',
      description: 'Dla niezależnych founderów i marketerów śledzących swoją markę.',
      priceMonthly: prices.solo_monthly,
      priceYearly: prices.solo_yearly,
      periodMonthly: period_month,
      periodYearly: period_year,
      isPopular: false,
      buttonLabel: 'Wybierz plan',
      features: [
        { name: '10 analiz marki miesięcznie', isIncluded: true },
        { name: '3 modele LLM (GPT-4o, Claude, Gemini)', isIncluded: true },
        { name: 'Trend sentymentu (30 dni)', isIncluded: true },
        { name: 'Wykres źródeł', isIncluded: true },
        { name: 'Kontekst wiedzy o marce (RAG)', isIncluded: true },
        { name: 'Eksport CSV', isIncluded: true },
        { name: 'Porównanie z konkurencją', isIncluded: false },
      ],
    },
    {
      id: 'growth',
      name: 'Business',
      description: 'Dla rosnących zespołów, które potrzebują głębszej analizy konkurencji.',
      priceMonthly: prices.growth_monthly,
      priceYearly: prices.growth_yearly,
      periodMonthly: period_month,
      periodYearly: period_year,
      isPopular: true,
      buttonLabel: 'Wybierz plan',
      features: [
        { name: '50 analiz marki miesięcznie', isIncluded: true },
        { name: 'Wszystkie 6 modeli + Perplexity', isIncluded: true },
        { name: 'Pełna tabela źródeł z poziomem pewności', isIncluded: true },
        { name: 'Porównanie z konkurencją', isIncluded: true },
        { name: 'Roczna historia i cotygodniowy digest', isIncluded: true },
        { name: 'Dostęp do API', isIncluded: true },
        { name: 'Priorytetowe wsparcie e-mail', isIncluded: true },
      ],
    },
    {
      id: 'enterprise',
      name: 'Agency',
      description: 'Plan skrojony dla zespołów potrzebujących pełnej kontroli widoczności w AI.',
      priceMonthly: 'od $220',
      priceYearly: 'od $220',
      periodMonthly: '/mies.',
      periodYearly: '/mies.',
      isPopular: false,
      buttonLabel: 'Skontaktuj się',
      features: [
        { name: 'Nielimitowane analizy', isIncluded: true },
        { name: 'Własne źródła LLM + modele prywatne', isIncluded: true },
        { name: 'Monitoring w czasie rzeczywistym i alerty', isIncluded: true },
        { name: 'Nielimitowana historia + webhooki', isIncluded: true },
        { name: 'Integracja ze Slack i Teams', isIncluded: true },
        { name: 'Dedykowany opiekun konta', isIncluded: true },
        { name: 'Panel white-label', isIncluded: true },
        { name: 'Gwarancja SLA (99,9%)', isIncluded: true },
      ],
    },
  ];

  const faqItems = [
    { q: 'Czy mogę anulować w dowolnym momencie?',             a: 'Tak — anuluj w dowolnej chwili i zachowaj dostęp do końca okresu rozliczeniowego.' },
    { q: 'Co się stanie, gdy przekroczę limit?', a: 'Po osiągnięciu limitu planu możesz od razu przejść wyżej lub dokupić dodatkowe kredyty na analizy.' },
    { q: 'Czy mogę później zmienić plan?',          a: 'Oczywiście — zmieniaj plany w dowolnym momencie bez utraty danych.' },
    { q: 'Czy otrzymam fakturę VAT?',      a: 'Tak — każda płatność automatycznie generuje fakturę VAT wysyłaną na Twój e-mail. Firmy z UE mogą podać numer VAT przy płatności, aby otrzymać fakturę B2B.' },
    { q: 'Jak przetwarzacie dane mojej firmy?', a: 'Kontekst marki, który wgrywasz, pozostaje w Twojej prywatnej przestrzeni. Nigdy nie trenujemy modeli AI na Twoich danych ani nie udostępniamy ich stronom trzecim poza dostawcami AI niezbędnymi do wykonania analizy. Działamy w pełni zgodnie z RODO.' },
    { q: 'Czy mogę zmienić plan w trakcie okresu rozliczeniowego?', a: 'Tak — podwyższenie planu działa natychmiast i jest rozliczane proporcjonalnie. Obniżenie wchodzi w życie na koniec bieżącego okresu, więc zawsze dostajesz to, za co zapłaciłeś.' },
    { q: 'Potrzebujesz pomocy w wyborze planu?',         a: 'Nasz zespół jest dostępny e-mailowo i pomoże dobrać najlepszą opcję dla Twojej marki.' },
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
              <DialogTitle>Przejście na plan Free</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Czy na pewno chcesz przejść na plan Free?
              <ul className="mt-3 space-y-1.5 text-sm">
                {[
                  'Stracisz dostęp do zaawansowanych modeli (Claude, Gemini i inne)',
                  'Twój limit spadnie do 3 analiz miesięcznie',
                  'Historia analiz i eksport CSV zostaną wyłączone',
                ].map(bullet => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">*</span> {bullet}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground/70">Subskrypcja zostanie anulowana — dostęp trwa do końca bieżącego okresu rozliczeniowego.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" disabled={downgrading} onClick={() => setShowDowngradeDialog(false)}>
              Zostań na obecnym planie
            </Button>
            <Button variant="destructive" className="flex-1" disabled={downgrading} onClick={confirmDowngrade}>
              {downgrading ? 'Anulowanie...' : 'Tak, przejdź na Free'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="pb-20 px-4 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="text-center pt-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary mb-4 uppercase tracking-wider">
            Subscription
          </span>
          <h1 className="text-3xl sm:text-4xl font-display text-foreground mb-2">Subscription</h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Choose the plan that fits — upgrade, downgrade or cancel anytime.
          </p>
        </div>

        {message && (
          <p className="mt-6 mb-2 text-center text-sm text-primary font-medium">{message}</p>
        )}

        {/* Control bar — left: billing-cycle toggle, right: usage + billing */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-8 pb-8">
          {/* Left: billing cycle */}
          <div className="flex items-center gap-1 p-1 rounded-lg border border-[hsl(var(--glass-border))] bg-muted/40 w-fit">
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
                {cycle === 'monthly' ? 'Miesięcznie' : 'Rocznie'}
                {cycle === 'yearly' && (
                  <span className="ml-1.5 text-[10px] font-semibold text-primary">−20%</span>
                )}
              </button>
            ))}
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

        {/* How long this takes everyone else vs Presora */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-display text-foreground">Ile to zajmuje innym</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Sprawdzenie, jak modele AI opisują Twoją markę, po staremu zajmuje dni lub tygodnie. Presora robi to, zanim zdążysz mrugnąć.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { method: 'Ręczne odpytywanie modeli', time: '2–3 dni', note: 'Pytanie każdego modelu, prompt po promptcie, i samodzielne zliczanie odpowiedzi.' },
              { method: 'Audyt w agencji marketingowej', time: '2–4 tygodnie', note: 'Brief, research i prezentacja — plus faktura na cztery cyfry.' },
              { method: 'Tradycyjne narzędzia monitoringu', time: 'Godziny wdrożenia', note: 'Śledzą social media i wyszukiwarki — a nie to, co naprawdę mówi AI.' },
            ].map(item => (
              <div key={item.method} className="rounded-2xl border border-[hsl(var(--glass-border))] bg-background/70 p-5">
                <p className="text-2xl font-display text-foreground">{item.time}</p>
                <p className="text-sm font-medium text-foreground mt-2">{item.method}</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{item.note}</p>
              </div>
            ))}
            {/* Presora — the payoff */}
            <div className="rounded-2xl border border-primary/30 bg-primary/[0.06] p-5 flex flex-col">
              <p className="text-2xl font-display text-primary">~15 sekund</p>
              <p className="text-sm font-semibold text-foreground mt-2">Presora</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Wszystkie modele odpytane równolegle, ocenione i zamienione w priorytetowy plan działania — automatycznie.</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary">
                <Check className="w-3.5 h-3.5" /> Powtarzalne co miesiąc
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
            Często zadawane pytania
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
              <h2 className="text-2xl font-display text-foreground">Potrzebujesz więcej analiz?</h2>
            </div>
            <p className="text-sm text-muted-foreground">Doładuj konto jednorazowymi pakietami kredytów — bez zmiany planu.</p>
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
                    Najlepsza wartość
                  </span>
                )}
                <div>
                  <p className="text-3xl font-display text-foreground">{pack.price}</p>
                  <p className="text-sm text-muted-foreground mt-1">{pack.label}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-2">Jednorazowe doładowanie</p>
                </div>
                <Button
                  onClick={() => handleCreditsBuy(pack.id)}
                  disabled={loadingCredits === pack.id}
                  variant={pack.popular ? 'default' : 'outline'}
                  className="w-full"
                >
                  {loadingCredits === pack.id ? 'Ładowanie...' : 'Kup pakiet'}
                </Button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Social proof */}
        <div className="mt-16">
          <div className="rounded-3xl border border-[hsl(var(--glass-border))] bg-card/60 p-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-primary mb-3">
              Stworzone na erę AI
            </p>
            <h2 className="text-2xl font-display text-foreground max-w-2xl mx-auto">
              Wyprzedzaj zmiany reputacji i wyszukiwania napędzane przez AI.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-left">
              {[
                { title: 'Podejście GEO-first', desc: 'Zbudowane wokół Generative Engine Optimization — nowego standardu widoczności marki w erze AI.' },
                { title: '3 wiodące modele AI', desc: 'Pokrycie ChatGPT, Claude i Gemini — asystentów, których Twoi klienci pytają o rekomendacje.' },
                { title: 'Śledź w czasie', desc: 'Powtarzalne miesięczne audyty pokazują, czy Twoja optymalizacja realnie działa.' },
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
