# Plan: Sprint 3 - Core Platform Completion (Rebaseline 2026-02-09)

## Phase 1: Baseline Audit And Scope Lock
- [x] Task: Audit current implementation against Sprint 3 spec and lock the remaining scope. [1d7c129]
- [x] Task: Create `conductor/tracks/sprint3_core_platform_20251111/gap-audit.md` with pass/fail matrix for auth, middleware, lesson rendering, progress APIs, and teacher baseline. [1d7c129]
- [x] Task: Convert confirmed gaps into ordered implementation tasks and remove stale items from this plan. [1d7c129]

## Phase 2: Auth, Access, And Seed Reliability
- [x] Task: Align proxy/API behavior with `docs/security-api-route-matrix.md`, including public debug endpoints (`/api/test-db`, `/api/test-supabase`) guarded by env + optional `x-test-api-key`. [0c71565]
- [x] Task: Add/update proxy and API tests for debug endpoint allowlist behavior and deny-by-default enforcement on private `/api/**` routes. [0c71565]
- [x] Task: Reconcile demo provisioning runbook (`supabase/seed/README.md`) with required org-first seed ordering and login-time `ensure-demo` fallback behavior. [1e3537f]

## Phase 3: Data-Driven Lesson Delivery
- [x] Task: Add coverage for server-rendered lesson behavior: `loading.tsx`, `notFound()`, zero-phase error UI, and RPC access-check failure UI. [e45730a]
- [x] Task: Add contract tests for phase section -> content block mapping (`callout`, `activity`, `video`, `image`, markdown fallback) and invalid payload fallback safety. [e45730a]
- [x] Task: Verify curriculum/home DB-fallback behavior against versioned lesson data and lock expected rendering contracts. [97251a5]

## Phase 4: Progress And Assessment Integrity
- [x] Task: Migrate `ActivityRenderer` completion path to canonical `/api/phases/complete` flow (via shared phase-completion client/hook) and preserve UX feedback. [local-uncommitted]
- [x] Task: Define compatibility strategy for `/api/activities/complete` (shim or deprecation) and enforce with tests. [local-uncommitted]
- [x] Task: Expand integration coverage for idempotency conflicts, private-route access control, and server-scored assessment response contracts. [local-uncommitted]

## Phase 5: Teacher Baseline And Release Gate
- [ ] Task: Resolve teacher dashboard dead link (`/teacher/students/[studentId]`) by implementing a baseline student detail route or replacing with explicit non-breaking fallback UX.
- [ ] Task: Add tests for teacher org-scoped roster rendering and details-navigation behavior.
- [ ] Task: Run Sprint 3 quality gates (`npm run lint`, targeted Vitest suites, critical E2E smoke checks).
- [ ] Task: Conductor - User Manual Verification 'Sprint 3 Rebaseline Completion' (Protocol in workflow.md).

## Session Handoff Notes (2026-02-09)

- Phase 4 task implementation is complete locally and uncommitted (`[local-uncommitted]` markers above).
- `ActivityRenderer` now uses canonical `usePhaseCompletion` (`phaseType: do`) instead of direct `/api/activities/complete` calls.
- `/api/activities/complete` is now a compatibility shim that forwards to `/api/phases/complete` with deprecation metadata and replacement hints.
- Expanded API coverage now includes:
  - idempotent replay and same-phase/different-key conflict branches for `/api/phases/complete`
  - auth-provider-error private-route protection for `/api/progress/assessment`
  - server-scoring response contract enforcement (client score metadata ignored)
- Last verification command:
  - `CI=true npm test -- __tests__/components/lesson/ActivityRenderer.test.tsx __tests__/api/activities-complete.test.ts __tests__/app/api/phases/complete/route.test.ts __tests__/app/api/progress/assessment/route.test.ts`
- Next session recommended sequence:
  1. Decide whether to commit Phase 4 task slices individually (per Conductor workflow) or as one squashed WIP commit.
  2. Start Phase 5 by implementing/fixing `/teacher/students/[studentId]` route behavior and adding teacher roster navigation tests.
  3. Run full Sprint 3 quality gates (`npm run lint` + broader test suites) before checkpointing Phase 4/5 completion.
