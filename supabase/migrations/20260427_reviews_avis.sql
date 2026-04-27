-- ── Ajouter category_name à site_tags ────────────────────────────────────────
ALTER TABLE site_tags ADD COLUMN IF NOT EXISTS category_name text;

-- ── Table reviews ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  prestataire_id uuid REFERENCES prestataires(id) ON DELETE CASCADE NOT NULL,
  token_id uuid,
  author_name text,
  note int NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);

CREATE POLICY "reviews_insert_via_token" ON reviews FOR INSERT
  WITH CHECK (true);

-- ── Table avis_tokens ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS avis_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  prestataire_id uuid REFERENCES prestataires(id) ON DELETE CASCADE NOT NULL,
  created_by text NOT NULL,
  used_at timestamptz,
  expires_at timestamptz DEFAULT now() + interval '30 days',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE avis_tokens ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent créer/voir les tokens
CREATE POLICY "avis_tokens_admin_all" ON avis_tokens
  FOR ALL
  USING (auth.email() IN ('armand.hespel@hotmail.com', 'yagan_darren@hotmail.com', 'studiohesperides@gmail.com'))
  WITH CHECK (auth.email() IN ('armand.hespel@hotmail.com', 'yagan_darren@hotmail.com', 'studiohesperides@gmail.com'));

-- Lecture publique du token pour validation côté page avis (par id uniquement)
CREATE POLICY "avis_tokens_public_validate" ON avis_tokens FOR SELECT
  USING (true);
