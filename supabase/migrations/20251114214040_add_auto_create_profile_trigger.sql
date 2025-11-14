-- Create a trigger function that auto-creates a profile when a new auth user is created
-- This ensures every authenticated user has a corresponding profile record

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  default_org_id uuid;
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

  -- Create the profile with default values
  insert into public.profiles (id, organization_id, role, display_name, metadata)
  values (
    new.id,
    default_org_id,
    'student', -- Default role is student; can be updated later
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), -- Use display_name from metadata or email prefix
    jsonb_build_object(
      'email', new.email,
      'created_via', 'auto_trigger'
    )
  );

  return new;
end;
$$;

-- Create the trigger on auth.users table
-- This fires after a new user is inserted into the auth.users table
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: Create profiles for any existing auth users that don't have profiles yet
-- This handles users that were created before this trigger was added
insert into public.profiles (id, organization_id, role, display_name, metadata)
select
  au.id,
  coalesce(
    (select id from organizations where slug = 'demo-school' limit 1),
    '00000000-0000-0000-0000-000000000001'::uuid
  ),
  'student',
  coalesce(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1)),
  jsonb_build_object(
    'email', au.email,
    'backfilled', true,
    'backfilled_at', now()
  )
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null
on conflict (id) do nothing;
