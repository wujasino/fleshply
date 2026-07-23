-- Fix: the 20240104 security-hardening migration dropped the old
-- "Users manage own analyses" (FOR ALL) policy and replaced it with only
-- SELECT and INSERT policies for `authenticated`, with no DELETE policy.
-- With RLS enabled and no matching policy, DELETE is silently denied
-- (0 rows affected, no error) — so Reports.tsx's "Delete report" button
-- returns success and removes the row from local state, while the row
-- stays in the database forever. Add the missing policy.

DROP POLICY IF EXISTS "Users can delete own analyses" ON public.analyses;

CREATE POLICY "Users can delete own analyses"
  ON public.analyses FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
