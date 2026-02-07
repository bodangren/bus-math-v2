# Architecture Reference: Math for Business Operations v2

This is the canonical architecture reference for the v2 system.

## Backend Architecture

### Data Source of Truth
- Supabase PostgreSQL is the source of truth for curriculum, progress, analytics, and auth-linked profile data.
- Schema migrations live in `supabase/migrations/`.
- Seed data lives in `supabase/seed/`.

### Security and RLS Posture
- Authentication is Supabase Auth with username/password flows.
- Private routes are guarded through `lib/supabase/middleware.ts`.
- Authorization is role-based (`student`, `teacher`, `admin`) and enforced by JWT claims plus table policies.
- Service role keys are server-only (API routes/server actions/edge functions), never browser-exposed.

### Data Access Patterns
- App code primarily uses Supabase clients for auth/session-aware operations.
- Drizzle is retained for query ergonomics and type-safe modeling where helpful, not as schema truth.
- Edge functions handle privileged transactional operations (for example, teacher-managed account creation).

## Frontend Architecture

### App Structure
- Next.js App Router (`app/`) for route composition and server/client boundaries.
- Shared component library in `components/`, with teacher/student/course domains separated by folder.
- Reusable utilities and integration code under `lib/`.

### Component Patterns
- shadcn/ui + Radix primitives provide consistent accessible building blocks.
- Tailwind utility classes and existing gradient wrappers preserve v1 visual language.
- Interactive activities and lesson phases are data-driven where needed, while preserving classroom-ready UX.

### Rendering Strategy
- Prefer server-side data fetching for primary lesson/dashboard routes.
- Use client components for interaction-heavy widgets only.
- Keep hydration scope narrow for responsiveness on classroom hardware.

## Full-Stack Integration

### Request Flow
1. Client component or page initiates action/query.
2. Next.js route handler or server action validates session/role.
3. Server calls Supabase (directly or via edge function).
4. Result is normalized and returned to UI for render/update.

### Deployment Model
- Vercel hosts Next.js application.
- Supabase hosts database, auth, storage, and edge functions.
- Environment variables required across environments:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` or publishable key equivalent
  - `SUPABASE_SERVICE_ROLE_KEY` (server only)

### Testing Matrix
- Unit/component tests: Vitest + Testing Library.
- Vitest convention: `__tests__/` is the canonical directory for unit/integration suites. During the consolidation track, legacy co-located tests are still discovered, but new tests should be added under `__tests__/`.
- E2E tests: Playwright specs live in `tests/e2e/`.
- Lint and type checks gate commits and PRs.

## Brownfield Migration Status (v1 -> v2)

### Completed
- Core v1 component migration to Next.js + Supabase-backed v2 foundations.
- Teacher/student auth flows and primary dashboards.
- Conductor-based track workflow for feature/refactor execution.

### In Progress
- Architectural consolidation track (`arch_refactor_20260206`) for:
  - stale docs reference cleanup
  - type centralization
  - test structure unification
  - schema responsibility clarification

### Remaining Cutover Work
- Complete legacy schema deprecation in runtime and seed layers.
- Finish test stabilization and type error elimination.
- Finalize standards for component prop contracts and activity registry typing.

## TDD and Workflow Expectations

- `conductor/workflow.md` is the procedural source of truth.
- Every task follows Red -> Green -> Refactor with auditable plan state changes.
- Phase completion requires automated verification plus explicit user confirmation.
- Track-level changes must keep docs synchronized with implementation reality.
