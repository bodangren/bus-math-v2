-- Fix infinite recursion in profiles RLS policy
-- The "Teachers view org profiles" policy causes infinite recursion because
-- it queries the profiles table from within a profiles RLS policy.

-- Drop the problematic policy
drop policy if exists "Teachers view org profiles" on profiles;

-- Note: Teachers can still view their own profile via "Users view own profile"
-- If teachers need to view student profiles, we'll implement that differently
-- (e.g., through a view or a function that uses security definer)
