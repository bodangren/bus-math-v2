-- Security Hardening: Ensure RLS is active and restrictive

-- 1. Re-enable RLS on profiles (just in case)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing permissive policies if any
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Teachers view org profiles" ON profiles;
-- Also drop any leftover policies from previous migrations that might match
DROP POLICY IF EXISTS "Authenticated users view organizations" ON profiles; -- Typo safety? No, that was on orgs.

-- 3. Re-create strict policies

-- Users can view their own profile
CREATE POLICY "Users view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Permissions (Standard Supabase setup usually grants ALL to authenticated/anon, relying on RLS)
-- But let's be safe.
REVOKE ALL ON profiles FROM anon;
-- Allow anon to SELECT if needed? No.
GRANT SELECT, UPDATE ON profiles TO authenticated;
-- Service role has bypass RLS, so it's fine.

-- 5. Ensure triggers are correct (optional verification)
