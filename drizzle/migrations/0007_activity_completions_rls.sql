-- Migration: Enable RLS and Create Policies for activity_completions
-- Ensures students can only insert/view their own completions
-- Teachers/admins can view all completions for analytics
-- Prevents auth bypass vulnerabilities

-- Enable Row Level Security on activity_completions table
ALTER TABLE activity_completions ENABLE ROW LEVEL SECURITY;

-- Policy: Students can only insert their own completions
-- This ensures auth.uid() matches student_id at the database level
CREATE POLICY "Students can insert own completions"
  ON activity_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'student'
  );

-- Policy: Students can view their own completions
CREATE POLICY "Students can view own completions"
  ON activity_completions
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Policy: Teachers and admins can view all completions (for analytics/dashboards)
CREATE POLICY "Teachers can view all completions"
  ON activity_completions
  FOR SELECT
  TO authenticated
  USING (
    (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) IN ('teacher', 'admin')
  );

-- Policy: No one can update completions (immutable audit trail)
-- Activity completions are immutable once created for data integrity
-- If corrections are needed, they should be handled through new records or soft deletes

-- Policy: No one can delete completions (immutable audit trail)
-- Activity completions should never be deleted to maintain student progress history
-- If removal is needed, add a 'deleted_at' field for soft deletes instead

-- Add comment for documentation
COMMENT ON TABLE activity_completions IS
'Stores student activity completions with RLS enabled.
Students can only insert/view their own records.
Teachers/admins can view all records for analytics.
Records are immutable (no updates/deletes) to maintain audit trail.';
