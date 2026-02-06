-- Port complete_activity_atomic RPC into Supabase migration history
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
BEGIN
  v_student_id := auth.uid();

  IF v_student_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Not authenticated',
      'errorCode', 'AUTH_REQUIRED'
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
  FROM phases
  WHERE lesson_id = p_lesson_id AND phase_number = p_phase_number;

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
  FROM phases
  WHERE lesson_id = p_lesson_id;

  SELECT COUNT(*) INTO v_completed_phases
  FROM student_progress sp
  JOIN phases p ON sp.phase_id = p.id
  WHERE sp.user_id = v_student_id
    AND p.lesson_id = p_lesson_id
    AND sp.status = 'completed';

  IF v_completed_phases < v_phase_count THEN
    v_next_phase_unlocked := true;

    SELECT id INTO v_phase_id
    FROM phases
    WHERE lesson_id = p_lesson_id
      AND phase_number = p_phase_number + 1;

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
