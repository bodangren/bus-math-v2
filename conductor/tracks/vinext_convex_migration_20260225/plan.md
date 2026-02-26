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
  - TODO: remove remaining Supabase dependency usage in legacy data-access helpers/page flows where Convex equivalents are pending.

## Phase 5: Testing and Deployment
- [x] Task 1: Run all Vitest tests to ensure parity. [d4611e1]
- [ ] Task 2: Deploy to Cloudflare using `npx vinext deploy`.
- [ ] Task 3: Configure Convex production instance.

## Known Issues / Tech Debt (captured 2026-02-26 from manual verification)
- `npm run build` + `npx vinext start` fails at server boot:
  - SSR bundle imports `DepParser` as a named export from `fast-formula-parser`, but package is CommonJS in runtime context.
  - Error: `SyntaxError: Named export 'DepParser' not found. The requested module 'fast-formula-parser' is a CommonJS module`.
  - Likely source: `react-spreadsheet` ESM bundle import shape under Vinext SSR CJS interop.
- `npm run dev` login/bootstrap path may still fail locally when Convex runtime/env is not synced:
  - `/api/users/ensure-demo` requires `activities:getProfileByUsername` in deployed/local Convex function registry.
  - `/api/auth/login` and `/api/users/ensure-demo` now call internal Convex functions via admin auth and require `CONVEX_DEPLOY_KEY` at runtime.
  - Error message still indicates function/env mismatch when `npx convex dev` / deployment state is stale.
- `npm run lint` currently fails repository-wide due pre-existing violations (including generated `dist/` artifacts and unrelated legacy modules), which blocks whole-repo lint as a phase gate.
