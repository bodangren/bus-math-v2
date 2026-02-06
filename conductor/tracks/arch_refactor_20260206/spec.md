# Architectural Refactor & Stability — Specification

## Overview
A comprehensive architectural cleanup track that addresses accumulated structural debt across the codebase. This track absorbs Sprint 6 (Quality & Stability) and adds deeper architectural corrections to produce a robust, maintainable foundation for future feature development.

## Problem Statement
The codebase has grown through 4 feature sprints, multiple refactor tracks, and a v1-to-v2 migration. While functionally capable, it has accumulated significant architectural debt:

1. **Stale documentation pointers** — AGENTS.md references 6 `docs/` architecture files that don't exist. The project has moved to a Conductor-first workflow, but the documentation map hasn't caught up. Architectural knowledge needs to live in `conductor/` files.
2. **Dual migration system** — Drizzle schema files (`lib/db/schema/*.ts`) and Supabase SQL migrations (`supabase/migrations/`) coexist as competing sources of truth, requiring manual synchronization and risking schema drift.
3. **Legacy + versioned lesson schema coexistence** — Two data models (`lessons`/`phases` vs `lesson_versions`/`phase_versions`/`phase_sections`) live side by side with no deprecation path. Runtime code may query either.
4. **Monolithic activities schema** — `lib/db/schema/activities.ts` is 1,255 lines covering every activity domain in a single file.
5. **Fragmented test structure** — Three test directories (`/test`, `/__tests__`, `/tests`) plus scattered co-located tests. 20+ failing test files, 200+ TypeScript errors (Sprint 6 scope).
6. **No centralized types** — Types scattered across schema files, inline component definitions, and local type files. No `/types` directory despite being referenced.
7. **Inconsistent component prop patterns** — Mix of database-shaped props and plain props. Activity registry uses `any` types.

## Functional Requirements

### FR-1: Documentation & Conductor Enrichment
- Enrich `conductor/product.md` with the architectural context that was intended for the missing `docs/` files (backend architecture, frontend patterns, full-stack responsibilities, brownfield migration status).
- Create `conductor/architecture.md` as a single consolidated architecture reference covering schema design, RLS posture, component patterns, rendering strategy, deployment model, and testing matrix.
- Update AGENTS.md to replace the `docs/` Documentation Map with references to `conductor/` files.
- Remove or redirect stale `docs/` references (keep `docs/RETROSPECTIVE.md`, `docs/security-api-route-matrix.md`, and `docs/curriculum/` as-is since they serve distinct purposes).

### FR-2: Supabase-First Migration Unification
- Establish Supabase SQL migrations as the single source of truth for schema.
- Demote Drizzle to query-only role: remove schema-management responsibility from `lib/db/schema/*.ts` files. Drizzle schema files become TypeScript representations derived from the Supabase schema (generated or manually synced).
- Remove or archive the `drizzle/migrations/` directory and `drizzle.config.ts` schema-generation config.
- Ensure the existing `scripts/check-migration-parity.mjs` enforces alignment between Drizzle TS types and Supabase SQL.
- Document the new single-direction flow in `conductor/architecture.md`.

### FR-3: Complete Versioned Lesson Schema Migration
- Migrate all runtime queries from legacy `lessons`/`phases` tables to `lesson_versions`/`phase_versions`/`phase_sections`.
- Update all seed files to use the versioned schema exclusively.
- Create a Supabase migration that drops legacy tables (or renames them with a `_deprecated` suffix as a safety net during the track, with full removal as a final task).
- Update all components and API routes that reference legacy schema.

### FR-4: Activities Schema Decomposition
- Split `lib/db/schema/activities.ts` into domain-specific files:
  - `activities-core.ts` — base activity table, shared types, enums
  - `activities-spreadsheet.ts` — spreadsheet-specific JSONB types and validators
  - `activities-quiz.ts` — quiz/comprehension question types
  - `activities-categorization.ts` — drag-and-drop categorization types
  - `activities-simulation.ts` — business simulation types
  - (additional files as the decomposition reveals natural boundaries)
- Create barrel export (`activities/index.ts`) preserving all existing imports.

### FR-5: Test Structure Consolidation (absorbs Sprint 6)
- Consolidate to a single test strategy:
  - `__tests__/` for unit and integration tests (Vitest)
  - `tests/` for E2E tests (Playwright)
  - Remove `/test` directory, relocate its contents
- Fix all 20+ failing test files (Sprint 6 Phase 1 scope).
- Fix all 200+ TypeScript errors in test files (Sprint 6 Phase 2 scope).
- Configure Vitest types properly in `tsconfig.json`.

### FR-6: Centralized Types
- Create `types/` directory with:
  - `types/database.ts` — generated or manually maintained types matching Supabase schema
  - `types/api.ts` — shared request/response types for API routes
  - `types/activities.ts` — activity configuration and submission types
  - `types/curriculum.ts` — lesson, phase, and content block types
- Update imports across the codebase to use centralized types.

### FR-7: Component Prop Standardization
- Audit and standardize component prop interfaces to use database-shaped props from centralized types.
- Replace `any` types in the activity registry (`lib/activities/registry.ts`) with proper typed interfaces.
- Document the prop pattern convention in `conductor/architecture.md`.

## Non-Functional Requirements
- Zero regressions: all existing passing tests must continue to pass.
- No new dependencies without explicit approval.
- Stay within Supabase/Vercel free-tier quotas.
- Each phase produces a commit-worthy, non-breaking state (incremental delivery).

## Acceptance Criteria
- [ ] AGENTS.md Documentation Map points to conductor/ files that exist and contain real architectural content.
- [ ] `drizzle/migrations/` is archived. Supabase SQL is the sole migration source of truth.
- [ ] No runtime queries reference legacy `lessons`/`phases` tables directly.
- [ ] `activities.ts` is decomposed into domain files with a barrel export; no import breaks.
- [ ] Single test directory structure (`__tests__/` + `tests/`). Zero failing tests. Zero TS errors.
- [ ] `types/` directory exists with shared type definitions used across the codebase.
- [ ] Activity registry uses typed interfaces instead of `any`.
- [ ] `npm run lint` and `npx tsc --noEmit` pass clean.

## Out of Scope
- New feature development (Sprint 5 Teacher Command Center completion).
- Content authoring (seeding Units 2-8).
- CI/CD pipeline changes.
- Dependency upgrades (unless blocking a fix, with approval).
- Performance optimization beyond what the refactor naturally improves.
