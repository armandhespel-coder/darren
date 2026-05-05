-- Table dédiée aux demandes clients (sans compte requis)
CREATE TABLE IF NOT EXISTS demandes (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  prestataire_id UUID     REFERENCES prestataires(id) ON DELETE SET NULL,
  nom         TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  telephone   TEXT,
  contenu     TEXT        NOT NULL,
  lu          BOOLEAN     DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE demandes ENABLE ROW LEVEL SECURITY;

-- Les admins connectés peuvent tout lire et modifier
CREATE POLICY "admins read demandes"   ON demandes FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins update demandes" ON demandes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "admins delete demandes" ON demandes FOR DELETE TO authenticated USING (true);
-- L'insertion se fait via service client (bypass RLS) — pas de policy INSERT nécessaire
