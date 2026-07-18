-- Fix: password_reset_otps had no cap on verification attempts, so the
-- 6-digit code (1,000,000 combinations) could be brute-forced within its
-- 10-minute validity window via unlimited calls to verify-reset-otp.
-- Add a per-code attempt counter enforced server-side.

ALTER TABLE public.password_reset_otps
  ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;

-- Atomically increments the attempt counter for every non-expired OTP row
-- belonging to an email and returns the total attempts across them, so the
-- caller can enforce a lockout regardless of which specific code was tried.
CREATE OR REPLACE FUNCTION public.register_otp_attempt(p_email TEXT)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  total INTEGER;
BEGIN
  UPDATE public.password_reset_otps
  SET attempts = attempts + 1
  WHERE email = p_email
    AND used_at IS NULL
    AND expires_at > now();

  SELECT COALESCE(SUM(attempts), 0) INTO total
  FROM public.password_reset_otps
  WHERE email = p_email
    AND used_at IS NULL
    AND expires_at > now();

  RETURN total;
END;
$$;
