-- RLS : seuls les admins peuvent écrire sur la table prestataires

-- Supprimer les anciennes policies write si elles existent
DROP POLICY IF EXISTS "admin_write" ON prestataires;
DROP POLICY IF EXISTS "owner_write" ON prestataires;

-- Admins : accès total (insert / update / delete)
CREATE POLICY "admin_write" ON prestataires
  FOR ALL
  USING (
    auth.email() IN ('armand.hespel@hotmail.com', 'yagan_darren@hotmail.com')
  )
  WITH CHECK (
    auth.email() IN ('armand.hespel@hotmail.com', 'yagan_darren@hotmail.com')
  );

-- Lecture publique (si pas déjà en place)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'prestataires' AND policyname = 'public_read'
  ) THEN
    CREATE POLICY "public_read" ON prestataires
      FOR SELECT USING (true);
  END IF;
END $$;
