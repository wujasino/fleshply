-- ================================================================
-- PRESORA — PEŁNA MIGRACJA (idempotentna, bezpieczna do re-uruchomienia)
-- Zawiera: tabele, RLS, triggery, funkcje RAG, webhook idempotency,
--          atomowy increment kredytów, indeksy, storage avatarów.
-- ================================================================

-- ── 1. CLEANUP TRIGGERS & FUNCTIONS ─────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created       ON auth.users;
DROP TRIGGER IF EXISTS enforce_analysis_limit     ON public.analyses;
DROP TRIGGER IF EXISTS protect_plan_changes       ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at          ON public.profiles;

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.enforce_analysis_limit();
DROP FUNCTION IF EXISTS public.protect_plan_changes();
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.match_brand_knowledge(vector,  int, text);
DROP FUNCTION IF EXISTS public.match_brand_knowledge(vector(1024), uuid, int, text);
DROP FUNCTION IF EXISTS public.increment_credits(uuid, integer);

-- ── 2. CLEANUP POLICIES ──────────────────────────────────────────
DROP POLICY IF EXISTS "Public profiles are viewable by everyone"     ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile"                   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"                 ON public.profiles;
DROP POLICY IF EXISTS "Users read own profile"                       ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile"                     ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile"                     ON public.profiles;
DROP POLICY IF EXISTS "Service role full access"                     ON public.profiles;
DROP POLICY IF EXISTS "Service role full access on profiles"         ON public.profiles;

DROP POLICY IF EXISTS "Users can view own analyses"                  ON public.analyses;
DROP POLICY IF EXISTS "Users can insert own analyses"                ON public.analyses;
DROP POLICY IF EXISTS "Users manage own analyses"                    ON public.analyses;
DROP POLICY IF EXISTS "Service role full access on analyses"         ON public.analyses;

DROP POLICY IF EXISTS "own brand knowledge"                          ON public.brand_knowledge;
DROP POLICY IF EXISTS "Users manage own brand knowledge"             ON public.brand_knowledge;
DROP POLICY IF EXISTS "Service role full access on brand_knowledge"  ON public.brand_knowledge;

DROP POLICY IF EXISTS "Users manage own recovery codes"              ON public.recovery_codes;

DROP POLICY IF EXISTS "Service role manages newsletter"              ON public.newsletter_subscribers;

DROP POLICY IF EXISTS "Service role manages webhook events"          ON public.webhook_events;

DROP POLICY IF EXISTS "Users can upload own avatar"                  ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar"                  ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar"                  ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar"            ON storage.objects;
DROP POLICY IF EXISTS "Users manage own avatar"                      ON storage.objects;
DROP POLICY IF EXISTS "Users can change their own avatar (all ops)"  ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible"              ON storage.objects;
DROP POLICY IF EXISTS "Public read avatars"                          ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder"              ON storage.objects;
DROP POLICY IF EXISTS "Allow public read"                            ON storage.objects;

-- ── 3. EXTENSIONS ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- ── 4. TABELA PROFILES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                    UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email                 TEXT,
  full_name             TEXT,
  avatar_url            TEXT,
  plan                  TEXT DEFAULT 'free',
  subscription_status   TEXT DEFAULT 'inactive',
  analyses_this_month   INTEGER DEFAULT 0,
  analyses_reset_at     TIMESTAMPTZ DEFAULT now(),
  credits               INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email               TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name           TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url          TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan                TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS analyses_this_month INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS analyses_reset_at   TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits             INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at          TIMESTAMPTZ DEFAULT now();

-- ── 5. TABELA ANALYSES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analyses (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  brand_name TEXT NOT NULL,
  score      INTEGER,
  results    JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.analyses DROP CONSTRAINT IF EXISTS brand_name_length;
ALTER TABLE public.analyses ADD CONSTRAINT brand_name_length CHECK (char_length(brand_name) <= 100);

-- ── 6. TABELA BRAND KNOWLEDGE (RAG) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.brand_knowledge (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  content    TEXT NOT NULL,
  embedding  VECTOR(1024),
  created_at TIMESTAMPTZ DEFAULT now()
);

DROP INDEX IF EXISTS brand_knowledge_embedding_idx;
DROP INDEX IF EXISTS brand_knowledge_brand_idx;
CREATE INDEX brand_knowledge_embedding_idx ON public.brand_knowledge USING hnsw (embedding vector_cosine_ops);
CREATE INDEX brand_knowledge_brand_idx     ON public.brand_knowledge (user_id, brand_name);

-- ── 7. TABELA RECOVERY CODES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recovery_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash  TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  used_at    TIMESTAMPTZ,
  UNIQUE (user_id)
);

