-- Table edit_tokens : lie un lien d'invitation à un prestataire
-- Seul l'admin peut créer des tokens (via l'API admin)
CREATE TABLE IF NOT EXISTS edit_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prestataire_id uuid NOT NULL REFERENCES prestataires(id) ON DELETE CASCADE,
  expires_at  timestamptz DEFAULT (now() + interval '90 days'),
  created_at  timestamptz DEFAULT now()
);

-- RLS : lecture publique (vérification du token lors du claim), écriture service only
ALTER TABLE edit_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique edit_tokens" ON edit_tokens;
CREATE POLICY "Lecture publique edit_tokens" ON edit_tokens
  FOR SELECT USING (true);
