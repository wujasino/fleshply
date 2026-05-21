import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { pricingTiers } from '@/data/mockData';
import { useTranslation } from '@/lib/locale';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

const Pricing = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('success')) {
      setMessage(
        'Płatność zakończona sukcesem! Twój plan został aktywowany.'
      );
    }

    if (params.get('canceled')) {
      setMessage('Płatność została anulowana.');
    }
  }, []);

  const handleCheckout = async (planName: string) => {
    if (planName === 'Free') {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/register';
        return;
      }

      window.location.href = '/dashboard';
      return;
    }

    // Enterprise → mail
    if (planName === 'Enterprise Roast') {
      window.location.href =
        'mailto:kontakt@bitbrew.pl?subject=Enterprise Plan';
      return;
    }

    setLoading(planName);
    setMessage('');

    try {
      // Auth user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Stripe Price IDs
      const priceId =
        planName === 'Solo Brew'
          ? import.meta.env.VITE_STRIPE_SOLO_PRICE_ID
          : import.meta.env.VITE_STRIPE_GROWTH_PRICE_ID;

      if (!priceId) {
        setMessage(
          'Brak konfiguracji Stripe Price ID. Skontaktuj się z administratorem.'
        );
        return;
      }

      // Create checkout session
      const response = await fetch(
        '/.netlify/functions/create-checkout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId,
            userId: user.id,
            userEmail: user.email,
          }),
        }
      );

      // HTTP error
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // ignore json parse error
        }

        console.error('Checkout error:', errorMessage);

        setMessage(
          'Nie udało się rozpocząć płatności. Spróbuj ponownie później.'
        );

        return;
      }

      // Parse response
      const data = await response.json();

      if (!data?.url) {
        setMessage(
          data?.error ||
          'Nie udało się utworzyć sesji płatności.'
        );

        return;
      }

      // Redirect Stripe Checkout
      window.location.href = data.url;

    } catch (error) {
      console.error('Stripe checkout error:', error);

      setMessage(
        'Wystąpił błąd połączenia. Spróbuj ponownie.'
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-3xl sm:text-4xl font-display text-foreground mb-3">
            {t('pricing_title')}
          </h1>

          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            {t('pricing_subtitle')}
          </p>

          <div className="mt-8 mb-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {t('billing_cycle_label')}:
            </span>
            <div className="inline-flex rounded-full border border-primary/20 bg-background p-1">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('billing_cycle_monthly')}
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${billingCycle === 'yearly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('billing_cycle_yearly')}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mb-10">
            {t('billing_savings')}
          </p>

          {message && (
            <p className="mt-4 text-sm text-primary font-medium">
              {message}
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingTiers.map((tier, index) => {
            const displayPrice = billingCycle === 'yearly' ? tier.yearlyPrice ?? tier.price : tier.monthlyPrice ?? tier.price;
            const isEnterprise = tier.name === 'Enterprise Roast';
            const buttonClass = tier.highlighted
              ? 'bg-primary text-primary-foreground'
              : isEnterprise
                ? 'border border-slate-500 bg-slate-950 text-foreground hover:bg-slate-900'
                : tier.name === 'Solo Brew'
                  ? 'border border-yellow-400 bg-yellow-500/10 text-foreground hover:bg-yellow-500/20'
                  : 'bg-secondary text-secondary-foreground';

            return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
                className={`glass-card-hover p-8 flex flex-col min-h-[520px] ${
                tier.highlighted
                  ? 'border-primary/30 ring-1 ring-primary/20'
                  : ''
              }`}
            >
              {/* Popular badge */}
              {tier.highlighted && (
                <span className="text-[10px] text-primary uppercase tracking-widest font-data mb-3">
                  {t('most_popular')}
                </span>
              )}

              {/* Name */}
              <h3 className="text-lg font-medium text-foreground">
                {tier.name}
              </h3>

              {/* Price */}
              <div className="mt-3 mb-4">
                <span className="text-4xl font-display text-foreground">
                    {displayPrice}
                </span>

                <span className="text-muted-foreground text-sm">
                    {billingCycle === 'yearly' ? t('tier_period_year') : t(tier.periodKey)}
                </span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-sm mb-6">
                {t(tier.descriptionKey)}
              </p>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {tier.featureKeys.map((featureKey) => (
                  <li
                    key={featureKey}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />

                    {t(featureKey)}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleCheckout(tier.name)}
                disabled={loading === tier.name}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 ${buttonClass}`}
              >
                {loading === tier.name
                  ? 'Ładowanie...'
                    : isEnterprise
                    ? t('contact_sales')
                      : tier.name === 'Free'
                        ? t('start_for_free')
                        : t('get_started')}
              </button>
            </motion.div>
            );
          })}
        </div>

        <div className="mt-12 space-y-10">
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
                {
                  question: t('pricing_faq_q_cancel'),
                  answer: t('pricing_faq_a_cancel'),
                },
                {
                  question: t('pricing_faq_q_overage'),
                  answer: t('pricing_faq_a_overage'),
                },
                {
                  question: t('pricing_faq_q_switch'),
                  answer: t('pricing_faq_a_switch'),
                },
                {
                  question: t('pricing_faq_q_support'),
                  answer: t('pricing_faq_a_support'),
                },
              ].map((item) => (
                <div
                  key={item.question}
                  className="rounded-3xl border border-[hsl(var(--glass-border))] bg-background/80 p-6"
                >
                  <h3 className="text-sm font-semibold text-foreground">
                    {item.question}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {item.answer}
                  </p>
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