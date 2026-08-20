-- 006: Row Level Security hardening
-- Run in Supabase SQL Editor
--
-- IMPORTANT: All API routes use the service role (supabaseAdmin), which
-- bypasses RLS. Public pages use the anon key and only SELECT active jobs.
-- This migration locks direct anon writes/reads to sensitive tables.

-- ============================================================
-- JOBS: public can only READ active jobs; no direct writes
-- ============================================================
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jobs_anon_select_active" ON jobs;
CREATE POLICY "jobs_anon_select_active"
  ON jobs
  FOR SELECT
  TO anon
  USING (is_active = true);

DROP POLICY IF EXISTS "jobs_anon_insert" ON jobs;
CREATE POLICY "jobs_anon_insert"
  ON jobs
  FOR INSERT
  TO anon
  WITH CHECK (false);

DROP POLICY IF EXISTS "jobs_anon_update" ON jobs;
CREATE POLICY "jobs_anon_update"
  ON jobs
  FOR UPDATE
  TO anon
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "jobs_anon_delete" ON jobs;
CREATE POLICY "jobs_anon_delete"
  ON jobs
  FOR DELETE
  TO anon
  USING (false);

-- ============================================================
-- PAID_LISTINGS: anon denied entirely (service role only)
-- ============================================================
ALTER TABLE paid_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "paid_listings_anon_all" ON paid_listings;
CREATE POLICY "paid_listings_anon_all"
  ON paid_listings
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- POSTED_SLUGS: keep anon SELECT (dedup reads), block anon INSERT
-- (prevents anon-key slug poisoning that could block scrapers)
-- ============================================================
DROP POLICY IF EXISTS "anon_can_insert_posted_slugs" ON posted_slugs;