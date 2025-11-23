-- Add indexes for foreign keys and frequently queried columns to improve performance

-- 1. Foreign Key Indexes (if not already auto-created, good to be explicit)
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_class_id ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student_id ON class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_host_id ON live_sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_class_id ON live_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_activity_id ON live_sessions(activity_id);
CREATE INDEX IF NOT EXISTS idx_resources_lesson_id ON resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_resources_phase_id ON resources(phase_id);

-- 2. Filtering Columns
-- Frequently used in WHERE clauses
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_lessons_unit_number ON lessons(unit_number);
CREATE INDEX IF NOT EXISTS idx_lessons_slug ON lessons(slug);
CREATE INDEX IF NOT EXISTS idx_phases_phase_number ON phases(phase_number);
CREATE INDEX IF NOT EXISTS idx_activities_component_key ON activities(component_key);
CREATE INDEX IF NOT EXISTS idx_resources_resource_type ON resources(resource_type);

-- 3. JSONB GIN Indexes
-- For efficient querying within JSONB columns
CREATE INDEX IF NOT EXISTS idx_profiles_metadata_gin ON profiles USING gin (metadata);
CREATE INDEX IF NOT EXISTS idx_lessons_metadata_gin ON lessons USING gin (metadata);
CREATE INDEX IF NOT EXISTS idx_resources_metadata_gin ON resources USING gin (metadata);
-- CREATE INDEX IF NOT EXISTS idx_class_enrollments_metadata_gin ON class_enrollments USING gin (metadata);

-- 4. Composite Indexes
-- For common query patterns
-- e.g., fetching progress for a user in a specific phase is already covered by UNIQUE constraint,
-- but fetching all progress for a user is covered by idx_student_progress_user_id.
-- Finding a specific lesson by slug is covered by UNIQUE constraint on slug.

-- 5. Partial Indexes
-- Example: If we frequently query active enrollments
CREATE INDEX IF NOT EXISTS idx_class_enrollments_active ON class_enrollments(student_id) WHERE status = 'active';
