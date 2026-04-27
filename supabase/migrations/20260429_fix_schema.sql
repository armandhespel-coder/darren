-- ── Fix reviews schema (token_id + author_name may be missing from cache) ───────
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS token_id uuid;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS author_name text;
NOTIFY pgrst, 'reload schema';

-- ── Rename site_tags → site_subcategories ─────────────────────────────────────
ALTER TABLE site_tags RENAME TO site_subcategories;

-- ── New site_tags table for free-form specialties ─────────────────────────────
CREATE TABLE IF NOT EXISTS site_tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE site_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_tags_public_read" ON site_tags FOR SELECT USING (true);
CREATE POLICY "site_tags_admin_all" ON site_tags
  FOR ALL
  USING (auth.email() IN ('armand.hespel@hotmail.com', 'yagan_darren@hotmail.com'))
  WITH CHECK (auth.email() IN ('armand.hespel@hotmail.com', 'yagan_darren@hotmail.com'));

-- ── Add specialites column to prestataires ────────────────────────────────────
ALTER TABLE prestataires ADD COLUMN IF NOT EXISTS specialites text[] DEFAULT '{}';

-- ── Update avis_tokens admin policy (remove studiohesperides) ─────────────────
DROP POLICY IF EXISTS "avis_tokens_admin_all" ON avis_tokens;
CREATE POLICY "avis_tokens_admin_all" ON avis_tokens
  FOR ALL
  USING (auth.email() IN ('armand.hespel@hotmail.com', 'yagan_darren@hotmail.com'))
  WITH CHECK (auth.email() IN ('armand.hespel@hotmail.com', 'yagan_darren@hotmail.com'));
