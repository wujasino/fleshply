-- ── Guest rate limits (IP-based, no auth required) ───────────────────────────
-- Tracks how many analyses a guest IP has run.
-- Only service_role (Netlify function) can read/write — no public access.

CREATE TABLE IF NOT EXISTS public.guest_rate_limits (
  ip          TEXT PRIMARY KEY,
  count       INTEGER NOT NULL DEFAULT 0,
  first_seen  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guest_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages guest limits" ON public.guest_rate_limits;
CREATE POLICY "Service role manages guest limits"
  ON public.guest_rate_limits FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Atomic upsert + increment — returns new count
CREATE OR REPLACE FUNCTION public.increment_guest_limit(p_ip TEXT)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_count INTEGER;
BEGIN
  INSERT INTO public.guest_rate_limits (ip, count, first_seen, last_seen)
  VALUES (p_ip, 1, now(), now())
  ON CONFLICT (ip) DO UPDATE
    SET count     = guest_rate_limits.count + 1,
        last_seen = now()
  RETURNING count INTO new_count;

  RETURN new_count;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_guest_rate_limits_ip ON public.guest_rate_limits(ip);
