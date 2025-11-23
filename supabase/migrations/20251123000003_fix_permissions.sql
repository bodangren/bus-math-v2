-- Final Fix: Ensure RLS is active and permissions are restricted

-- 1. Enable RLS (Redundant but safe)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Revoke all permissions from anon role on profiles
REVOKE ALL ON profiles FROM anon;

-- 3. Grant only necessary permissions to authenticated role
GRANT SELECT, UPDATE ON profiles TO authenticated;

-- 4. Verify policy exists (re-apply if needed)
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
CREATE POLICY "Users view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Ensure no other policies exist that grant access
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Teachers view org profiles" ON profiles;
