-- Phase 7 deprecation step: retire legacy `phases` runtime usage.
-- 1) rename legacy table to phases_deprecated
-- 2) repoint student_progress FK to phase_versions (NOT VALID during transition)
-- 3) redefine RPCs to use lesson_versions/phase_versions

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'phases'
  ) THEN
    ALTER TABLE public.phases RENAME TO phases_deprecated;
  END IF;
END $$;

ALTER TABLE IF EXISTS public.student_progress
  DROP CONSTRAINT IF EXISTS student_progress_phase_id_fkey;

ALTER TABLE IF EXISTS public.student_progress
  DROP CONSTRAINT IF EXISTS student_progress_phase_id_phases_id_fk;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'student_progress_phase_id_phase_versions_id_fk'
  ) THEN
    ALTER TABLE public.student_progress
      ADD CONSTRAINT student_progress_phase_id_phase_versions_id_fk
      FOREIGN KEY (phase_id)
      REFERENCES public.phase_versions(id)
      ON DELETE CASCADE
      NOT VALID;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION can_access_phase(
  p_lesson_id UUID,
  p_phase_number INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_lesson_version_id UUID;
  v_previous_phase_id UUID;
  v_previous_phase_completed BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = v_user_id;

  IF v_user_role IN ('teacher', 'admin') THEN
    RETURN TRUE;
  END IF;

  IF p_phase_number = 1 THEN
    RETURN TRUE;
  END IF;

  SELECT id INTO v_lesson_version_id
  FROM lesson_versions
  WHERE lesson_id = p_lesson_id
  ORDER BY version DESC
  LIMIT 1;

  IF v_lesson_version_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT id INTO v_previous_phase_id
  FROM phase_versions
  WHERE lesson_version_id = v_lesson_version_id
    AND phase_number = p_phase_number - 1
  LIMIT 1;

  IF v_previous_phase_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS(
    SELECT 1
    FROM student_progress
    WHERE user_id = v_user_id
      AND phase_id = v_previous_phase_id
      AND status = 'completed'
  ) INTO v_previous_phase_completed;

  RETURN v_previous_phase_completed;
END;
$$;

CREATE OR REPLACE FUNCTION get_student_progress(student_uuid uuid)
returns table (
  completed_phases bigint,
  total_phases bigint,
  progress_percentage numeric,
  last_active timestamptz
)
security definer
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
  select role, organization_id into requesting_user_role, requesting_user_org
  from profiles
  where id = requesting_user_id;

  select organization_id into target_student_org
  from profiles
  where id = student_uuid;

  if requesting_user_id != student_uuid then
    if requesting_user_role not in ('teacher', 'admin') or requesting_user_org is distinct from target_student_org then
       return;
    end if;
  end if;

  select count(*)::bigint into total_phase_count from phase_versions;

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

CREATE OR REPLACE FUNCTION complete_activity_atomic(
  p_activity_id UUID,
  p_lesson_id UUID,
  p_phase_number INTEGER,
  p_linked_standard_id UUID,
  p_completion_data JSONB,
  p_idempotency_key UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_student_id UUID;
  v_existing_completion RECORD;
  v_next_phase_unlocked BOOLEAN := false;
  v_completion_id UUID;
  v_phase_id UUID;
  v_phase_count INTEGER;
  v_completed_phases INTEGER;
  v_result JSONB;
  v_insert_success BOOLEAN := false;
  v_lesson_version_id UUID;
BEGIN
  v_student_id := auth.uid();

  IF v_student_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Not authenticated',
      'errorCode', 'AUTH_REQUIRED'
    );
  END IF;

  SELECT id INTO v_lesson_version_id
  FROM lesson_versions
  WHERE lesson_id = p_lesson_id
  ORDER BY version DESC
  LIMIT 1;

  IF v_lesson_version_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'No active lesson version',
      'errorCode', 'LESSON_VERSION_NOT_FOUND'
    );
  END IF;

  SELECT
    id,
    student_id,
    activity_id,
    completed_at,
    completion_data
  INTO v_existing_completion
  FROM activity_completions
  WHERE idempotency_key = p_idempotency_key
    AND student_id = v_student_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'nextPhaseUnlocked', COALESCE(
        (v_existing_completion.completion_data->>'nextPhaseUnlocked')::boolean,
        false
      ),
      'message', 'Activity already completed (idempotent)',
      'completionId', v_existing_completion.id,
      'completedAt', v_existing_completion.completed_at
    );
  END IF;

  BEGIN
    INSERT INTO activity_completions (
      student_id,
      activity_id,
      lesson_id,
      phase_number,
      completed_at,
      idempotency_key,
      completion_data
    ) VALUES (
      v_student_id,
      p_activity_id,
      p_lesson_id,
      p_phase_number,
      NOW(),
      p_idempotency_key,
      p_completion_data
    )
    ON CONFLICT (student_id, activity_id) DO NOTHING
    RETURNING id INTO v_completion_id;

    v_insert_success := (v_completion_id IS NOT NULL);
  EXCEPTION
    WHEN unique_violation THEN
      v_insert_success := false;
  END;

  IF NOT v_insert_success THEN
    SELECT * INTO v_existing_completion
    FROM activity_completions
    WHERE student_id = v_student_id AND activity_id = p_activity_id;

    RETURN jsonb_build_object(
      'success', true,
      'nextPhaseUnlocked', false,
      'message', 'Activity already completed',
      'completionId', v_existing_completion.id,
      'completedAt', v_existing_completion.completed_at
    );
  END IF;

  SELECT id INTO v_phase_id
  FROM phase_versions
  WHERE lesson_version_id = v_lesson_version_id
    AND phase_number = p_phase_number
  LIMIT 1;

  IF v_phase_id IS NOT NULL THEN
    INSERT INTO student_progress (
      user_id,
      phase_id,
      status,
      completed_at
    ) VALUES (
      v_student_id,
      v_phase_id,
      'completed',
      NOW()
    )
    ON CONFLICT (user_id, phase_id)
    DO UPDATE SET
      status = 'completed',
      completed_at = NOW(),
      updated_at = NOW();
  END IF;

  IF p_linked_standard_id IS NOT NULL THEN
    INSERT INTO student_competency (
      student_id,
      standard_id,
      mastery_level,
      evidence_activity_id,
      last_updated,
      updated_by
    ) VALUES (
      v_student_id,
      p_linked_standard_id,
      10,
      p_activity_id,
      NOW(),
      v_student_id
    )
    ON CONFLICT (student_id, standard_id)
    DO UPDATE SET
      mastery_level = LEAST(student_competency.mastery_level + 10, 100),
      evidence_activity_id = p_activity_id,
      last_updated = NOW(),
      updated_by = v_student_id;
  END IF;

  SELECT COUNT(*) INTO v_phase_count
  FROM phase_versions
  WHERE lesson_version_id = v_lesson_version_id;

  SELECT COUNT(*) INTO v_completed_phases
  FROM student_progress sp
  JOIN phase_versions p ON sp.phase_id = p.id
  WHERE sp.user_id = v_student_id
    AND p.lesson_version_id = v_lesson_version_id
    AND sp.status = 'completed';

  IF v_completed_phases < v_phase_count THEN
    v_next_phase_unlocked := true;

    SELECT id INTO v_phase_id
    FROM phase_versions
    WHERE lesson_version_id = v_lesson_version_id
      AND phase_number = p_phase_number + 1
    LIMIT 1;

    IF v_phase_id IS NOT NULL THEN
      INSERT INTO student_progress (
        user_id,
        phase_id,
        status,
        started_at
      ) VALUES (
        v_student_id,
        v_phase_id,
        'in_progress',
        NOW()
      )
      ON CONFLICT (user_id, phase_id) DO NOTHING;
    END IF;
  END IF;

  v_result := jsonb_build_object(
    'success', true,
    'nextPhaseUnlocked', v_next_phase_unlocked,
    'message', 'Activity completed successfully',
    'completionId', v_completion_id,
    'completedPhases', v_completed_phases,
    'totalPhases', v_phase_count
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', SQLERRM,
      'errorCode', SQLSTATE
    );
END;
$$;
