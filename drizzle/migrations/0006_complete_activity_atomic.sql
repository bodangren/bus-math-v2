-- Migration: Atomic Activity Completion RPC Function
-- Creates a PL/pgSQL function to handle activity completions atomically
-- with proper idempotency, race condition prevention, and transaction safety

CREATE OR REPLACE FUNCTION complete_activity_atomic(
  p_student_id UUID,
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
  v_existing_completion RECORD;
  v_next_phase_unlocked BOOLEAN := false;
  v_completion_id UUID;
  v_phase_id UUID;
  v_phase_count INTEGER;
  v_completed_phases INTEGER;
  v_result JSONB;
BEGIN
  -- Check for existing completion by idempotency key
  SELECT
    id,
    student_id,
    activity_id,
    completed_at
  INTO v_existing_completion
  FROM activity_completions
  WHERE idempotency_key = p_idempotency_key;

  -- If idempotency key exists, return cached result
  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'nextPhaseUnlocked', false,
      'message', 'Activity already completed (idempotent)',
      'completionId', v_existing_completion.id,
      'completedAt', v_existing_completion.completed_at
    );
  END IF;

  -- Check for existing completion by student + activity (prevent duplicates)
  SELECT id INTO v_completion_id
  FROM activity_completions
  WHERE student_id = p_student_id AND activity_id = p_activity_id;

  IF FOUND THEN
    -- Update the existing record with new idempotency key
    UPDATE activity_completions
    SET
      idempotency_key = p_idempotency_key,
      completion_data = p_completion_data,
      updated_at = NOW()
    WHERE id = v_completion_id
    RETURNING id INTO v_completion_id;

    RETURN jsonb_build_object(
      'success', true,
      'nextPhaseUnlocked', false,
      'message', 'Activity completion updated',
      'completionId', v_completion_id
    );
  END IF;

  -- Insert new activity completion
  INSERT INTO activity_completions (
    student_id,
    activity_id,
    lesson_id,
    phase_number,
    completed_at,
    idempotency_key,
    completion_data
  ) VALUES (
    p_student_id,
    p_activity_id,
    p_lesson_id,
    p_phase_number,
    NOW(),
    p_idempotency_key,
    p_completion_data
  )
  RETURNING id INTO v_completion_id;

  -- Get the phase_id for this lesson and phase_number
  SELECT id INTO v_phase_id
  FROM phases
  WHERE lesson_id = p_lesson_id AND phase_number = p_phase_number;

  -- Update or create student progress for this phase
  IF v_phase_id IS NOT NULL THEN
    INSERT INTO student_progress (
      user_id,
      phase_id,
      status,
      completed_at
    ) VALUES (
      p_student_id,
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

  -- Update student competency if linked to a standard
  IF p_linked_standard_id IS NOT NULL THEN
    INSERT INTO student_competency (
      student_id,
      standard_id,
      mastery_level,
      evidence_activity_id,
      last_updated,
      updated_by
    ) VALUES (
      p_student_id,
      p_linked_standard_id,
      10, -- Increment by 10 points per completion
      p_activity_id,
      NOW(),
      p_student_id
    )
    ON CONFLICT (student_id, standard_id)
    DO UPDATE SET
      mastery_level = LEAST(student_competency.mastery_level + 10, 100),
      evidence_activity_id = p_activity_id,
      last_updated = NOW(),
      updated_by = p_student_id;
  END IF;

  -- Check if next phase should be unlocked
  -- Get total phases for this lesson
  SELECT COUNT(*) INTO v_phase_count
  FROM phases
  WHERE lesson_id = p_lesson_id;

  -- Get count of completed phases for this student
  SELECT COUNT(*) INTO v_completed_phases
  FROM student_progress sp
  JOIN phases p ON sp.phase_id = p.id
  WHERE sp.user_id = p_student_id
    AND p.lesson_id = p_lesson_id
    AND sp.status = 'completed';

  -- If we just completed a phase and there's a next phase, unlock it
  IF v_completed_phases < v_phase_count THEN
    v_next_phase_unlocked := true;

    -- Mark the next phase as 'in_progress' if it exists
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
        p_student_id,
        v_phase_id,
        'in_progress',
        NOW()
      )
      ON CONFLICT (user_id, phase_id) DO NOTHING;
    END IF;
  END IF;

  -- Build and return success result
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
    -- Return error as JSON
    RETURN jsonb_build_object(
      'success', false,
      'message', SQLERRM,
      'errorCode', SQLSTATE
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION complete_activity_atomic TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION complete_activity_atomic IS
'Atomically completes an activity for a student with idempotency support.
Updates activity_completions, student_progress, and student_competency tables in a single transaction.
Returns JSON with success status, next phase unlock status, and completion details.';
