-- OTP codes for password reset (idempotent — safe to re-run)
CREATE TABLE IF NOT EXISTS public.password_reset_otps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes'),
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by email
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email ON public.password_reset_otps (email);

-- Only service_role can read/write (Netlify Functions use service_role key)
ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

-- No direct client access — all operations go through Netlify Functions
DROP POLICY IF EXISTS "No direct access" ON public.password_reset_otps;
CREATE POLICY "No direct access" ON public.password_reset_otps
  AS RESTRICTIVE
  FOR ALL
  USING (false);

-- Auto-delete expired codes (keeps table clean)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.password_reset_otps
  WHERE expires_at < now() - interval '1 hour';
END;
$$;
