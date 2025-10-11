# Math for Business Operations v2 · Full-Stack Architecture

## Overview
The v2 stack keeps to a single deployed application: Next.js on Vercel backed by Supabase (Postgres, Auth, Storage). Every feature should be achievable with these free-tier services, prioritising maintainability over scale. Static assets and server-rendered HTML remain the default; client-side interactivity is added only when pedagogically necessary.

## Layer Responsibilities
- **Presentation (Next.js App Router)**  
  - Server Components fetch curriculum data and render six-phase lessons.  
  - Client Components wrap interactive elements that need browser-only APIs (drag/drop, Excel-like widgets).  
  - Shared layout primitives live in `components/`; page shells in `app/`.
- **Application Logic (Next.js + Supabase client helpers)**  
  - Server Actions handle all mutations (progress updates, teacher notes).  
  - Route handlers support lightweight APIs (e.g., CSV export) reserved for authenticated users.  
  - Middleware enforces auth/role checks using Supabase Auth cookies.
- **Data Layer (Supabase Postgres + Storage)**  
  - Structured tables for curriculum, users, and progress.  
  - Storage buckets for downloadable datasets; metadata stored beside curriculum entries.  
  - Row Level Security gates reads/writes by role.

## Request Flow
1. **Anonymous visitor** hits a lesson URL → Server Component fetches published content from Supabase using the service role on the server. Only public/published fields return.  
2. **Authenticated student** signs in → middleware attaches session; Server Component fetches lesson plus that student’s phase progress; Server Action receives POSTs to mark completion.  
3. **Teacher** accesses dashboard → server-only route aggregates progress via inexpensive SQL views (no real-time). CSV export streams results without loading everything client-side.

## Technology Baseline
- Next.js 15 (App Router) with React 19 and TypeScript 5.
- Supabase JS client (`@supabase/ssr`) for server/browser helpers.
- Tailwind CSS + shadcn/ui primitives for consistent UI.
- Testing stack: Vitest (unit), Playwright or Cypress (E2E) when interaction coverage is required.

Pin versions in `package.json` before shipping to avoid surprises with `latest`.

## Supabase Usage Guidelines
- **Schemas**: keep everything in `public`; use simple UUID primary keys; avoid cascading triggers and PL/pgSQL unless Supabase free tier fully supports it.  
- **Migrations**: generated with Supabase CLI and checked into `supabase/migrations/`. Never hand-edit the SQL after generation.  
- **Seeds**: store sample curriculum + demo accounts in `supabase/seed/` scripts so new environments can be bootstrapped quickly.  
- **RLS**:  
  - Public lessons: `is_published = true`.  
  - Students: may read lessons + their own progress (`student_id = auth.uid()`).  
  - Teachers: may read/write classroom progress via role claim in JWT.  
  - Admin maintenance tasks are done with service role keys in server actions—never sent to the browser.

## Deployment Model
- **Vercel Production** linked to `main`. Preview deploys map to feature branches.  
- Environment variables managed in Vercel/Supabase dashboards; commit `.env.example` with required keys.  
- `next build` must succeed locally before merging. Avoid Incremental Static Regeneration for now; `dynamic = 'force-dynamic'` on lesson routes is acceptable given low traffic.

## Caching & Performance
- Cache curriculum queries per lesson using `revalidateTag('lesson:<slug>')` after mutations; invalidation hooks can live in server actions.  
- Keep payloads lean: select only fields needed for each page.  
- Prefer server-rendered tables over client-side data grids.  
- Monitor Supabase rate limits; batch queries when fetching related data (e.g., lessons + phases).

## Testing Expectations
| Layer | Goal | Tools | Minimum Coverage |
| --- | --- | --- | --- |
| Database | Validate migrations, RLS | Supabase CLI + custom SQL assertions | Each migration has a smoke test seed or verification script |
| Server Actions | Ensure auth + data integrity | Vitest with mocked Supabase client | Happy path + failure path per mutation |
| Components | Rendering + accessibility | React Testing Library | Core lesson shell + any new interactive widget |
| End-to-End | Critical flows | Playwright (sign-in, complete phase, view dashboard) | Run before release or after significant auth changes |

Run `npm run lint` on every commit; add automated checks in CI when budget allows (GitHub Actions free tier).

## Operations & Maintenance
- **Backups**: Rely on Supabase automated backups; schedule manual exports (CSV/SQL) at the end of each semester.  
- **Monitoring**: Use Supabase dashboard metrics; add lightweight logging via `console.error` in server actions + Vercel console for now. Fancy observability is out of scope.  
- **Rotations**: Reset service role keys annually; update `.env` and redeploy.  
- **Incident process**: Roll back by redeploying prior commit; database rollbacks handled manually via Supabase backup restore (rare).

## Future Extensions (When Time Allows)
- Add derived views for analytics instead of heavy queries in the app.  
- Introduce content editing UI for teachers, gated behind RLS and simple forms.  
- Explore offline-friendly exports (static PDF/CSV) if classroom connectivity is unreliable.
