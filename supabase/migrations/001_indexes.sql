-- Performance indexes for LucknowKaam
-- Run this in Supabase SQL Editor

CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs (is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs (slug);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs (category);
CREATE INDEX IF NOT EXISTS idx_jobs_location_area ON jobs (location_area);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs (posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON jobs (expires_at);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs (source);
CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON jobs (is_featured) WHERE is_featured = true;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_jobs_active_category ON jobs (is_active, category, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_active_location ON jobs (is_active, location_area, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_active_posted ON jobs (is_active, posted_at DESC);

-- posted_slugs table indexes
CREATE INDEX IF NOT EXISTS idx_posted_slugs_slug ON posted_slugs (slug);
CREATE INDEX IF NOT EXISTS idx_posted_slugs_source ON posted_slugs (source);

-- paid_listings indexes
CREATE INDEX IF NOT EXISTS idx_paid_listings_status ON paid_listings (payment_status);
