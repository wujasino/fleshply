const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const ALLOWED_PRICE_IDS = new Set([
  process.env.VITE_STRIPE_SOLO_PRICE_ID,
  process.env.VITE_STRIPE_GROWTH_PRICE_ID,
].filter(Boolean));

module.exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Payload size guard
  if (event.body && event.body.length > 10 * 1024) {
    return { statusCode: 413, body: JSON.stringify({ error: 'Payload too large' }) };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfiguration' }) };
  }

  // Verify caller via JWT — never trust userId from request body
  const token = (event.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { priceId } = body;

  if (!priceId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing priceId' }) };
  }

  // Whitelist — reject unknown price IDs
  if (ALLOWED_PRICE_IDS.size > 0 && !ALLOWED_PRICE_IDS.has(priceId)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid priceId' }) };
  }

  const allowedOrigins = ['https://bitbrew.pl', 'https://www.bitbrew.pl'];
  let origin = process.env.URL || 'https://bitbrew.pl';
  try {
    const reqOrigin = event.headers?.origin;
    if (reqOrigin && allowedOrigins.includes(reqOrigin)) {
      origin = reqOrigin;
    } else if (event.headers?.referer) {
      const ref = new URL(event.headers.referer).origin;
      if (allowedOrigins.includes(ref)) origin = ref;
    }
  } catch {
    // use default
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      metadata: {
        userId: user.id, // from verified JWT, not client body
        priceId,
      },
      success_url: `${origin}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Checkout creation failed. Please try again.' }),
    };
  }
};
