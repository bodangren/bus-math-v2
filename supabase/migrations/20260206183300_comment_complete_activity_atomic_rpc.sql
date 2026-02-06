-- Preserve RPC documentation
COMMENT ON FUNCTION complete_activity_atomic IS
'Atomically completes an activity for the authenticated user with idempotency support.
SECURITY: Derives student_id from auth.uid() to prevent auth bypass attacks.
Uses INSERT ON CONFLICT to prevent race conditions on concurrent requests.
Preserves idempotency keys without overwriting on retries.
Updates activity_completions, student_progress, and student_competency tables in a single transaction.
Returns JSON with success status, next phase unlock status, and completion details.';
