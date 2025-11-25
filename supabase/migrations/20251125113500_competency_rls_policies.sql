-- Migration: RLS Policies for Competency Tables
-- Description: Add RLS policies to competency_standards and student_competency tables
-- to allow teachers to view their enrolled students' competency data.

-- ============================================================================
-- Helper Function: Check if user can view a specific student's data
-- ============================================================================

CREATE OR REPLACE FUNCTION user_can_view_student(target_student_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id uuid;
  current_user_role text;
  has_access boolean;
BEGIN
  -- Get the current authenticated user's ID
  current_user_id := auth.uid();

  -- If not authenticated, deny access
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- If the user is viewing their own data, allow access
  IF current_user_id = target_student_id THEN
    RETURN true;
  END IF;

  -- Get the current user's role from the profiles table
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = current_user_id;

  -- If user is an admin, allow access
  IF current_user_role = 'admin' THEN
    RETURN true;
  END IF;

  -- If user is a teacher, check if the student is enrolled in any of their classes
  IF current_user_role = 'teacher' THEN
    SELECT EXISTS (
      SELECT 1
      FROM class_enrollments ce
      INNER JOIN classes c ON ce.class_id = c.id
      WHERE c.teacher_id = current_user_id
        AND ce.student_id = target_student_id
        AND ce.status = 'active'
    ) INTO has_access;

    RETURN has_access;
  END IF;

  -- Default: deny access
  RETURN false;
END;
$$;

-- Add helpful comment to the function
COMMENT ON FUNCTION user_can_view_student(uuid) IS 'Returns true if the current user can view the target student data. Access is granted if: (1) user is the student themselves, (2) user is an admin, or (3) user is a teacher with the student enrolled in an active class.';

-- ============================================================================
-- Enable RLS on competency_standards table
-- ============================================================================

ALTER TABLE competency_standards ENABLE ROW LEVEL SECURITY;

-- Policy: Competency standards are viewable by all authenticated users
-- Rationale: Standards are metadata about what can be achieved, not sensitive student data
CREATE POLICY "Competency standards are viewable by authenticated users"
  ON competency_standards
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only admins can modify competency standards
CREATE POLICY "Only admins can modify competency standards"
  ON competency_standards
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- Enable RLS on student_competency table
-- ============================================================================

ALTER TABLE student_competency ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own competency records
CREATE POLICY "Students can view their own competency records"
  ON student_competency
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Policy: Teachers can view competency records of enrolled students
CREATE POLICY "Teachers can view enrolled students competency records"
  ON student_competency
  FOR SELECT
  TO authenticated
  USING (user_can_view_student(student_id));

-- Policy: Teachers and admins can update competency records of accessible students
CREATE POLICY "Teachers and admins can update student competency records"
  ON student_competency
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('teacher', 'admin')
    ) AND user_can_view_student(student_id)
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('teacher', 'admin')
    ) AND user_can_view_student(student_id)
  );

-- Policy: Teachers and admins can insert competency records for accessible students
CREATE POLICY "Teachers and admins can insert student competency records"
  ON student_competency
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('teacher', 'admin')
    ) AND user_can_view_student(student_id)
  );

-- Policy: Only admins can delete competency records
CREATE POLICY "Only admins can delete student competency records"
  ON student_competency
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
