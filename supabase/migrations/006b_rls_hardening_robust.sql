-- 006b: RLS hardening — robust version (self-healing)
-- Run in Supabase SQL Editor
--
-- This drops ALL existing policies on the target tables first (removes any
-- leftover permissive policies), then creates only the correct ones.
-- The final SELECT shows RLS status so you can confirm it worked.

-- ============================================================
-- Helper: drop all policies on a table (dynamic, since policy
-- names created out-of-band are unknown)
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'jobs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.jobs', pol.policyname);
  END LOOP;
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'paid_listings'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.paid_listings', pol.policyname);
  END LOOP;
END $$;

-- ============================================================
-- JOBS: public can only READ active jobs; no direct writes
-- ============================================================
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jobs_anon_select_active"
  ON jobs
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "jobs_anon_insert_deny"
  ON jobs
  FOR INSERT
  TO anon
  WITH CHECK (false);

CREATE POLICY "jobs_anon_update_deny"
  ON jobs
  FOR UPDATE
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "jobs_anon_delete_deny"
  ON jobs
  FOR DELETE
  TO anon
  USING (false);

-- ============================================================
-- PAID_LISTINGS: anon denied entirely (service role only)
-- ============================================================
ALTER TABLE paid_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paid_listings_anon_deny"
  ON paid_listings
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- POSTED_SLUGS: ensure RLS enabled; drop anon INSERT (prevents
-- slug poisoning). Keep anon SELECT for dedup reads.
-- ============================================================
ALTER TABLE posted_slugs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_can_insert_posted_slugs" ON posted_slugs;

-- ============================================================
-- VERIFICATION — read the result of this query
-- rls_enabled should be t (true) for all three rows
-- ============================================================
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('jobs', 'paid_listings', 'posted_slugs')
ORDER BY c.relname;