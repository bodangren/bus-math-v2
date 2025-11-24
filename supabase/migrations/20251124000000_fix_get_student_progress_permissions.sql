-- Fix get_student_progress RPC to bypass RLS securely
-- This allows teachers to see student progress even if RLS prevents direct table access

drop function if exists get_student_progress(uuid);

create or replace function get_student_progress(student_uuid uuid)
returns table (
  completed_phases bigint,
  total_phases bigint,
  progress_percentage numeric,
  last_active timestamptz
)
security definer -- Bypass RLS
set search_path = public
language plpgsql
as $$
declare
  total_phase_count bigint;
  requesting_user_id uuid := auth.uid();
  requesting_user_role text;
  requesting_user_org uuid;
  target_student_org uuid;
begin
  -- Check permissions
  select role, organization_id into requesting_user_role, requesting_user_org
  from profiles
  where id = requesting_user_id;

  select organization_id into target_student_org
  from profiles
  where id = student_uuid;

  -- Access Control:
  -- 1. Users can always see their own progress
  -- 2. Teachers/Admins can see students in their own organization
  if requesting_user_id != student_uuid then
    if requesting_user_role not in ('teacher', 'admin') or requesting_user_org is distinct from target_student_org then
       -- Unauthorized: return empty set
       return;
    end if;
  end if;

  -- Logic to calculate progress
  select count(*)::bigint into total_phase_count from phases;

  return query
  select
    coalesce(progress.completed_phases, 0) as completed_phases,
    total_phase_count as total_phases,
    case
      when total_phase_count = 0 then 0
      else round(
        coalesce(progress.completed_phases, 0)::numeric /
        nullif(total_phase_count, 0)::numeric * 100,
        1
      )
    end as progress_percentage,
    progress.last_active
  from (
    select
      count(*) filter (where sp.status = 'completed') as completed_phases,
      max(sp.updated_at) as last_active
    from student_progress sp
    where sp.user_id = student_uuid
  ) as progress;
end;
$$;

grant execute on function get_student_progress(uuid) to authenticated;
