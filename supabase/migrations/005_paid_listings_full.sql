-- 005: Complete paid_listings schema
-- Run in Supabase SQL Editor (replaces the never-applied 003)

-- 1. Razorpay payment columns (from 003, in case it was never applied)
ALTER TABLE paid_listings ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE paid_listings ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- 2. Fields the form collects but were never persisted
ALTER TABLE paid_listings ADD COLUMN IF NOT EXISTS location_area TEXT;
ALTER TABLE paid_listings ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE paid_listings ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE paid_listings ADD COLUMN IF NOT EXISTS salary TEXT;
ALTER TABLE paid_listings ADD COLUMN IF NOT EXISTS your_name TEXT;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_paid_listings_razorpay_order ON paid_listings (razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_paid_listings_payment_status ON paid_listings (payment_status);