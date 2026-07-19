-- Track the Stripe customer/subscription behind each profile so the app can
-- actually manage (cancel/pause/resume) a subscription instead of only ever
-- setting it up. Previously there was no way to look up which Stripe
-- subscription belonged to a user.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id        TEXT,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS current_period_end      TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id     ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON public.profiles(stripe_subscription_id);

-- subscription_status already existed (DEFAULT 'inactive') but was never
-- written to by any code path. Document the values it now takes on:
--   'inactive'  — never subscribed / fully canceled, no active Stripe subscription
--   'active'    — subscription in good standing
--   'past_due'  — most recent invoice payment failed, in dunning/grace period
--   'paused'    — subscription open but collection paused (pause_collection)
--   'canceled'  — cancel_at_period_end=true, access continues until current_period_end
COMMENT ON COLUMN public.profiles.subscription_status IS
  'One of: inactive, active, past_due, paused, canceled. Driven by Stripe webhook events — see stripe-webhook.js.';
