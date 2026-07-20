-- Razorpay payment columns for paid_listings
-- Run this in Supabase SQL Editor

ALTER TABLE paid_listings ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE paid_listings ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

CREATE INDEX IF NOT EXISTS idx_paid_listings_razorpay_order ON paid_listings (razorpay_order_id);
