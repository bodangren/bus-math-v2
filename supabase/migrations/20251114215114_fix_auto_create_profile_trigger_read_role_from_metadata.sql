-- Fix the auto-create profile trigger to read role from user_metadata
-- instead of hardcoding 'student'

-- Drop and recreate the trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  default_org_id uuid;
  user_role text;
begin
  -- Get the default demo organization ID
  -- In production, this should be determined based on signup context
  select id into default_org_id
  from organizations
  where slug = 'demo-school'
  limit 1;

  -- If no demo org exists, use a hardcoded UUID
  -- This handles edge cases during initial setup
  if default_org_id is null then
    default_org_id := '00000000-0000-0000-0000-000000000001'::uuid;
  end if;

  -- Extract role from user metadata, default to 'student'
  user_role := coalesce(new.raw_user_meta_data->>'role', 'student');

  -- Validate role is one of the allowed values
  if user_role not in ('student', 'teacher', 'admin') then
    user_role := 'student';
  end if;

  -- Create the profile with role from metadata
  insert into public.profiles (id, organization_id, role, display_name, metadata)
  values (
    new.id,
    default_org_id,
    user_role::profile_role,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    jsonb_build_object(
      'email', new.email,
      'created_via', 'auto_trigger',
      'user_metadata_role', user_role
    )
  );

  return new;
end;
$$;

-- Update existing demo_teacher profile to have the correct role
-- The auto-create trigger created it with role='student', but it should be 'teacher'
-- Find the auth user by email and update the corresponding profile
update public.profiles
set
  role = 'teacher',
  updated_at = now()
where id in (
  select id
  from auth.users
  where email = 'demo_teacher@internal.domain'
)
and role = 'student';