-- ── 8. TABELA NEWSLETTER ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  subscribed_at   TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

-- ── 9. TABELA WEBHOOK EVENTS (idempotency Stripe) ────────────────
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  processed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 10. FUNKCJE ──────────────────────────────────────────────────

-- Auto-tworzenie profilu przy rejestracji
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Limit analiz wg planu
CREATE OR REPLACE FUNCTION public.enforce_analysis_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan      TEXT;
  analysis_count INT;
  plan_limit     INT;
  last_reset     TIMESTAMPTZ;
BEGIN
  SELECT plan, analyses_this_month, analyses_reset_at
  INTO user_plan, analysis_count, last_reset
  FROM public.profiles WHERE id = NEW.user_id;

  IF last_reset IS NULL OR last_reset < date_trunc('month', now()) THEN
    UPDATE public.profiles
    SET analyses_this_month = 0, analyses_reset_at = now()
    WHERE id = NEW.user_id;
    analysis_count := 0;
  END IF;

  plan_limit := CASE user_plan
    WHEN 'free'         THEN 3
    WHEN 'solo'         THEN 10
    WHEN 'solo_brew'    THEN 10
    WHEN 'growth'       THEN 50
    WHEN 'growth_roast' THEN 50
    WHEN 'enterprise'   THEN 999999
    ELSE 3
  END;

  IF analysis_count >= plan_limit THEN
    RAISE EXCEPTION 'Analysis limit reached for plan: %', COALESCE(user_plan, 'free');
  END IF;

  UPDATE public.profiles
  SET analyses_this_month = analyses_this_month + 1
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ochrona przed zmianą planu przez klienta (tylko service_role może zmieniać plan)
CREATE OR REPLACE FUNCTION public.protect_plan_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.plan != OLD.plan AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Cannot change plan directly';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Auto updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- RAG: wyszukiwanie semantyczne (wywoływane przez service_role z analyze.js)
CREATE OR REPLACE FUNCTION public.match_brand_knowledge(
  query_embedding VECTOR(1024),
  p_user_id       UUID,
  match_count     INT  DEFAULT 5,
  filter_brand    TEXT DEFAULT NULL
)
RETURNS TABLE (content TEXT, brand_name TEXT, similarity FLOAT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT bk.content, bk.brand_name,
         1 - (bk.embedding <=> query_embedding) AS similarity
  FROM public.brand_knowledge bk
  WHERE bk.user_id = p_user_id
    AND (filter_brand IS NULL OR bk.brand_name = filter_brand)
  ORDER BY bk.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Atomowy increment kredytów (bez race condition przy równoczesnych webhook'ach)
CREATE OR REPLACE FUNCTION public.increment_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles
  SET credits    = credits + p_amount,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$;

-- ── 11. TRIGGERY ─────────────────────────────────────────────────
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER enforce_analysis_limit
  BEFORE INSERT ON public.analyses
  FOR EACH ROW EXECUTE FUNCTION public.enforce_analysis_limit();

CREATE TRIGGER protect_plan_changes
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_plan_changes();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── 12. RLS ──────────────────────────────────────────────────────
ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_knowledge        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_codes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events         ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role full access on profiles"
  ON public.profiles FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- analyses
CREATE POLICY "Users can view own analyses"
  ON public.analyses FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON public.analyses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on analyses"
  ON public.analyses FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- brand_knowledge
CREATE POLICY "own brand knowledge"
  ON public.brand_knowledge FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on brand_knowledge"
  ON public.brand_knowledge FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- recovery_codes
CREATE POLICY "Users manage own recovery codes"
  ON public.recovery_codes FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- newsletter_subscribers — tylko service_role (funkcja Netlify)
CREATE POLICY "Service role manages newsletter"
  ON public.newsletter_subscribers FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- webhook_events — tylko service_role (funkcja Netlify)
CREATE POLICY "Service role manages webhook events"
  ON public.webhook_events FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── 13. STORAGE: AVATARS ─────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true, 2097152,
  array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public             = true,
  file_size_limit    = 2097152,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'];

CREATE POLICY "Users manage own avatar"
  ON storage.objects FOR ALL TO authenticated
  USING  (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

-- ── 14. BACKFILL istniejących użytkowników ───────────────────────
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ── 15. INDEKSY ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS analyses_user_id_idx          ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS analyses_created_at_idx       ON public.analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_brand_knowledge_user_id   ON public.brand_knowledge(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe     ON public.webhook_events(stripe_event_id);

-- ── 16. WERYFIKACJA ──────────────────────────────────────────────
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles','analyses','brand_knowledge','recovery_codes','newsletter_subscribers','webhook_events');

SELECT policyname, tablename, cmd FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
