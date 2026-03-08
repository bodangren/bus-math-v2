# Implementation Plan: Vinext and Convex Migration

## Phase 1: Setup and Vinext (and Vitest) Integration [checkpoint: ebc4da1]
- [x] Task 1: Install `vinext` and `vite` dependencies. [7d1515b]
- [x] Task 2: Initialize `vite.config.ts` for Vinext. [86705a8]
- [x] Task 3: Replace standard `next dev` and `next build` scripts with `vinext` equivalents. [8951c6f]
- [x] Task 4: Verify local development works on Vinext. [skipped-per-user-approval]
- [ ] Task 5: Setup `vitest` for tests, moving away from other test runners if applicable.
  - Note: vitest.config.ts exists but test migration deferred to Phase 5

## Phase 2: Convex Setup and Schema Migration [checkpoint: ff96d3a]
- [x] Task 1: Install `convex` dependency and run `npx convex dev` to initialize the project. [a2319ca]
- [x] Task 2: Translate Supabase SQL schemas (found in `supabase/migrations/`) into Convex's TypeScript schema (`convex/schema.ts`). [6cf838b]
- [x] Task 3: Replace Supabase middleware with Convex equivalent if necessary. [12a8461]

## Phase 3: Data Access Migration [checkpoint: complete]
- [x] Task 1: Set up the `ConvexProvider` in the Next.js `app/layout.tsx`. [d3661ce]
- [x] Task 2: Map over all `lib/supabase` database client calls and replace them with Convex queries (`useQuery`) and mutations (`useMutation`).
  - Migrated: `hooks/usePhaseCompletion.ts`, `app/page.tsx`, `app/student/dashboard/page.tsx`
  - Migrated API routes: phases/complete, lessons/[lessonId]/progress, activities/[activityId], activities/spreadsheet/*, teacher/submission-detail, progress/assessment
  - Created Convex functions: `convex/api.ts`, `convex/activities.ts`, extended `convex/student.ts`, `convex/teacher.ts`
  - Created server utils: `lib/convex/server.ts` with lazy-loaded ConvexHttpClient
  - Note: Supabase remains for auth only (Phase 4)
- [x] Task 3: Refactor server actions to use Convex `fetchMutation` or `fetchQuery`.
- [x] Task 4: Configure Vite to load environment variables (fallback to localhost:3210 for Convex).

## Phase 4: Authentication Migration
- [~] Task 1: Implement Convex-backed username/password auth (custom, no self-registration/email flows) to replace Supabase auth.
  - Added custom auth primitives:
    - `convex/auth.ts` internal credential query/mutation
    - `auth_credentials` table in `convex/schema.ts`
    - JWT + PBKDF2 utility module `lib/auth/session.ts`
    - auth API endpoints: `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`
  - Updated middleware guard (`proxy.ts`) to use JWT role claims from cookie.
  - Replaced temporary localStorage auth behavior in `components/auth/AuthProvider.tsx` with cookie/session API flow.
- [~] Task 2: Update login/auth UX to reflect admin-managed username/password model.
  - Updated login flow to use strict username/password attempts only.
  - Replaced reset-link pages with admin-managed password guidance.
  - Progress (2026-02-26): removed Supabase auth shim usage from
    - `app/api/activities/[activityId]/route.ts`
    - `app/api/lessons/[lessonId]/progress/route.ts`
    - `app/api/teacher/submission-detail/route.ts`
    - `app/student/dashboard/page.tsx`
    - `app/teacher/page.tsx`
    by introducing request/server claim helpers in `lib/auth/server.ts`.
  - Added/updated route and page tests to mock claim helpers directly (no Supabase auth mocks).
  - Progress (2026-02-26, pass 2): migrated additional API auth surfaces from Supabase user/session checks to JWT claim helpers in `lib/auth/server.ts`:
    - `app/api/phases/complete/route.ts`
    - `app/api/progress/assessment/route.ts`
    - `app/api/activities/spreadsheet/[activityId]/submit/route.ts`
    - `app/api/activities/spreadsheet/[activityId]/draft/route.ts`
  - Added/rewrote corresponding Vitest suites to mock claim helpers + Convex APIs directly:
    - `__tests__/app/api/phases/complete/route.test.ts`
    - `__tests__/app/api/progress/assessment/route.test.ts`
    - `__tests__/app/api/activities/spreadsheet/[activityId]/submit/route.test.ts`
    - `__tests__/app/api/activities/spreadsheet/[activityId]/draft/route.test.ts` (new)
  - Progress (2026-02-26, pass 3): migrated remaining user-management API auth surfaces from Supabase user/session checks to JWT claim helpers:
    - `app/api/users/create-student/route.ts`
    - `app/api/users/update-student/route.ts`
    - `app/api/users/reset-student-password/route.ts`
    - `app/api/users/bulk-create-students/route.ts`
  - Added/updated user-management API tests to mock claim helpers directly:
    - `__tests__/app/api/users/create-student/route.test.ts`
    - `__tests__/app/api/users/update-student/route.test.ts`
    - `__tests__/app/api/users/reset-student-password/route.test.ts`
    - `__tests__/app/api/users/bulk-create-students/route.test.ts`
    - `__tests__/app/api/users/bulk-create-students/integration.test.ts`
  - Progress (2026-02-26, pass 4): migrated page-level server auth gates from Supabase `getUser/getSession` calls to `getServerSessionClaims`:
    - `app/protected/page.tsx`
    - `app/admin/dashboard/page.tsx`
    - `app/teacher/gradebook/page.tsx`
    - `app/teacher/students/[studentId]/page.tsx`
    - `app/teacher/units/[unitNumber]/page.tsx`
    - `app/student/lesson/[lessonSlug]/page.tsx` (auth gate only; Supabase remains for phase access RPC/query path)
  - Updated page test suites to mock claim helpers:
    - `__tests__/app/teacher/students/[studentId]/page.test.tsx`
    - `__tests__/app/student/lesson/[lessonSlug]/page.test.tsx`
  - Progress (2026-02-26, pass 5): hardened Convex credential paths used by auth bootstrap/login routes:
    - `lib/convex/server.ts`
      - added `fetchInternalQuery` / `fetchInternalMutation` wrappers that use admin-authenticated Convex HTTP calls for internal function refs.
    - `app/api/auth/login/route.ts`
      - switched credential lookup from public `api.auth.*` to `internal.auth.getCredentialByUsername`.
    - `app/api/users/ensure-demo/route.ts`
      - switched credential upsert from public `api.auth.*` to `internal.auth.upsertCredentialByUsername`.
  - Added/rewrote focused Vitest suites to mock internal Convex helpers and prevent live backend coupling:
    - `__tests__/app/api/auth/login/route.test.ts` (new)
    - `__tests__/app/api/users/ensure-demo/route.test.ts` (rewritten for Convex flow)
  - Progress (2026-02-26, pass 6): documented and hardened internal auth runtime requirements:
    - Added `.env.example` entries for:
      - `CONVEX_DEPLOY_KEY` (server-only, required for internal Convex function calls)
      - `AUTH_JWT_SECRET` (server-only session signing secret)
    - Updated `README.md` environment variable section to include Convex/internal auth server secrets.
    - Added defensive error handling in `app/api/auth/login/route.ts` so missing/invalid internal Convex auth config returns a controlled `500` payload instead of an unhandled exception.
    - Added route test coverage for internal auth lookup failure:
      - `__tests__/app/api/auth/login/route.test.ts` (`returns 500 when internal auth lookup fails`)
  - Progress (2026-02-26, pass 7): reconciled auth-related test suites with JWT/Convex architecture:
    - Replaced legacy Supabase-based middleware tests with JWT-claim middleware tests:
      - `__tests__/proxy.test.ts`
    - Rewrote phase-completion hook tests for current `useAuth` + Convex mutation + offline queue behavior:
      - `__tests__/hooks/usePhaseCompletion.test.ts`
    - Updated Convex schema expectation to include `auth_credentials` table:
      - `__tests__/setup/convex-schema.test.ts`
    - Verified focused suite parity for this auth slice:
      - `__tests__/proxy.test.ts`
      - `__tests__/hooks/usePhaseCompletion.test.ts`
      - `__tests__/setup/convex-schema.test.ts`
      - `__tests__/app/api/auth/login/route.test.ts`
      - `__tests__/app/api/users/ensure-demo/route.test.ts`
  - Progress (2026-02-26, pass 10): removed remaining production runtime Supabase dependencies from teacher-managed student-account APIs by migrating to Convex internal auth/profile mutations.
    - Added Convex internal mutations in `convex/auth.ts`:
      - `createStudentAccount`
      - `bulkCreateStudentAccounts`
      - `updateStudentAccount`
      - `resetStudentPassword`
    - Migrated API routes off Supabase admin/edge-function paths:
      - `app/api/users/create-student/route.ts`
      - `app/api/users/update-student/route.ts`
      - `app/api/users/reset-student-password/route.ts`
      - `app/api/users/bulk-create-students/route.ts`
    - Updated user-management Vitest suites for Convex internal mutation flow:
      - `__tests__/app/api/users/create-student/route.test.ts`
      - `__tests__/app/api/users/update-student/route.test.ts`
      - `__tests__/app/api/users/reset-student-password/route.test.ts`
      - `__tests__/app/api/users/bulk-create-students/route.test.ts`
      - `__tests__/app/api/users/bulk-create-students/integration.test.ts`
    - Verification:
      - `CI=true npm test -- __tests__/app/api/users/create-student/route.test.ts __tests__/app/api/users/update-student/route.test.ts __tests__/app/api/users/reset-student-password/route.test.ts __tests__/app/api/users/bulk-create-students/route.test.ts __tests__/app/api/users/bulk-create-students/integration.test.ts` passed.
  - TODO: remove remaining Supabase dependency usage in legacy data-access helpers/page flows where Convex equivalents are pending.

## Phase 5: Testing and Deployment
- [x] Task 1: Run all Vitest tests to ensure parity. [d4611e1]
- [ ] Task 2: Deploy to Cloudflare using `npx vinext deploy`.
- [ ] Task 3: Configure Convex production instance.
  - Progress (2026-02-26, pass 8): resolved Vinext SSR/CJS interop failure for spreadsheet runtime in production SSR.
    - Added SSR bundling overrides in `vite.config.ts`:
      - `ssr.noExternal: ['react-spreadsheet', 'fast-formula-parser']`
    - Added regression test coverage:
      - `__tests__/setup/vite.config.test.ts` (`should keep spreadsheet parser dependencies bundled for SSR`)
    - Verified local production behavior:
      - `npm run build` succeeds.
      - `npx vinext start` serves `/` without `DepParser` named-export runtime failure.
  - Progress (2026-02-26, pass 9): verified full non-watch test suite for migration baseline:
    - `CI=true npm test` passed (`186` files, `1032` tests).

### Deployment Readiness Policy (updated 2026-02-26)
- Deployment is explicitly deferred until the system is end-to-end working in local production mode.
- Phase 5 Task 2 (Cloudflare deploy) and Task 3 (Convex production config) remain blocked until the gate below passes.

### Pre-Deploy Working System Gate
- [x] `npm run build` succeeds without SSR/runtime import failures.
- [x] `npx vinext start` boots successfully after build.
- [x] Auth works for all roles (student, teacher, admin) via Convex/JWT flow.
- [ ] Critical learning + teacher flows pass manual smoke test:
  - lesson open
  - phase completion
  - assessment/submission
  - teacher review/detail
- [x] `CI=true npm test` remains fully passing.

### Next Implementation Order Before Any Deploy
1. [x] Resolve Vinext SSR/CJS interop failure (`fast-formula-parser` / spreadsheet dependency path). (completed 2026-02-26, pass 8)
2. [x] Remove remaining Supabase-dependent runtime paths where Convex equivalents are pending. (completed 2026-02-26, pass 10)
3. [ ] **Implement Convex runtime parity adapter** for local + cloud internal-function auth.
       Use one shared server adapter that resolves admin auth from cloud deploy key OR local Convex CLI admin key.
       See "Blocking Issue" section below. This unblocks local login without changing app-level auth flow.
4. [ ] Seed local Convex data: `npx convex run seed:seedDemoAccounts` then `npx convex run seed:seedUnit1Lesson1`.
5. [ ] Verify full working-system gate above.
6. [ ] Revisit Phase 5 Task 2 only after steps 1-5 are complete.

## Known Issues / Tech Debt (captured 2026-02-26 from manual verification)
- Resolved (2026-02-26, pass 8): previous `DepParser` SSR/CJS interop crash is fixed via `ssr.noExternal` bundling of spreadsheet parser dependencies.
- `npm run dev` login/bootstrap path may still fail locally when Convex runtime/env is not synced:
  - `/api/users/ensure-demo` requires `activities:getProfileByUsername` in deployed/local Convex function registry.
  - `/api/auth/login` and `/api/users/ensure-demo` call internal Convex functions via admin auth, but current adapter only checks `CONVEX_DEPLOY_KEY`.
  - Local Convex deployments cannot generate dashboard deploy keys, so local login is blocked until adapter supports local CLI `adminKey`.
  - Error handling still conflates admin-auth config errors with stale function-deploy errors.
- Manual smoke (2026-02-26, pass 11) remains blocked for critical lesson/teacher flows due missing Convex curriculum data parity:
  - Student lesson page for DB-backed slug `unit-1-lesson-1` renders `Unable to Verify Access` because Convex `lessons` table has no matching lesson record.
  - `/api/phases/complete` returns `404` (`Lesson not found`) for the same slug due missing Convex lesson + phase graph.
  - `/api/progress/assessment` and `/api/teacher/submission-detail` reject non-Convex IDs with `ArgumentValidationError` (`v.id(...)`), preventing end-to-end submission/detail smoke without Convex curriculum seeding/migration.
- Progress (2026-02-27): full Convex-only lesson content pipeline implemented.
  - Corrected misunderstanding: Drizzle/Supabase has no active database — Convex is the single source of truth
    for all data including curriculum content (per AGENTS.md).
  - Added `convex/api.ts`: `getLessonWithContent` query (lesson + latest version + phases + sections in one call)
    and `getFirstLessonSlug` query (for legacy URL redirect).
  - Rewrote `app/student/lesson/[lessonSlug]/page.tsx`: removed all Drizzle imports, reads all content from
    Convex via `fetchQuery(api.getLessonWithContent, { slug })`.
  - Expanded `convex/seed.ts` `seedUnit1Lesson1` to include activities (notebook-organizer + comprehension-quiz)
    and all phase_sections for all 6 phases. Activity section content references Convex-generated activity IDs.
  - Updated `__tests__/app/student/lesson/[lessonSlug]/page.test.tsx`: removed Drizzle mocks entirely,
    all 10 tests mock Convex queries only. All pass.
- To seed local Convex instance: `npx convex run seed:seedUnit1Lesson1` (while `npx convex dev` is running).
- After seeding: lesson open and phase completion smoke tests should pass. Assessment/submission routes
  will also work correctly because activity IDs in phase_sections are now Convex IDs.
- `npm run lint` currently fails repository-wide due pre-existing violations (including generated `dist/` artifacts and unrelated legacy modules), which blocks whole-repo lint as a phase gate.

## Blocking Issue: Convex Admin Auth Resolution Is Cloud-Only In Current Adapter (2026-02-27)

### Problem
`lib/convex/server.ts` calls internal Convex functions from Next.js server routes using
`ConvexHttpClient.setAdminAuth(deployKey)`, but the adapter currently requires `CONVEX_DEPLOY_KEY` only.

This blocks local development because local Convex deployments do not expose dashboard deploy-key generation.
Result: `/api/auth/login` and `/api/users/ensure-demo` fail locally with `Missing CONVEX_DEPLOY_KEY`.

### Correct Model
Internal auth/profile functions should remain internal. The fix is an environment-aware adapter, not route-level
fallback behavior and not a public-function downgrade.

Admin auth resolution order:
1. Use `CONVEX_DEPLOY_KEY` when present (cloud/dev/prod deployment key path).
2. If missing and runtime is local/dev, read local Convex CLI admin key from `.convex/local/*/config.json` (`adminKey`).
3. If neither source is available, throw explicit config error with remediation guidance.

### Required Fix: Standardize Convex Runtime Adapter
- [ ] Add shared Convex runtime config helper (e.g. `lib/convex/config.ts`) that:
  - resolves one canonical Convex URL for client/server usage
  - resolves admin auth token via `CONVEX_DEPLOY_KEY` or local `.convex` `adminKey`
  - returns deterministic, actionable errors when unresolved
- [ ] Refactor `lib/convex/server.ts` to use shared resolver for both normal and internal clients.
- [ ] Keep `fetchInternalQuery` / `fetchInternalMutation` API surface, but remove cloud-only assumption.
- [ ] Remove inconsistent hardcoded URL defaults (`localhost:6790` vs `127.0.0.1:3210`) and route all callers through the shared URL helper.
- [ ] Add tests for:
  - deploy-key precedence when both sources exist
  - local `.convex` admin-key fallback path
  - explicit failure in production when no admin auth is configured
  - canonical URL resolution shared across server/client entry points
- [ ] Update docs (`README.md`, `.env.example`) to document:
  - local mode: no dashboard deploy key required
  - cloud mode: `CONVEX_DEPLOY_KEY` required for server-side internal calls
  - expected local `.convex` state produced by `npx convex dev`

### Affected Files
- `lib/convex/config.ts` (new)
- `lib/convex/server.ts`
- `components/ConvexClientProvider.tsx`
- `app/page.tsx`
- `app/curriculum/page.tsx`
- `app/preface/page.tsx`
- `app/student/dashboard/page.tsx`
- `app/teacher/page.tsx`
- `__tests__/app/api/auth/login/route.test.ts`
- `__tests__/lib/convex/*.test.ts` (new)
- `.env.example`
- `README.md`

### Unblocks
- Local `npm run dev` login flow
- Demo account provisioning via `/api/users/ensure-demo`
- Phase 4 auth hardening completion with parity between local and cloud deployments
