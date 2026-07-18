// Single source of truth mapping a Stripe Price ID to our internal plan name.
// Shared by create-checkout.js (to validate/allowlist incoming priceIds) and
// stripe-webhook.js (to decide which plan to grant on checkout.session.completed
// and customer.subscription.updated). Previously the webhook had its own
// `priceId === SOLO ? 'solo' : 'growth'` ternary that silently mis-assigned
// every other price — including Starter — to the most expensive plan.
export const PLAN_BY_PRICE_ID = {
  ...(process.env.VITE_STRIPE_STARTER_PRICE_ID ? { [process.env.VITE_STRIPE_STARTER_PRICE_ID]: 'starter' } : {}),
  ...(process.env.VITE_STRIPE_SOLO_PRICE_ID    ? { [process.env.VITE_STRIPE_SOLO_PRICE_ID]:    'solo'    } : {}),
  ...(process.env.VITE_STRIPE_GROWTH_PRICE_ID  ? { [process.env.VITE_STRIPE_GROWTH_PRICE_ID]:  'growth'  } : {}),
};

export const planForPriceId = (priceId) => PLAN_BY_PRICE_ID[priceId] || null;
