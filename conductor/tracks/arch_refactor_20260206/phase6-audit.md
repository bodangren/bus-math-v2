# Phase 6 Audit: Drizzle ↔ Supabase Coupling

Date: 2026-02-07
Track: arch_refactor_20260206

## 1) drizzle-kit usage for schema generation

Active/runtime locations:
- `package.json` dependency: `drizzle-kit` is installed.
- `drizzle.config.ts`:
  - `schema: './lib/db/schema/index.ts'`
  - `out: './drizzle/migrations'`
  - comments explicitly instruct use of `npx drizzle-kit generate/push/migrate`.
- `lib/db/drizzle.ts` doc comment references `DIRECT_URL` for migrations via drizzle-kit.

Historical/documentation references:
- `docs/RETROSPECTIVE.md` references schema diff automation via drizzle-kit.
- `docs/MIGRATION_COMPLETION_CHECKLIST.md` includes drizzle-kit version entry.
- older conductor sprint spec/plan files reference `npx drizzle-kit push` (legacy workflow context).

## 2) Drizzle schema files defining tables (not only types)

`lib/db/schema` currently contains `pgTable(...)` declarations in:
- `activity-completions.ts`
- `activity-submissions.ts`
- `activities-core.ts`
- `class-enrollments.ts`
- `classes.ts`
- `competencies.ts`
- `content-revisions.ts`
- `lesson-versions.ts`
- `lessons.ts`
- `live-responses.ts`
- `live-sessions.ts`
- `organizations.ts`
- `phases.ts`
- `profiles.ts`
- `resources.ts`
- `session-leaderboard.ts`
- `spreadsheet-responses.ts`
- `student-progress.ts`

These files currently serve as both type/query model definitions and implicit schema-definition sources for drizzle-kit generation.

## 3) Parity script existence and function

- Script path exists: `scripts/check-migration-parity.mjs`
- Command executed:
  - `CI=true node scripts/check-migration-parity.mjs`
- Result:
  - `Migration parity check passed.`
  - `Validated 7 runtime DB requirements against supabase migrations.`

Current limitation observed:
- Script validates required objects against `supabase/migrations/*.sql` patterns, but does not yet assert Supabase→Drizzle directional parity across all schema objects.
