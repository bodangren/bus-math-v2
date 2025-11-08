---
title: Project Retrospective
type: retrospective
status: active
created: 2025-11-05
updated: 2025-11-06
---

# Project Retrospective

Focused summary of learnings from Epic #2 (issues #3–#12).

## Infrastructure (Issue #3)
- Supabase connectivity: rely on CLI discovery; document env loading and postgres-js behaviors.
- Action: Add `.env.example` coverage and wrap postgres-js responses; keep docs centralized.

## Content Schema (Issue #4)
- JSONB tables must ship with matching Zod guards; defend against mixed driver outputs.
- Action: Run validator regressions before merging future schema tweaks.

## Users & Progress (Issue #5)
- Profiles mirror auth roles; student progress enforces unique user/phase.
- Action: Build sign-up helper that seeds `profiles` and add duplicate-progress tests.

## Organization (Issue #6)
- Cascading deletes prevent orphaned classes; enums tame enrollment state drift.
- Action: Seed sample classes/enrollments for QA scenarios.

## Real-Time (Issue #7)
- Session lifecycle enum + structured response payloads keep live data consistent.
- Action: Define leaderboard refresh pipeline (trigger or scheduled job).

## Content Validation (Issue #8)
- Revision audits need typed error payloads and nullable reviewer links.
- Action: Extend RLS/policies specifically for editorial workflows.

## Migrations (Issue #9)
- Canonical SQL created to mirror Drizzle; `profiles.id` must reference `auth.users`.
- Action: Automate future diffs via drizzle-kit to avoid manual drift.

## RLS Enforcement (Issue #10)
- Enable RLS before policies; teacher actions verified through cross-table checks.
- Action: Add Supabase client tests that assert policy coverage.

## Validation Utilities (Issue #11)
- Normalized Zod errors aid UI surfaces; unknown activity keys fail fast.
- Action: Wire utilities into seeding/editorial services for early feedback.

## Indexing (Issue #12)
- Added b-tree and GIN indexes to protect analytics performance.
- Action: Monitor Supabase query plans with production data and refine as needed.

## PR #42 - feat/24-task-1-prerequisites--drizzle-zod-schemas--vitest-setup

### Highlights
- Vitest + RTL harness plus schema validators unblock component migration work.
- Mock factories give us fast, DB-shaped fixtures for future unit tests.
- Auto-merge completed after local validation and change-integrator pass.

### Lessons
- Capture Supabase result shapes defensively when using postgres-js.
- Keep brownfield symlinks (e.g., `bus-math-nextjs`) out of TS programs or builds explode.

## PR #43 (Issue #25) - feat/25-task-2-layout--navigation-components-5-components

### Highlights
- Header/footer/navigation/unit sidebars now pull from `Lesson` + `StudentProgress` data, so v2 layouts stay in sync with Supabase payloads.
- Added Vitest suites for all five components (including `ResourceBasePathFixer`) to lock in data-driven behavior before wiring into app routes.
- Hardened tooling by ignoring `.next/` in ESLint and swapping Tailwind plugins to pure ESM so lint/build stay green post-migration.
- Auto-merge completed immediately after local validation + change-integrator run, keeping sprint velocity smooth.

### Lessons
- Progress UI needs both `Phase` metadata and `student_progress` rows; provide helper functions instead of ad-hoc context for easier testing.
- Prefer lightweight primitives over porting every shadcn helper—custom sheet/sidebar knockoffs avoided extra dependencies while meeting UX goals.
- Remember to append retrospective updates as part of change-integrator flow so specs/tests + learnings travel together.
- Capture Supabase result shapes defensively when using postgres-js (applies across layout + data work).

## PR #26 (Issue #26) - feat/26-task-3-student-lesson-components-6-components

### Highlights
- Migrated PhaseHeader/PhaseFooter, lesson overviews, and the Lesson01Phase1 template onto Supabase-backed `Lesson`/`Phase` types with breadcrumb + progress navigation intact.
- Added a generic content-block renderer so JSONB-driven phases can output markdown, callouts, media, and future activities without bespoke JSX rewrites.
- Filled the gap between v1 assumptions and current schema by creating Lesson/Phase test builders plus comprehensive Vitest suites for all six student components.
- Lint/test/build automation now covers the new student surface area, keeping migration work green before wiring into actual routes.

### Lessons
- Lesson records currently lack `unit` metadata beyond `unitNumber`, so UI helpers should accept optional unit context until the schema expands.
- Test data factories need to stay strictly typed—allowing `PartialDeep` for nested overrides required explicitly stripping Date/content fields to keep TS + Next build happy.
- Resource-heavy components (e.g., callout images) should standardize on `next/image` early to avoid lint churn as more legacy JSX lands in v2.

## PR #27 (Issue #27) - feat/27-task-4-unit-structure-components-9-components

### Highlights
- Extended `lessonMetadataSchema` with typed unit content (objectives, assessments, prerequisites, introductions) so Supabase JSON feeds every migrated component.
- Ported the nine legacy unit components into `components/unit/` and rewired them to accept database-shaped props with comprehensive Vitest suites.
- Added a `buildUnitContent` factory to keep test fixtures aligned with the new Zod schema, making it easy to simulate optional metadata permutations.

### Lessons
- Unit metadata fields are only partially populated today, so components must short-circuit gracefully when optional sections like student choices or differentiation are absent.
- Favor anchor-backed buttons instead of `window.open` to keep components server-compatible and avoid unnecessary `use client` directives.
- Embedding introduction videos with no-JS fallbacks (iframe + `<details>` transcript) preserves accessibility while eliminating extra UI dependencies like the v1 `VideoPlayer`.

