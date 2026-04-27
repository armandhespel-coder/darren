-- Ensure author_name column exists (idempotent fix for schema cache miss)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS author_name text;

-- Allow anonymous users to mark a token as used (single-use enforcement)
DROP POLICY IF EXISTS "avis_tokens_public_mark_used" ON avis_tokens;
CREATE POLICY "avis_tokens_public_mark_used" ON avis_tokens FOR UPDATE
  USING (used_at IS NULL)
  WITH CHECK (true);
