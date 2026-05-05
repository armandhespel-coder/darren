-- Permet les demandes anonymes (clients sans compte)
ALTER TABLE messages
  ALTER COLUMN sender_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS sender_name TEXT,
  ADD COLUMN IF NOT EXISTS sender_email TEXT;

-- RLS : l'insertion anonyme via service client est déjà couverte (service bypasse RLS)
-- On s'assure juste que les admins peuvent tout lire
