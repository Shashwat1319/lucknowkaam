-- Full-text search support for LucknowKaam
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram indexes for ILIKE / LIKE search on title_hindi and title_english
CREATE INDEX IF NOT EXISTS idx_jobs_title_hindi_trgm ON jobs USING gin (title_hindi gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_jobs_title_english_trgm ON jobs USING gin (title_english gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_jobs_company_name_trgm ON jobs USING gin (company_name gin_trgm_ops);

-- Combined tsvector column for full-text search across key fields
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION jobs_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.title_hindi, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.title_english, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.company_name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.description_hindi, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jobs_search ON jobs;
CREATE TRIGGER trg_jobs_search
  BEFORE INSERT OR UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION jobs_search_update();

-- Backfill existing rows
UPDATE jobs SET search_vector =
  setweight(to_tsvector('simple', coalesce(title_hindi, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(title_english, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(company_name, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(description_hindi, '')), 'C')
WHERE search_vector IS NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_search_vector ON jobs USING gin (search_vector);
