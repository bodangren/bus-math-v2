-- Function to check if a student can access a specific phase
-- This function enforces server-side phase locking based on sequential completion
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
  v_previous_phase_id UUID;
  v_previous_phase_completed BOOLEAN;
BEGIN
  -- Get current user ID from auth
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get user role
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = v_user_id;

  -- Teachers and admins can access all phases
  IF v_user_role IN ('teacher', 'admin') THEN
    RETURN TRUE;
  END IF;

  -- Phase 1 is always accessible
  IF p_phase_number = 1 THEN
    RETURN TRUE;
  END IF;

  -- Check if previous phase is completed
  SELECT id INTO v_previous_phase_id
  FROM phases
  WHERE lesson_id = p_lesson_id
    AND phase_number = p_phase_number - 1
  LIMIT 1;

  IF v_previous_phase_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if previous phase has been completed
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION can_access_phase(UUID, INTEGER) TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION can_access_phase IS 'Checks if the current user can access a specific phase based on their role and progress. Teachers/admins can access all phases. Students must complete phases sequentially.';
