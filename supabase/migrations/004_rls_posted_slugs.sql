-- Enable RLS on posted_slugs
ALTER TABLE posted_slugs ENABLE ROW LEVEL SECURITY;

-- Allow anon key to SELECT (read existing slugs)
CREATE POLICY "anon_can_read_posted_slugs"
  ON posted_slugs
  FOR SELECT
  TO anon
  USING (true);

-- Allow anon key to INSERT (save new slugs)
CREATE POLICY "anon_can_insert_posted_slugs"
  ON posted_slugs
  FOR INSERT
  TO anon
  WITH CHECK (true);
