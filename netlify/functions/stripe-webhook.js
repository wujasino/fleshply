const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async function(event) {
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
    const userId = session.metadata.userId;
    const priceId = session.metadata?.priceId || '';

    const plan = priceId === process.env.VITE_STRIPE_SOLO_PRICE_ID ? 'solo' : 'growth';

    await supabase
      .from('profiles')
      .update({ plan })
      .eq('id', userId);
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};