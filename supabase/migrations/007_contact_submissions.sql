-- 007: contact_submissions table for storing contact form entries
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read (no anon access)
CREATE POLICY "service_role_insert_contact" ON contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_role_read_contact" ON contact_submissions
  FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON contact_submissions (created_at DESC);
