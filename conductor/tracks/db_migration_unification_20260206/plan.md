# Tasks: Refactor - Database Migration Unification

## Phase 1: Audit And Mapping
- [x] Task: Create migration inventory for runtime-dependent DB objects
    - [x] Task: Enumerate functions/tables/policies used by `app/api/**`
    - [x] Task: Map each dependency to existing `supabase/migrations` or `drizzle/migrations`
    - [x] Task: Record gaps in a migration parity checklist
- [x] Task: Write failing drift check test/script (Red phase)
    - [x] Task: Add automated check that fails when required objects are missing from `supabase/migrations`
    - [x] Task: Run check and confirm it fails with current state

## Phase 2: Supabase Migration Port
- [x] Task: Port `activity_completions` schema migration into `supabase/migrations`
    - [x] Task: Preserve constraints, indexes, and defaults
    - [x] Task: Add idempotent guards (`IF NOT EXISTS`, safe ALTER patterns)
- [x] Task: Port `complete_activity_atomic` function into `supabase/migrations`
    - [x] Task: Preserve security semantics (`SECURITY DEFINER`, `search_path`)
    - [x] Task: Preserve grants and comments
- [x] Task: Port `activity_completions` RLS policies into `supabase/migrations`
    - [x] Task: Verify policy names and roles align with project standards
    - [x] Task: Ensure no policy broadens access unexpectedly

## Phase 3: Verification And Pipeline Enforcement
- [x] Task: Validate migrated objects using local Supabase reset + migration replay (Green phase)
    - [x] Task: Run drift check and confirm pass
    - [x] Task: Run targeted API tests for `/api/activities/complete`
- [x] Task: Wire drift check into CI
    - [x] Task: Add workflow step to fail PRs on migration parity violations
    - [x] Task: Ensure CI output points to missing objects clearly

## Phase 4: Governance And Documentation
- [x] Task: Document migration source-of-truth policy
    - [x] Task: Update Conductor docs to require `supabase/migrations` for deployable schema changes
    - [x] Task: Add notes on handling legacy `drizzle/migrations`
- [x] Task: Add contributor checklist item for migration parity in PR review template/docs
