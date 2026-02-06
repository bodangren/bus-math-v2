-- Refactor: unify migration source of truth under supabase/migrations
-- Ports runtime-required objects previously defined only in drizzle/migrations:
-- - activity_completions table + indexes
-- - activity_completions RLS policies

CREATE TABLE IF NOT EXISTS activity_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  activity_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  phase_number INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  idempotency_key UUID NOT NULL,
  completion_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $constraints$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'activity_completions_student_id_profiles_id_fk'
      AND conrelid = 'activity_completions'::regclass
  ) THEN
    ALTER TABLE activity_completions
      ADD CONSTRAINT activity_completions_student_id_profiles_id_fk
      FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'activity_completions_activity_id_activities_id_fk'
      AND conrelid = 'activity_completions'::regclass
  ) THEN
    ALTER TABLE activity_completions
      ADD CONSTRAINT activity_completions_activity_id_activities_id_fk
      FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'activity_completions_lesson_id_lessons_id_fk'
      AND conrelid = 'activity_completions'::regclass
  ) THEN
    ALTER TABLE activity_completions
      ADD CONSTRAINT activity_completions_lesson_id_lessons_id_fk
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
  END IF;
END $constraints$;

CREATE UNIQUE INDEX IF NOT EXISTS activity_completions_student_activity_idx
  ON activity_completions (student_id, activity_id);

CREATE UNIQUE INDEX IF NOT EXISTS activity_completions_idempotency_key_idx
  ON activity_completions (idempotency_key);

CREATE INDEX IF NOT EXISTS idx_activity_completions_student_id
  ON activity_completions (student_id);

CREATE INDEX IF NOT EXISTS idx_activity_completions_lesson_id
  ON activity_completions (lesson_id);

ALTER TABLE activity_completions ENABLE ROW LEVEL SECURITY;

DO $policies$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'activity_completions'
      AND policyname = 'Students can insert own completions'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'activity_completions'
      AND policyname = 'Students can view own completions'
  ) THEN
    CREATE POLICY "Students can view own completions"
      ON activity_completions
      FOR SELECT
      TO authenticated
      USING (student_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'activity_completions'
      AND policyname = 'Teachers can view all completions'
  ) THEN
    CREATE POLICY "Teachers can view all completions"
      ON activity_completions
      FOR SELECT
      TO authenticated
      USING (
        (
          SELECT role FROM profiles WHERE id = auth.uid()
        ) IN ('teacher', 'admin')
      );
  END IF;
END $policies$;

COMMENT ON TABLE activity_completions IS
'Stores student activity completions with RLS enabled.
Students can only insert/view their own records.
Teachers/admins can view all records for analytics.
Records are immutable (no updates/deletes) to maintain audit trail.';
