# Refactor Investigation (Architecture + Algorithms)

## Scope
This document reviews the current `bus-math-v2` architecture and identifies high-impact refactors.
It focuses on runtime architecture, data flow, security boundaries, and algorithmic efficiency.

## Executive Findings
1. The codebase currently has **parallel architectures** for the same responsibilities (lesson rendering, phase completion, DB migration flow, data access clients), creating drift and dead paths.
2. There are **security boundary weaknesses** caused by broad API exposure and direct DB usage that bypasses RLS guardrails.
3. Key data paths contain **N+1 and repeated-call algorithms** that will not scale cleanly with more students, phases, and activities.
4. Several large components contain valuable logic, but they are implemented as **monolithic UI+domain blocks** with low reuse and hard-to-test behavior.

## Deep Findings And Recommendations

### 1) Consolidate Database Migration Source Of Truth

**Evidence**
- Supabase deployment flow only applies `supabase/migrations/**`: `.github/workflows/deploy-migrations.yml`.
- Critical DB objects exist only in Drizzle migrations, not Supabase migrations:
  - `drizzle/migrations/0005_gifted_shotgun.sql` (`activity_completions` table)
  - `drizzle/migrations/0006_complete_activity_atomic.sql` (`complete_activity_atomic` function)
  - `drizzle/migrations/0007_activity_completions_rls.sql` (RLS policies)
- Runtime endpoint depends on this RPC: `app/api/activities/complete/route.ts`.

**Risk**
- Environments deployed via Supabase workflow can drift from local/dev assumptions.
- Runtime endpoints may depend on functions/tables not deployed through the active pipeline.

**Refactor**
- Make `supabase/migrations/` the single migration pipeline.
- Port missing Drizzle-only migrations into timestamped Supabase migrations.
- Add a CI drift check: fail build if schema objects used in `app/api` are absent from Supabase migration history.

---

### 2) Fix API Security Boundaries And RLS Posture

**Evidence**
- `proxy.ts` treats all `/api` routes as public (`publicRoutes` includes `'/api'`).
- `app/api/activities/[activityId]/route.ts` has no auth check and returns raw activity data.
- Activity configs can include answer keys (`correctAnswer`) in schema:
  - `lib/db/schema/activities.ts` (`comprehension-quiz` props).
- Several routes use Drizzle directly (`app/api/activities/[activityId]/route.ts`, spreadsheet routes), bypassing RLS enforcement by design.
- Debug/test endpoints remain present:
  - `app/api/test-db/route.ts`
  - `app/api/test-supabase/route.ts`
  - `app/protected/db-test/page.tsx`

**Risk**
- Assessment answers can be leaked to clients.
- Public API blast radius is broader than intended.
- Security model becomes “route author discipline” instead of DB policy enforcement.

**Refactor**
- Remove blanket public API allowance in `proxy.ts`; create explicit public API allowlist.
- Add auth + role checks to activity-fetch endpoints, or move activity delivery to server-rendered payload path.
- Introduce “student-safe activity DTO” that strips answer keys and grading internals before sending to client.
- Gate debug/test endpoints behind environment + secret header, or remove from production code paths.
- Prefer Supabase server client for user-scoped reads/writes where RLS should be authoritative.

---

### 3) Unify Duplicate Phase Completion Flows

**Evidence**
- Two separate completion APIs exist:
  - `app/api/phases/complete/route.ts`
  - `app/api/progress/phase/route.ts`
- Two client paradigms exist:
  - `hooks/usePhaseCompletion.ts` (targets `/api/phases/complete`)
  - `components/lesson/PhaseCompleteButton.tsx` (targets `/api/progress/phase`)
- `usePhaseCompletion` appears unused by runtime routes/components (test-only reference surface).

**Risk**
- Divergent behavior, inconsistent idempotency semantics, duplicated tests, and maintenance overhead.

**Refactor**
- Select one canonical phase completion contract.
- Remove or archive the alternate route/hook once migration is complete.
- Centralize shared concerns: request schema, idempotency strategy, error taxonomy.

---

### 4) Resolve Lesson Rendering Architecture Split (Dead/Parallel Paths)

**Evidence**
- Runtime lesson page uses: `components/student/LessonRenderer.tsx`.
- `components/student/LessonRenderer.tsx` renders activity blocks as placeholders, not live activity components.
- Rich rendering pipeline exists separately:
  - `components/lesson/PhaseRenderer.tsx`
  - `components/lesson/ActivityRenderer.tsx`
- `PhaseRenderer` and `ActivityRenderer` appear effectively isolated from runtime lesson flow.

**Risk**
- Production behavior diverges from the intended architecture.
- Activity logic can be tested but never executed in live lesson flow.

**Refactor**
- Merge onto one canonical lesson/phase rendering pipeline.
- Use `PhaseRenderer` in runtime lesson path (or deprecate it and migrate features into `components/student/LessonRenderer.tsx`).
- Delete placeholder-only activity rendering once integrated.

---

### 5) Remove High-Cost N+1 / Repeated-Call Algorithms

**Evidence**
- Student lesson access fallback checks phase access in a reverse loop with repeated RPCs:
  - `app/student/lesson/[lessonSlug]/page.tsx` (loop over `can_access_phase`).
- Teacher dashboard fetches student progress by calling RPC once per student:
  - `app/teacher/page.tsx` (`Promise.all(students.map(...supabase.rpc("get_student_progress")))`).
- Client progress status derivation in `usePhaseProgress` and `LessonRenderer` repeatedly calls `find` inside maps (avoidable quadratic patterns at scale).

**Risk**
- Increased latency and DB load with larger classes/lessons.
- Unnecessary network round trips per request.

