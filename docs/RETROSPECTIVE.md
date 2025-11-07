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
- Auto-merge completed after local validation

### Lessons
- Capture Supabase result shapes defensively when using postgres-js

