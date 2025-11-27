-- Add idempotency_key column to student_progress table
-- This allows for safe retry logic and prevents duplicate completions

ALTER TABLE student_progress
ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Create an index on idempotency_key for faster lookups during upserts
CREATE INDEX IF NOT EXISTS student_progress_idempotency_key_idx
ON student_progress (idempotency_key)
WHERE idempotency_key IS NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN student_progress.idempotency_key IS
'Unique key for idempotent completion requests. Used to prevent duplicate phase completions from retry logic or navigation events.';
