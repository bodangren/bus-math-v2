-- Migration: RLS Policies for Student Spreadsheet Responses
-- Description: Add RLS policies to student_spreadsheet_responses table
-- Students can manage their own responses. Teachers can view responses for enrolled students.

-- ============================================================================
-- Enable RLS on student_spreadsheet_responses table
-- ============================================================================

ALTER TABLE student_spreadsheet_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own spreadsheet responses
CREATE POLICY "Students can view their own spreadsheet responses"
  ON student_spreadsheet_responses
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Policy: Teachers can view spreadsheet responses of enrolled students
CREATE POLICY "Teachers can view enrolled students spreadsheet responses"
  ON student_spreadsheet_responses
  FOR SELECT
  TO authenticated
  USING (user_can_view_student(student_id));

-- Policy: Students can insert their own spreadsheet responses
CREATE POLICY "Students can insert their own spreadsheet responses"
  ON student_spreadsheet_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Policy: Students can update their own spreadsheet responses
CREATE POLICY "Students can update their own spreadsheet responses"
  ON student_spreadsheet_responses
  FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Policy: Only admins can delete spreadsheet responses
CREATE POLICY "Only admins can delete spreadsheet responses"
  ON student_spreadsheet_responses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Add helpful comment to the table
COMMENT ON TABLE student_spreadsheet_responses IS 'Stores student responses for spreadsheet-based activities with auto-save draft functionality and validation results. Students can manage their own responses, and teachers can view responses for enrolled students.';
