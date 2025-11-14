-- Add RPC function to return accurate student progress metrics scoped by student

drop function if exists get_student_progress(uuid);

create or replace function get_student_progress(student_uuid uuid)
returns table (
  completed_phases bigint,
  total_phases bigint,
  progress_percentage numeric,
  last_active timestamptz
)
language plpgsql
as $$
declare
  total_phase_count bigint;
begin
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
