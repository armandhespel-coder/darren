-- 1. Add 'admin' to profiles role constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('client', 'pro', 'admin'));

-- 2. Reset to 'client' any user with role='pro' but no prestataire linked
UPDATE profiles
SET role = 'client'
WHERE role = 'pro'
  AND id NOT IN (
    SELECT owner_id FROM prestataires WHERE owner_id IS NOT NULL
  );

-- 3. Admins get full access to messages (select, insert, update, delete)
DROP POLICY IF EXISTS "admin_all_messages" ON messages;
CREATE POLICY "admin_all_messages" ON messages
  FOR ALL
  USING (auth.email() IN ('armand.hespel@hotmail.com', 'yagan_darren@hotmail.com'))
  WITH CHECK (auth.email() IN ('armand.hespel@hotmail.com', 'yagan_darren@hotmail.com'));

-- 4. Receivers can mark their received messages as read
DROP POLICY IF EXISTS "Users can update read status" ON messages;
CREATE POLICY "Users can update read status" ON messages
  FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);
