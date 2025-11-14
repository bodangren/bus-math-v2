-- Add username column to profiles table
-- This column is required by the Drizzle schema and used throughout the application

-- Step 1: Add the column as nullable
alter table public.profiles
add column if not exists username text;

-- Step 2: Populate username from auth.users email
-- Extract the part before @ from the email address
update public.profiles p
set username = split_part(au.email, '@', 1)
from auth.users au
where p.id = au.id
  and p.username is null;

-- Step 3: Make username NOT NULL and UNIQUE
alter table public.profiles
alter column username set not null;

alter table public.profiles
add constraint profiles_username_key unique (username);

-- Step 4: Update the trigger to include username when creating profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  default_org_id uuid;
  user_role text;
  user_username text;
begin
  -- Get the default demo organization ID
  select id into default_org_id
  from organizations
  where slug = 'demo-school'
  limit 1;

  if default_org_id is null then
    default_org_id := '00000000-0000-0000-0000-000000000001'::uuid;
  end if;

  -- Extract role from user metadata, default to 'student'
  user_role := coalesce(new.raw_user_meta_data->>'role', 'student');

  -- Validate role is one of the allowed values
  if user_role not in ('student', 'teacher', 'admin') then
    user_role := 'student';
  end if;

  -- Extract username from email (part before @)
  user_username := split_part(new.email, '@', 1);

  -- Create the profile with username
  insert into public.profiles (id, organization_id, username, role, display_name, metadata)
  values (
    new.id,
    default_org_id,
    user_username,
    user_role::profile_role,
    coalesce(new.raw_user_meta_data->>'display_name', user_username),
    jsonb_build_object(
      'email', new.email,
      'created_via', 'auto_trigger',
      'user_metadata_role', user_role
    )
  );

  return new;
end;
$$;
