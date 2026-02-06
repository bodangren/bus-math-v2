# Tasks: Refactor - Database Migration Unification

## Phase 1: Audit And Mapping
- [ ] Task: Create migration inventory for runtime-dependent DB objects
    - [ ] Task: Enumerate functions/tables/policies used by `app/api/**`
    - [ ] Task: Map each dependency to existing `supabase/migrations` or `drizzle/migrations`
    - [ ] Task: Record gaps in a migration parity checklist
- [ ] Task: Write failing drift check test/script (Red phase)
    - [ ] Task: Add automated check that fails when required objects are missing from `supabase/migrations`
    - [ ] Task: Run check and confirm it fails with current state

## Phase 2: Supabase Migration Port
- [ ] Task: Port `activity_completions` schema migration into `supabase/migrations`
    - [ ] Task: Preserve constraints, indexes, and defaults
    - [ ] Task: Add idempotent guards (`IF NOT EXISTS`, safe ALTER patterns)
- [ ] Task: Port `complete_activity_atomic` function into `supabase/migrations`
    - [ ] Task: Preserve security semantics (`SECURITY DEFINER`, `search_path`)
    - [ ] Task: Preserve grants and comments
- [ ] Task: Port `activity_completions` RLS policies into `supabase/migrations`
    - [ ] Task: Verify policy names and roles align with project standards
    - [ ] Task: Ensure no policy broadens access unexpectedly

## Phase 3: Verification And Pipeline Enforcement
- [ ] Task: Validate migrated objects using local Supabase reset + migration replay (Green phase)
    - [ ] Task: Run drift check and confirm pass
    - [ ] Task: Run targeted API tests for `/api/activities/complete`
- [ ] Task: Wire drift check into CI
    - [ ] Task: Add workflow step to fail PRs on migration parity violations
    - [ ] Task: Ensure CI output points to missing objects clearly

## Phase 4: Governance And Documentation
- [ ] Task: Document migration source-of-truth policy
    - [ ] Task: Update Conductor docs to require `supabase/migrations` for deployable schema changes
    - [ ] Task: Add notes on handling legacy `drizzle/migrations`
- [ ] Task: Add contributor checklist item for migration parity in PR review template/docs
