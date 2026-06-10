const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Map Stripe Payment Link URLs → how many credits to add.
// The URL stored in the env is the full buy.stripe.com link; we compare
// the path segment so we're not sensitive to query-string noise.
const CREDIT_LINKS = {
  [process.env.VITE_STRIPE_CREDITS_20]:  20,
  [process.env.VITE_STRIPE_CREDITS_50]:  50,
  [process.env.VITE_STRIPE_CREDITS_120]: 120,
};

function creditsFromPaymentLink(paymentLink) {
  if (!paymentLink) return 0;
  // paymentLink is e.g. "plink_1ABC..." (the object id) when Stripe sends it,
  // or the full URL. Match against the last path segment of our env URLs.
  for (const [url, credits] of Object.entries(CREDIT_LINKS)) {
    if (!url) continue;
    try {
      const slug = new URL(url).pathname.replace(/^\//, '');
      if (paymentLink === slug || paymentLink.includes(slug)) return credits;
    } catch {
      if (url.includes(paymentLink)) return credits;
    }
  }
  return 0;
}

module.exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    // ── Credit pack purchased via Payment Link ──────────────────────────────
    // client_reference_id holds the Supabase user.id we attached in Pricing.tsx
    const userId = session.client_reference_id || session.metadata?.userId;
    const creditsToAdd = creditsFromPaymentLink(session.payment_link);

    if (creditsToAdd > 0 && userId) {
      // Fetch current credits so we can increment atomically via RPC or manually
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      const currentCredits = profile?.credits ?? 0;

      await supabase
        .from('profiles')
        .update({ credits: currentCredits + creditsToAdd })
        .eq('id', userId);

      return { statusCode: 200, body: JSON.stringify({ received: true, credits_added: creditsToAdd }) };
    }

    // ── Subscription plan purchased via create-checkout ─────────────────────
    const planUserId = session.metadata?.userId;
    const priceId    = session.metadata?.priceId || '';

    if (planUserId && priceId) {
      const plan = priceId === process.env.VITE_STRIPE_SOLO_PRICE_ID ? 'solo' : 'growth';

      await supabase
        .from('profiles')
        .update({ plan })
        .eq('id', planUserId);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
