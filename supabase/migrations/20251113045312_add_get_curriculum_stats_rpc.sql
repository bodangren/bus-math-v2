-- Add RPC function to get curriculum statistics for home page
-- Returns count of units, lessons, and activities

create or replace function get_curriculum_stats()
returns json
language sql
stable
as $$
  select json_build_object(
    'unitCount', (select count(distinct unit_number) from lessons),
    'lessonCount', (select count(*) from lessons),
    'activityCount', (select count(*) from activities)
  );
$$;

-- Grant execute permission to authenticated and anonymous users (home page is public)
grant execute on function get_curriculum_stats() to authenticated;
grant execute on function get_curriculum_stats() to anon;
