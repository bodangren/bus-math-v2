-- Add organizations table and update profiles with organizationId FK

-- Create organizations table
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  settings jsonb,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Add organizationId column to profiles table
alter table profiles
add column organization_id uuid;

-- Add foreign key constraint
alter table profiles
add constraint profiles_organization_id_organizations_id_fk
foreign key (organization_id)
references organizations(id)
on delete cascade;

-- Backfill: Create a default organization for existing profiles (if any)
-- This ensures existing data isn't orphaned
insert into organizations (id, name, slug, settings, created_at, updated_at)
values (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Demo School',
  'demo-school',
  '{"timezone": "America/New_York", "locale": "en-US", "features": {"enableLivePolling": true, "enableLeaderboards": true, "enableAnalytics": true}}'::jsonb,
  now(),
  now()
)
on conflict (id) do nothing;

-- Update any existing profiles to belong to the demo organization
update profiles
set organization_id = '00000000-0000-0000-0000-000000000001'::uuid
where organization_id is null;

-- Now make organization_id NOT NULL since all profiles have been assigned
alter table profiles
alter column organization_id set not null;
