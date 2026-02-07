# Phase 7 Audit: Legacy Lesson/Phase References

Date: 2026-02-07
Track: arch_refactor_20260206

## Scope

This audit catalogs runtime references to the legacy lesson content model (`lessons` + `phases`) and maps each to the versioned model (`lesson_versions`, `phase_versions`, `phase_sections`, `lesson_standards`).

Search basis used during audit:
- Drizzle/Supabase query patterns (`from(lessons)`, `from(phases)`, `from('lessons')`, `from('phases')`, `db.query.lessons.findMany`)
- API route handlers under `app/api/**`
- seed assets under `supabase/seed/**`
- SQL runtime functions in `supabase/migrations/**` that still query `phases`/`lessons`

## Legacy to Versioned Mapping

| Legacy reference | Versioned equivalent |
| --- | --- |
| `phases` row (title, phase_number, estimated_minutes) | `phase_versions` row (`title`, `phase_number`, `estimated_minutes`) scoped by `lesson.current_version_id` |
| `phases.content_blocks` JSONB | `phase_sections` rows ordered by `sequence_order` and transformed into UI blocks |
| `phases.lesson_id` | `phase_versions.lesson_version_id -> lesson_versions.id`; base lesson resolved by `lessons.current_version_id` |
| Lesson display content currently read from `lessons` (`title`, `description`) | `lesson_versions` (`title`, `description`) for active version; keep `lessons` for stable identity (`id`, `slug`, `unit_number`, `order_index`) |
| `student_progress.phase_id` (legacy phase FK) | migrate to reference `phase_versions.id` for versioned progress tracking |

## Inventory: Queries / Pages / Components

1. `app/student/lesson/[lessonSlug]/page.tsx`
- Legacy use: lesson lookup from `lessons`, phase list from `phases` by `lesson_id` and `phase_number`.
- Versioned target: resolve lesson shell by slug (`lessons`), join active `lesson_versions` via `current_version_id`, query `phase_versions` + `phase_sections` for rendered content.

2. `app/student/dashboard/page.tsx`
- Legacy use: `db.query.lessons.findMany({ with: { phases: true } })` and progress join through `phase.id`.
- Versioned target: fetch active `phase_versions` per lesson version; compute progress against versioned phase IDs.

3. `app/curriculum/page.tsx`
- Legacy use: list/query from `lessons` for title/description/unit organization.
- Versioned target: keep `lessons` for ordering/slug identity, source display copy from active `lesson_versions`.

4. `app/preface/page.tsx`
- Legacy use: unit summary content derived from `lessons` fields.
- Versioned target: keep unit shell in `lessons`; derive lesson copy from active `lesson_versions`.

5. `app/page.tsx`
- Legacy use: home stats and unit cards query `lessons` directly.
- Versioned target: stats RPC should count active `lesson_versions`; unit cards should resolve lesson title/description from active versions.

6. `lib/db/test-connection.ts`
- Legacy use: connectivity assertion reads from `lessons`.
- Versioned target: retain lesson-shell assertion or update to dual assertion (`lessons` + `lesson_versions`) depending on final deprecation policy.

## Inventory: API Routes

1. `app/api/lessons/[lessonId]/progress/route.ts`
- Legacy use: existence check on `lessons`; phase progress payload from `phases` + nested `student_progress`.
- Versioned target: validate lesson shell, then fetch phase list from active `phase_versions`; map progress using versioned phase IDs.

2. `app/api/phases/complete/route.ts`
- Legacy use: resolves phase by `phases(lesson_id, phase_number)` and next phase by `phases`.
- Versioned target: resolve `phase_versions` by `(lesson.current_version_id, phase_number)` and use versioned phase IDs for completion + unlock checks.

3. `app/api/users/ensure-demo/route.ts`
- Legacy use: upserts demo lesson into `lessons`, demo phase rows into `phases`.
- Versioned target: keep base lesson upsert; replace `phases` upsert with `lesson_versions` + `phase_versions` + `phase_sections` upserts.

4. `app/api/test/seed-e2e/route.ts`
- Legacy use: inserts `lessons` and `phases` through Drizzle tables.
- Versioned target: insert lesson shell plus active version + versioned phases/sections.

5. `app/api/test/cleanup-e2e/route.ts`
- Legacy use: deletes test lesson from `lessons` expecting cascade to `phases`.
- Versioned target: delete lesson shell and rely on cascade through `lesson_versions -> phase_versions -> phase_sections`.

## Inventory: Seed Files

1. `supabase/seed/02-sample-lessons.sql`
- Legacy use: inserts all lesson content into `lessons` and `phases` (`content_blocks` JSONB).
- Versioned target: replace with versioned seed flow: lesson shell in `lessons`, content in `lesson_versions`/`phase_versions`/`phase_sections`.

2. `supabase/seed/03-unit-1-lesson-1-v2.ts`
- Current state: already versioned for phase content (`lesson_versions`, `phase_versions`, `phase_sections`, `lesson_standards`) but still creates base lesson shell in `lessons`.
- Versioned target: keep base lesson insert (identity row) and ensure `lessons.current_version_id` is set to active version during seed.

## Inventory: SQL Runtime Functions / Queries Still Using Legacy Phase Table

1. `supabase/migrations/20251127070758_add_can_access_phase_rpc.sql` (`can_access_phase`)
- Legacy use: resolves previous phase from `phases` by `(lesson_id, phase_number)`.
- Versioned target: resolve from `phase_versions` scoped to `lessons.current_version_id`.

2. `supabase/migrations/20251114120000_add_get_student_progress_rpc.sql` and `supabase/migrations/20251124000000_fix_get_student_progress_permissions.sql` (`get_student_progress`)
- Legacy use: total phase count computed from global `phases` table.
- Versioned target: count from active `phase_versions` (scoped to enrolled/assigned lessons as applicable).

3. `supabase/migrations/20260206183100_add_complete_activity_atomic_rpc.sql` (`complete_activity_atomic`)
- Legacy use: phase resolution and totals use `phases`; joins `student_progress.phase_id -> phases.id`.
- Versioned target: resolve via `phase_versions` and migrate progress foreign key usage to versioned phase IDs.

4. `supabase/migrations/20251113045312_add_get_curriculum_stats_rpc.sql` (`get_curriculum_stats`)
- Legacy use: lesson counts read from `lessons` only.
- Versioned target: count active `lesson_versions` (published/current) for curriculum-facing totals.

## Implementation Notes for Next Phase 7 Tasks

- Migrate `student_progress.phase_id` semantics before dropping legacy `phases`, otherwise completion/progress APIs and RPCs will break.
- Keep `lessons` as shell identity table during Phase 7 (slug/order/unit), but move user-facing lesson content reads to active `lesson_versions`.
- Update `lessons` schema mapping to include `currentVersionId` once migration is active in all environments.
