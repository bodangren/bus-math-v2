# Migration Parity Checklist

## Purpose
Track runtime DB dependencies used by `app/api/**` and confirm each dependency exists in `supabase/migrations` (source of truth).

## Runtime Dependency Inventory

| Dependency | Used By | Expected In Supabase Migrations | Current Location | Gap |
| --- | --- | --- | --- | --- |
| `can_access_phase(UUID, INTEGER)` RPC | `app/api/phases/complete/route.ts` | `supabase/migrations/20251127070758_add_can_access_phase_rpc.sql` | Supabase migration | No |
| `get_student_progress(UUID)` RPC | `app/teacher/page.tsx` | `supabase/migrations/20251114120000_add_get_student_progress_rpc.sql`, `supabase/migrations/20251124000000_fix_get_student_progress_permissions.sql` | Supabase migrations | No |
| `get_curriculum_stats()` RPC | `app/page.tsx` | `supabase/migrations/20251113045312_add_get_curriculum_stats_rpc.sql` | Supabase migration | No |
| `complete_activity_atomic(...)` RPC | `app/api/activities/complete/route.ts` | `supabase/migrations/*` | `drizzle/migrations/0006_complete_activity_atomic.sql` only | **Yes** |
| `activity_completions` table | `complete_activity_atomic` RPC path | `supabase/migrations/*` | `drizzle/migrations/0005_gifted_shotgun.sql` only | **Yes** |
| `activity_completions` RLS policies | `complete_activity_atomic` + analytics visibility | `supabase/migrations/*` | `drizzle/migrations/0007_activity_completions_rls.sql` only | **Yes** |

## Action Plan

1. Add an automated script that fails when the required objects above are missing from `supabase/migrations`.
2. Port the missing table, RPC, grant/comment, and RLS policies into a timestamped idempotent Supabase migration.
3. Wire the script into CI for pull requests and migration deployment workflow.

## Verification

- Red phase: run `node scripts/check-migration-parity.mjs` before migration port and confirm failure.
- Green phase: run the same command after migration port and confirm success.
- Regression safety: run `/api/activities/complete` tests (`npm test -- __tests__/api/activities-complete.test.ts`).
