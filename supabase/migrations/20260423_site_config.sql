-- ── Ajouter hide_company à prestataires ──────────────────────────────────────
ALTER TABLE prestataires ADD COLUMN IF NOT EXISTS hide_company boolean DEFAULT false;

-- ── Table des catégories du site ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  icon text DEFAULT '✨',
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

INSERT INTO site_categories (name, icon, position) VALUES
  ('DJ', '🎧', 1),
  ('Décoratrice', '🌸', 2),
  ('Matériel', '🎪', 3),
  ('Voiture', '🚗', 4),
  ('Traiteur', '🍽️', 5),
  ('Photo & Caméra', '📸', 6),
  ('Feux d''artifice', '🎆', 7),
  ('Location de salle', '🏛️', 8),
  ('Gâteau', '🎂', 9)
ON CONFLICT (name) DO NOTHING;

-- ── Table des tags du site ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

INSERT INTO site_tags (name) VALUES
  ('Mariage'), ('Anniversaire'), ('Corporate'), ('Vinyl'), ('House'),
  ('Techno'), ('Latino'), ('Hip-Hop'), ('Soirée étudiante'), ('Cocktail'),
  ('Brunch'), ('Retro'), ('Club')
ON CONFLICT (name) DO NOTHING;

-- ── RLS ────────────────────────────────────────────────────────────────────────
ALTER TABLE site_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_tags ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "site_categories_public_read" ON site_categories FOR SELECT USING (true);
CREATE POLICY "site_tags_public_read" ON site_tags FOR SELECT USING (true);

-- Écriture admin uniquement
CREATE POLICY "site_categories_admin_write" ON site_categories
  FOR ALL
  USING (auth.email() IN ('armand.hespel@hotmail.com', 'yagan_darren@hotmail.com'))
  WITH CHECK (auth.email() IN ('armand.hespel@hotmail.com', 'yagan_darren@hotmail.com'));

CREATE POLICY "site_tags_admin_write" ON site_tags
  FOR ALL
  USING (auth.email() IN ('armand.hespel@hotmail.com', 'yagan_darren@hotmail.com'))
  WITH CHECK (auth.email() IN ('armand.hespel@hotmail.com', 'yagan_darren@hotmail.com'));
