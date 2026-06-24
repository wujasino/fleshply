import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const CREDIT_LINKS = {
  [process.env.VITE_STRIPE_CREDITS_20]:  20,
  [process.env.VITE_STRIPE_CREDITS_50]:  50,
  [process.env.VITE_STRIPE_CREDITS_120]: 120,
};

function creditsFromPaymentLink(paymentLink) {
  if (!paymentLink) return 0;
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

export const handler = async (event) => {
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

    const { data: existing } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', stripeEvent.id)
      .maybeSingle();

    if (existing) {
      return { statusCode: 200, body: JSON.stringify({ received: true, duplicate: true }) };
    }

    await supabase.from('webhook_events').insert({ stripe_event_id: stripeEvent.id });

    const userId = session.client_reference_id || session.metadata?.userId;
    const creditsToAdd = creditsFromPaymentLink(session.payment_link);

    if (creditsToAdd > 0 && userId) {
      const { error } = await supabase.rpc('increment_credits', {
        p_user_id: userId,
        p_amount: creditsToAdd,
      });

      if (error) {
        console.error('increment_credits RPC error:', error.message);
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', userId)
          .single();

        await supabase
          .from('profiles')
          .update({ credits: (profile?.credits ?? 0) + creditsToAdd })
          .eq('id', userId);
      }

      return { statusCode: 200, body: JSON.stringify({ received: true, credits_added: creditsToAdd }) };
    }

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
