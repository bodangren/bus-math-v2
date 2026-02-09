-- Tighten competency RLS read scope:
-- - students: self-read only (student role required)
-- - teachers/admins: scoped read only via org + enrollment helper

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
  current_user_org uuid;
  target_student_role text;
  target_student_org uuid;
  has_access boolean;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT role, organization_id
  INTO current_user_role, current_user_org
  FROM profiles
  WHERE id = current_user_id;

  IF current_user_role IS NULL THEN
    RETURN false;
  END IF;

  SELECT role, organization_id
  INTO target_student_role, target_student_org
  FROM profiles
  WHERE id = target_student_id;

  -- Scope helper strictly to student targets.
  IF target_student_role IS NULL OR target_student_role <> 'student' THEN
    RETURN false;
  END IF;

  IF current_user_role = 'student' THEN
    RETURN current_user_id = target_student_id;
  END IF;

  IF current_user_role NOT IN ('teacher', 'admin') THEN
    RETURN false;
  END IF;

  -- Teacher/admin access is tenant-scoped.
  IF current_user_org IS NULL
    OR target_student_org IS NULL
    OR current_user_org <> target_student_org
  THEN
    RETURN false;
  END IF;

  IF current_user_role = 'admin' THEN
    RETURN true;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM class_enrollments ce
    INNER JOIN classes c ON ce.class_id = c.id
    WHERE c.teacher_id = current_user_id
      AND ce.student_id = target_student_id
      AND ce.status = 'active'
  ) INTO has_access;

  RETURN has_access;
END;
$$;

COMMENT ON FUNCTION user_can_view_student(uuid) IS
'Returns true when current user can view a target student: student self-read, or teacher/admin access scoped to same organization (teacher additionally requires active enrollment link).';

DROP POLICY IF EXISTS "Students can view their own competency records" ON student_competency;
CREATE POLICY "Students can view their own competency records"
  ON student_competency
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'student'
    )
  );

DROP POLICY IF EXISTS "Teachers can view enrolled students competency records" ON student_competency;
DROP POLICY IF EXISTS "Teachers and admins can view scoped student competency records" ON student_competency;
CREATE POLICY "Teachers and admins can view scoped student competency records"
  ON student_competency
  FOR SELECT
  TO authenticated
  USING (
    user_can_view_student(student_id)
    AND EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('teacher', 'admin')
    )
  );
