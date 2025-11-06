-- Performance indexes for frequently queried columns
create index if not exists idx_phases_lesson_id on phases(lesson_id);
create index if not exists idx_student_progress_user_id on student_progress(user_id);
create index if not exists idx_activity_submissions_user_activity on activity_submissions(user_id, activity_id);
create index if not exists idx_live_responses_session_id on live_responses(session_id);

-- JSONB indexes for content queries
create index if not exists idx_phases_content_blocks_gin on phases using gin (content_blocks);
create index if not exists idx_activities_props_gin on activities using gin (props);