## PR #46 - feat/28-task-5-interactive-exercises--part-1-6-components

### Highlights
- Ported the six reusable exercise components (drag/drop, quiz, fill-in, journal, reflection, peer critique) into `components/exercises/` with Supabase-shaped props plus `onSubmit` hooks for activity submissions.
- Extended `activityPropsSchemas`, validators, and mock factories so every exercise type (including new drag-drop + journaling schemas) validates end-to-end and can be generated in future tests.
- Added comprehensive Vitest + RTL suites that simulate student flows (mocked DnD context, typed answers, ratings, etc.), keeping lint/test/build all green before shipping.

### Lessons
- Drag/drop UI needs accessible fallbacks—adding select inputs for journal rows keeps tests deterministic and students on keyboards unblocked.
- When stubbing complex libs like `@hello-pangea/dnd`, define typed mock helpers so ESLint/TS don’t regress while we drive interactions via Vitest.
- `activityPropsSchemas` now drive a lot of surface area, so mock factories must default every required field; otherwise Next build fails before PR review.

## PR #47 (Issue #29) - feat/29-task-6-interactive-exercises--part-2a-5-drag-drop-exercises

### Highlights
- Introduced the curriculum-specific drag/drop exercises (`AccountCategorization`, `BudgetCategorySort`, `PercentageCalculationSorting`, `InventoryFlowDiagram`, `RatioMatching`) under `components/drag-drop-exercises/` so Unit 4–7 lessons can load database-driven props instead of hardcoded JSX.
- Expanded `activityPropsSchemas`/`validators` with five new Supabase activity types plus a shared categorization hook, keeping exercise props strongly typed across Drizzle + runtime Zod validation.
- Added a reusable Vitest mock for `@hello-pangea/dnd` and authored focused suites for each exercise, alongside lint/test/build runs, to prove drag-drop behavior and submission wiring end-to-end.

### Lessons
- DnD mocks must be registered before component imports; pulling in the mock helper at the top of each test file prevents real library hydration and keeps handlers controllable.
- Categorization utilities should expose droppable IDs so both components and tests stay in sync—removing string literals avoided brittle assertions while porting multiple exercises.

## PR #48 (Issue #30) - feat/30-task-7-interactive-exercises--part-2b-4-drag-drop-exercises

### Highlights
- Completed Category 5 by migrating the remaining drag/drop exercises (`BreakEvenComponents`, `CashFlowTimeline`, `FinancialStatementMatching`, `TrialBalanceSorting`) into `components/drag-drop-exercises/` with fully Supabase-driven props and submission hooks.
- Extended `activityPropsSchemas`, `ActivityComponentKey`, and the validator union with four new Zod schemas so Drizzle types, runtime validation, and TypeScript all agree on the new activity payloads.
- Added Vitest coverage for each component (mocking the DnD context) to prove scoring, submission payloads, and the new financial metrics/timeline math before wiring them into pages.
- Ran lint, the full Vitest suite, and `next build` to keep the migration streak green and verify the heavier break-even/timeline math doesn’t regress builds.

### Lessons
- Reusing the shared `useCategorizationExercise` hook for category-style exercises keeps drag/drop correctness logic centralized; even timeline-style boards only needed derived metrics layered on top.
- Schema additions must land before components/tests so the Supabase-to-UI contract stays single-sourced; it also prevents `Activity` type unions from falling back to `any`.
- Financial UI that surfaces running totals (break-even, trial balance) benefits from dedicated formatting helpers—wrapping everything in `Intl.NumberFormat` early kept tests deterministic and UI consistent.

## PR #49 (Issue #31) - feat/31-task-8-accounting-visualizations-6-components

### Highlights
- Migrated all six accounting visualization components (simple/detailed T-accounts, multi-ledger view, journal entry display, transaction journal, and trial balance) into `components/accounting/` with Supabase-friendly props.
- Introduced shared accounting contracts (`accounting-types.ts`) plus reusable formatting helpers so every component renders consistent badges, balances, and normal-side math.
- Added Vitest suites for each component covering balance calculations, analytics summaries, and the accounting-equation badge to prove the Supabase-shaped payloads behave identically to v1.

### Lessons
- Complex ledger UIs benefit from centralized formatting + type helpers; without them each component would drift on badge colors and currency rounding.
- Transaction builders need deterministic test data (no `Date.now()` in components) to keep the 30+ minute Vitest suite stable—inject fixtures instead of generating inside the render tree.
- Trial balance grouping logic exposed column-count edge cases; deriving grid classes up front avoids brittle conditionals scattered across JSX.

## PR #50 (Issue #32) - feat/32-task-9-financial-reports-6-components

### Highlights
- Ported the six financial report components (income statements, balance sheets, and cash flow statements) into `components/financial-reports/` so Supabase-fed lessons can render statements without touching legacy JSX.
- Reworked every component to accept typed props only, dropping the v1 defaults and exporting TypeScript contracts so pages/tests share a single data shape.
- Added focused Vitest + RTL suites that exercise profitability badges, ratio calculations, disclosure panels, and detail toggles to lock in the new data-driven behavior before wiring into routes.
- Verified the migration with the full lint/test/build stack to ensure the sizable JSX import doesn’t regress the existing migration surface.

### Lessons
- Percentage/ratio assertions need deterministic fixtures—building explicit statement objects up front kept the Vitest snapshots stable while exercising currency/percentage math.
- Toggleable detail sections should expose unique markers (e.g., “Total Adjustments”) so tests can target UI states without depending on dozens of repeated line items.
- Apostrophes in financial copy (like Stockholders’ Equity) trigger the react/no-unescaped-entities rule; escaping them early avoids lint churn as more complex financial prose lands.
