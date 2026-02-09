# Plan: Sprint 3 - Core Platform Completion (Rebaseline 2026-02-09)

## Phase 1: Baseline Audit And Scope Lock
- [~] Task: Audit current implementation against Sprint 3 spec and lock the remaining scope.
- [ ] Task: Create `conductor/tracks/sprint3_core_platform_20251111/gap-audit.md` with pass/fail matrix for auth, middleware, lesson rendering, progress APIs, and teacher baseline.
- [ ] Task: Convert confirmed gaps into ordered implementation tasks and remove stale items from this plan.

## Phase 2: Auth, Access, And Seed Reliability
- [ ] Task: Finalize Supabase client patterns (browser/server/admin) and auth provider wiring using test-first updates.
- [ ] Task: Align route/API authorization behavior with `docs/security-api-route-matrix.md`.
- [ ] Task: Ensure deterministic demo org/user seeding and document operational runbook.

## Phase 3: Data-Driven Lesson Delivery
- [ ] Task: Stabilize server-rendered lesson and curriculum page data fetch paths with strict 404/loading behavior.
- [ ] Task: Complete phase content block rendering contract validation and error boundaries.
- [ ] Task: Verify activity registry/data payload parity for migrated components used in Units 1-3 lessons.

## Phase 4: Progress And Assessment Integrity
- [ ] Task: Standardize on canonical phase completion flow (`/api/phases/complete`) across all clients.
- [ ] Task: Enforce server-side assessment scoring and secure submission persistence.
- [ ] Task: Add integration coverage for completion idempotency, access control, and grading responses.

## Phase 5: Teacher Baseline And Release Gate
- [ ] Task: Deliver teacher dashboard baseline with organization-scoped progress accuracy.
- [ ] Task: Run Sprint 3 quality gates (`npm run lint`, targeted Vitest suites, critical E2E smoke checks).
- [ ] Task: Conductor - User Manual Verification 'Sprint 3 Rebaseline Completion' (Protocol in workflow.md).