**Refactor**
- Add bulk RPCs:
  - `get_accessible_phase_window(lesson_id)` (single call for lesson access decisions).
  - `get_student_progress_for_org(org_id)` or `get_student_progress_bulk(student_ids[])`.
- Pre-index progress by `phaseId` (Map lookup) in client derivations.
- For server paths, compute final access target in SQL once.

---

### 6) Fix Caching Semantics In `usePhaseProgress`

**Evidence**
- `hooks/usePhaseProgress.ts` uses a module-level cache with 60s stale time.
- `refetch` reuses the same function that returns cached data if still fresh.
- This can block immediate UI refresh after completion updates.

**Risk**
- Users can complete a phase and still see stale lock/progress states until cache expires.

**Refactor**
- Add `force` parameter to bypass cache during explicit refetch.
- Invalidate cache on successful completion mutation.
- Consider replacing custom cache with SWR/React Query for coherent invalidation.

---

### 7) Decompose Monolithic Domain Components Into Pure Engines

**Evidence**
- Large UI+algorithm files:
  - `components/financial-calculations/BreakEvenAnalysisCalculator.tsx`
  - `components/business-simulations/InventoryManager.tsx`
  - `components/business-simulations/LemonadeStand.tsx`
  - `components/business-simulations/PitchPresentationBuilder.tsx`
- Game/calculator logic is embedded in component state handlers; stochastic behavior is not injected.

**Risk**
- Hard to test deterministic logic.
- Reuse across activity types is limited.
- Refactors are high-risk because UI and business logic are tightly coupled.

**Refactor**
- Extract pure domain modules in `lib/domain/**`:
  - deterministic calculation functions
  - state transition reducers (`advanceDay`, `orderStock`, goal-seek/data-table builders)
  - injectable RNG interface for tests
- Keep components as adapters over domain functions.

---

### 8) Normalize Spreadsheet Validation Into One Canonical Engine

**Evidence**
- Spreadsheet validation logic exists in multiple places:
  - server-side: `lib/activities/spreadsheet-validation.ts`
  - client helper: `components/spreadsheet/SpreadsheetHelpers.ts` (`validateFormula`, `validateSpreadsheetData`)
  - component-local validation: `components/activities/SpreadsheetEvaluator.tsx`
- Allowed formula sets differ across files.

**Risk**
- “Pass client, fail server” behavior.
- Security logic drift over time.

**Refactor**
- Create a shared validation core with clear split:
  - server security validation (authoritative)
  - optional client UX pre-validation (same rule definitions)
- Keep formula whitelist and dangerous pattern checks in one source.

---

### 9) Modularize `activities.ts` Schema Megafile

**Evidence**
- `lib/db/schema/activities.ts` is very large and combines:
  - schema definitions
  - defaults
  - props unions
  - type exports
  - table definition
- Registry typing currently falls back to `ComponentType<any>`: `lib/activities/registry.ts`.

**Risk**
- High merge conflict frequency.
- Hard to reason about per-activity contracts.
- Reduced type safety at render boundary.

**Refactor**
- Split activity prop schemas by domain:
  - `lib/activities/schemas/quiz.ts`
  - `lib/activities/schemas/spreadsheet.ts`
  - `lib/activities/schemas/simulations/*.ts`
- Rebuild union/index from module registry.
- Replace `ComponentType<any>` with key-to-props mapping + typed component contract.

---

### 10) Eliminate Stale Template/Placeholder Surface

**Evidence**
- Legacy starter/template areas still present:
  - `app/protected/layout.tsx`
  - `app/protected/page.tsx`
  - `lib/supabase/middleware.ts` (while `proxy.ts` is active)
- Placeholder pages and dead links:
  - `app/admin/dashboard/page.tsx` (placeholder)
  - missing linked routes in `components/header-simple.tsx` and `components/footer.tsx` (`/search`, `/backmatter/glossary`, etc.)

**Risk**
- Navigation broken links, cognitive overhead, and maintenance noise.

**Refactor**
- Remove or archive template routes/components not in product scope.
- Introduce route constants and a route existence test to prevent broken links.

---

### 11) Improve CI Quality Gates For Refactor Safety

**Evidence**
- Current GitHub Actions only deploy migrations (`.github/workflows/deploy-migrations.yml`).
- No CI gate for lint/test/typecheck.
- Test run shows noisy `act(...)` warnings around `hooks/usePhaseCompletion.test.ts`.

**Risk**
- Architectural regressions can merge without automated detection.

**Refactor**
- Add CI workflow for:
  - `npm run lint`
  - `npm test`
  - `tsc --noEmit`
  - optional Playwright smoke on PR label
- Fix `act(...)` warnings to improve signal quality and prevent hidden async state issues.

## Recommended Execution Order
1. Security boundary hardening (`proxy.ts`, activity API redaction/auth, test/debug endpoint gating).
2. Migration source unification (Supabase pipeline as single source of truth).
3. Phase completion path consolidation (single API + client contract).
4. Lesson rendering unification (activate one real renderer path).
5. Performance refactors (bulk RPCs, remove repeated call loops, cache invalidation fix).
6. Domain extraction from monolith components.
7. Schema modularization and typed registry cleanup.
8. Template/dead-surface cleanup and navigation integrity tests.
9. CI quality gates and refactor guardrails.

## Success Criteria
- No duplicate API paths for phase completion.
- No activity answer keys exposed to clients.
- No critical DB object required by runtime missing from `supabase/migrations`.
- Lesson runtime path uses the canonical activity renderer (no placeholder-only activity blocks).
- Teacher/student dashboard and lesson access paths avoid per-item RPC loops.
- CI enforces lint/test/typecheck on PRs.
