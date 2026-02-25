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
- [ ] Task 1: We will implement `@convex-dev/auth` to replace Supabase's email/password authentication.
- [ ] Task 2: Update login/signup forms to call Convex auth actions.

## Phase 5: Testing and Deployment
- [ ] Task 1: Run all Vitest tests to ensure parity.
- [ ] Task 2: Deploy to Cloudflare using `npx vinext deploy`.
- [ ] Task 3: Configure Convex production instance.
