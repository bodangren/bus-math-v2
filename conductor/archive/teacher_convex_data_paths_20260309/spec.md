# Specification: Teacher Convex Data Paths

## Overview

Teacher-facing pages still split their runtime data access between Convex and legacy Drizzle helpers. The teacher dashboard shell already authenticates through Convex-backed claims, but the course gradebook, unit gradebook, and student detail flows still read profile, progress, and curriculum data through `lib/db/*`. That violates the current project rule that Convex is the source of truth and creates a real risk of teacher views drifting from the production data path.

This track migrates the remaining teacher page data loaders to Convex internal queries, adds the missing page-level tests for those routes, and updates documentation so the teacher analytics surface is described as Convex-backed end to end.

## Functional Requirements

1. Add internal Convex teacher queries for the remaining server-rendered teacher data needs:
   - course overview gradebook data
   - unit gradebook data
   - teacher-scoped student detail snapshot

2. Refactor teacher pages to use those internal Convex queries instead of Drizzle profile/progress/course helpers:
   - `/teacher`
   - `/teacher/gradebook`
   - `/teacher/units/[unitNumber]`
   - `/teacher/students/[studentId]`

3. Preserve existing user-facing behavior for redirects, authorization, gradebook summaries, and student progress displays.

4. Add missing or updated automated tests that verify:
   - teacher pages call internal Convex queries with the session claim profile id
   - unauthorized and unauthenticated flows still redirect correctly
   - the student detail page renders Convex-backed snapshot data
   - the Convex authorization-boundary test covers the new internal teacher query exports

5. Update README to document that teacher dashboards/gradebooks/student detail flows now use Convex-only runtime data access.

## Non-Functional Requirements

1. Follow TDD: write or update tests first, confirm failure against `HEAD`, then implement.
2. Do not add or upgrade dependencies.
3. Keep shell commands non-interactive and unattended-safe.
4. Keep identity-sensitive teacher data behind internal Convex queries.
5. Preserve the existing presentational components and pure gradebook/course-overview assembly behavior.

## Acceptance Criteria

1. No teacher page in `app/teacher/` reads `@/lib/db/drizzle` or `@/lib/db/schema` at runtime.
2. New internal Convex teacher queries are exported as `internalQuery`.
3. Teacher page tests cover `/teacher/gradebook`, `/teacher/units/[unitNumber]`, and the migrated `/teacher/students/[studentId]` data flow.
4. `CI=true npm run lint`, `CI=true npm test`, and `CI=true npm run build` all succeed.
5. The track is archived in Conductor and reflected in `README.md` and `conductor/tracks.md`.

## Out of Scope

1. Reworking the teacher UI layout or chart design.
2. Migrating every historical Drizzle helper outside the teacher page runtime path.
3. Changing curriculum content, grading rules, or the underlying gradebook color logic.
