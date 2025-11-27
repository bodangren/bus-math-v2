-- Add idempotency_key column to student_progress table
-- This allows for safe retry logic and prevents duplicate completions

ALTER TABLE student_progress
ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Create a unique constraint to enforce idempotency at the database level
-- This prevents the same idempotency key from being reused across different phases
-- which would allow race conditions where two concurrent requests with the same
-- idempotency key try to complete different phases
-- Note: We use a unique index with a WHERE clause to allow NULL values
-- (for backward compatibility with existing records without idempotency keys)
CREATE UNIQUE INDEX IF NOT EXISTS student_progress_user_idempotency_key_idx
ON student_progress (user_id, idempotency_key)
WHERE idempotency_key IS NOT NULL;

-- Create an additional unique constraint per phase to prevent different keys
-- from completing the same phase (race condition protection)
CREATE UNIQUE INDEX IF NOT EXISTS student_progress_user_phase_completion_idx
ON student_progress (user_id, phase_id)
WHERE idempotency_key IS NOT NULL AND status = 'completed';

-- Add comment explaining the column
COMMENT ON COLUMN student_progress.idempotency_key IS
'Unique key for idempotent completion requests. Used to prevent duplicate phase completions from retry logic or navigation events. Must be unique per user globally (cannot reuse across phases).';
